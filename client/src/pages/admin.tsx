import { useState, useRef, useEffect } from "react";
import { useArtworks } from "@/hooks/use-artworks";
import { ARTWORK_CATEGORIES } from "@shared/categories";
import type { Artwork } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Admin() {
  const [step, setStep] = useState<"auth" | "dashboard">("auth");
  const [username, setUsername] = useState("ivan");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data: artworks, isLoading, refetch } = useArtworks();
  const { t } = useLanguage();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [artworksOrder, setArtworksOrder] = useState<Artwork[]>([]);
  const [, setLocation] = useLocation();
  const [addingImagesTo, setAddingImagesTo] = useState<number | null>(null);
  const [additionalImagesFile, setAdditionalImagesFile] = useState<FileList | null>(null);

  // Formulaire ajout
  const [form, setForm] = useState({
    title: "",
    technique: "",
    year: "",
    dimensions: "",
    description: "",
    category: "",
    imageFile: null as File | null
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setForm(f => ({ ...f, imageFile: (e.target as HTMLInputElement).files?.[0] || null }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  // plus de mode URL: uniquement upload fichier

  async function handleAddArtwork(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    setIsAdding(true);
    try {
      if (!form.imageFile) {
        setAddError(t('general.error'));
        setIsAdding(false);
        return;
      }
      const data = new FormData();
      data.append("image", form.imageFile);
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: data
      });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setAddError(err.error || "Erreur lors de l'upload de l'image.");
        setIsAdding(false);
        return;
      }
      const uploadData = await uploadRes.json();
      const imageUrl = uploadData.imageUrl;
      const categoryNormalized = (form.category || "Autres").trim();
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          technique: form.technique,
          year: form.year,
          dimensions: form.dimensions,
          description: form.description,
          category: categoryNormalized,
          imageUrl,
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || "Erreur lors de l'ajout.");
      } else {
        setAddSuccess("Œuvre ajoutée !");
        setForm({
          title: "",
          technique: "",
          year: "",
          dimensions: "",
          description: "",
          category: "",
          imageFile: null
        });
        if (fileInputRef.current) fileInputRef.current.value = "";
        await refetch();
      }
    } catch (e) {
      setAddError("Erreur réseau lors de l'ajout.");
    } finally {
      setIsAdding(false);
    }
  }

  const canSubmit = Boolean(form.title && form.technique && form.year && form.imageFile && (form.category || '').trim());

  // Fonction pour ajouter des images supplémentaires
  async function handleAddAdditionalImages(artworkId: number) {
    if (!additionalImagesFile || additionalImagesFile.length === 0) return;
    
    const formData = new FormData();
    for (let i = 0; i < additionalImagesFile.length; i++) {
      formData.append('images', additionalImagesFile[i]);
    }
    
    try {
      const response = await fetch(`/api/artworks/${artworkId}/additional-images`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        setAddingImagesTo(null);
        setAdditionalImagesFile(null);
        refetch(); // Recharger les œuvres
      } else {
        console.error('Erreur ajout images supplémentaires');
      }
    } catch (error) {
      console.error('Erreur ajout images supplémentaires:', error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        setStep("dashboard");
        setError("");
        // Redirect guards will now pass for subpages
      } else {
        const data = await res.json();
        setError(data.error || "Mot de passe incorrect");
      }
    } catch {
      setError("Erreur réseau");
    }
  };

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setStep("auth");
    setPassword("");
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Supprimer cette œuvre ? Cette action est irréversible.")) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`/api/artworks/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setDeleteError(data.error || "Erreur lors de la suppression.");
      } else {
        await refetch();
      }
    } catch (e) {
      setDeleteError("Erreur réseau lors de la suppression.");
    } finally {
      setDeletingId(null);
    }
  }

  // Section de gestion d'ordre (drag & drop)
  useEffect(() => {
    if (artworks) setArtworksOrder([...artworks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }, [artworks]);

  function handleOrderChange(id: number, newOrder: number) {
    setArtworksOrder(prev => prev.map(a => a.id === id ? { ...a, order: newOrder } : a).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }

  async function handleSaveOrder() {
    await fetch("/api/artworks/order", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(artworksOrder.map(a => ({ id: a.id, order: a.order ?? 0 })))
    });
    await refetch();
  }

  function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = Array.from(artworksOrder);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    // réattribuer des ordres séquentiels
    const reindexed = items.map((a, idx) => ({ ...a, order: idx }));
    setArtworksOrder(reindexed);
  }

  // (section œuvres phares supprimée)

  if (step === "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <form onSubmit={handleSubmit} className="bg-white/10 p-6 sm:p-8 rounded-xl shadow-xl flex flex-col gap-4 w-full max-w-xs border border-white/20">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center">Admin</h2>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="p-3 rounded bg-white/20 text-white border border-white/30 focus:outline-none text-sm sm:text-base"
            placeholder="Nom d’utilisateur"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-3 rounded bg-white/20 text-white border border-white/30 focus:outline-none text-sm sm:text-base"
            autoFocus
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" className="bg-white text-black font-semibold rounded p-2 mt-2 border border-white hover:bg-white/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-sm sm:text-base" aria-label="Connexion admin">Se connecter</button>
        </form>
      </div>
    );
  }

  // Dashboard : bouton + formulaire d'ajout + affichage des œuvres
  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">Dashboard Admin</h2>
        <div className="flex justify-end mb-6 sm:mb-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 sm:px-4 py-2 font-semibold shadow text-sm sm:text-base"
            onClick={() => setLocation("/admin/expos")}
          >
            Gérer les expositions
          </button>
        </div>
        {!showForm && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white rounded p-3 font-semibold mb-6 sm:mb-8 w-full text-sm sm:text-base"
            onClick={() => setShowForm(true)}
          >
            Uploader une œuvre
          </button>
        )}
        {showForm && (
          <form onSubmit={handleAddArtwork} className="bg-white/10 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20 flex flex-col gap-3 sm:gap-4">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">Ajouter une œuvre</h3>
            <input name="title" value={form.title} onChange={handleFormChange} placeholder="Titre*" className="p-2 rounded bg-white/20 text-white border border-white/30 text-sm sm:text-base" required />
            <input name="technique" value={form.technique} onChange={handleFormChange} placeholder="Technique*" className="p-2 rounded bg-white/20 text-white border border-white/30 text-sm sm:text-base" required />
            <input name="year" value={form.year} onChange={handleFormChange} placeholder="Année*" className="p-2 rounded bg-white/20 text-white border border-white/30 text-sm sm:text-base" required />
            <input name="dimensions" value={form.dimensions} onChange={handleFormChange} placeholder="Dimensions" className="p-2 rounded bg-white/20 text-white border border-white/30 text-sm sm:text-base" />
            <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="p-2 rounded bg-white/20 text-white border border-white/30 text-sm sm:text-base" rows={2} />
            <select name="category" value={form.category} onChange={handleFormChange} className="p-2 rounded bg-white/20 text-white border border-white/30 text-sm sm:text-base">
              <option value="" className="text-black">Choisir une catégorie…</option>
              {ARTWORK_CATEGORIES.map((c) => (
                <option key={c} value={c} className="text-black">{c}</option>
              ))}
            </select>
            <input name="imageFile" type="file" accept="image/*" ref={fileInputRef} onChange={handleFormChange} className="p-2 rounded bg-white/20 text-white border border-white/30 text-sm sm:text-base" required />
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
              <button type="submit" disabled={!canSubmit} className="bg-green-500 hover:bg-green-600 text-white rounded p-2 font-semibold flex-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-sm sm:text-base" aria-label="Ajouter l'œuvre">{isAdding ? "Ajout..." : "Ajouter l'œuvre"}</button>
              <button type="button" className="bg-gray-700 hover:bg-gray-800 text-white rounded p-2 font-semibold flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-sm sm:text-base" onClick={() => setShowForm(false)} aria-label="Annuler l'ajout">Annuler</button>
            </div>
            {addError && <div className="text-red-400 text-center mt-2 text-sm">{addError}</div>}
            {addSuccess && <div className="text-green-400 text-center mt-2 text-sm">{addSuccess}</div>}
          </form>
        )}
        {/* Ordre des œuvres */}
        <div className="mt-8 sm:mt-10 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <h3 className="text-lg sm:text-xl font-semibold">Ordre des œuvres (glisser‑déposer)</h3>
            <button onClick={handleSaveOrder} className="bg-blue-600 hover:bg-blue-700 text-white rounded px-3 sm:px-4 py-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-sm sm:text-base">Enregistrer l'ordre</button>
          </div>
          <div className="bg-white/10 rounded-xl p-3 sm:p-4 border border-white/20">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="artworks-order">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2">
                    {artworksOrder.map((a, index) => (
                      <Draggable draggableId={String(a.id)} index={index} key={a.id}>
                        {(prov) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className="flex items-center gap-2 sm:gap-3 bg-black/40 border border-white/10 rounded p-2">
                            <span className="w-6 sm:w-8 text-center text-xs sm:text-sm opacity-70">{index + 1}</span>
                            <img src={a.imageUrl} alt={a.title} className="w-10 h-10 sm:w-14 sm:h-14 object-cover rounded border border-white/10" />
                            <div className="flex-1 overflow-hidden">
                              <div className="truncate font-semibold text-sm sm:text-base">{a.title}</div>
                              <div className="text-xs opacity-60 truncate">{a.technique} • {a.year}</div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-4">Liste des œuvres</h3>
        {deleteError && <div className="text-red-400 text-center mb-4 text-sm">{deleteError}</div>}
        {isLoading ? (
          <div className="text-sm sm:text-base">Chargement...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {artworks && artworks.map((artwork) => (
                <div key={artwork.id} className="bg-white/10 rounded-xl p-3 sm:p-4 flex flex-col gap-2 border border-white/20">
                  <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-24 sm:h-32 object-cover rounded mb-2 border border-white/10" loading="lazy" />
                  <div className="font-bold text-base sm:text-lg">{artwork.title}</div>
                  <div className="text-xs sm:text-sm opacity-80">{artwork.technique} • {artwork.year}</div>
                  <div className="text-xs opacity-60 mb-2 line-clamp-2">{artwork.description}</div>
                  {artwork.category && (
                    <div className="inline-block text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/20 w-max">{artwork.category}</div>
                  )}
                  {artwork.additionalImages && artwork.additionalImages.length > 0 && (
                    <div className="text-xs opacity-60">+{artwork.additionalImages.length} image(s) supplémentaire(s)</div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <button 
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 font-semibold flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-xs sm:text-sm" 
                      onClick={() => setAddingImagesTo(artwork.id)}
                      disabled={artwork.additionalImages && artwork.additionalImages.length >= 3}
                    >
                      {artwork.additionalImages && artwork.additionalImages.length >= 3 ? 'Max atteint' : 'Ajouter photos'}
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white rounded p-2 font-semibold flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-xs sm:text-sm" onClick={() => handleDelete(artwork.id)} disabled={deletingId === artwork.id} aria-label="Supprimer cette œuvre">Supprimer</button>
                  </div>
                  
                  {/* Formulaire d'ajout d'images supplémentaires */}
                  {addingImagesTo === artwork.id && (
                    <div className="mt-4 p-3 bg-white/5 rounded border border-white/10">
                      <h4 className="text-xs sm:text-sm font-semibold mb-2">Ajouter des images supplémentaires</h4>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*" 
                        onChange={(e) => setAdditionalImagesFile(e.target.files)}
                        className="w-full p-2 rounded bg-white/20 text-white border border-white/30 mb-2 text-xs sm:text-sm"
                      />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => handleAddAdditionalImages(artwork.id)}
                          disabled={!additionalImagesFile || additionalImagesFile.length === 0}
                          className="bg-green-500 hover:bg-green-600 text-white rounded p-2 font-semibold flex-1 disabled:opacity-50 text-xs sm:text-sm"
                        >
                          Ajouter
                        </button>
                        <button 
                          onClick={() => {
                            setAddingImagesTo(null);
                            setAdditionalImagesFile(null);
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white rounded p-2 font-semibold flex-1 text-xs sm:text-sm"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
        {/* Section œuvres phares supprimée */}
      </div>
    </div>
  );
} 