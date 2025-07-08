import { useState, useRef, useEffect } from "react";
import { useArtworks } from "@/hooks/use-artworks";
import type { Artwork } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

export default function Admin() {
  const [step, setStep] = useState<"auth" | "dashboard">("auth");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { data: artworks, isLoading, refetch } = useArtworks();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [artworksOrder, setArtworksOrder] = useState<Artwork[]>([]);
  const [, setLocation] = useLocation();

  // Formulaire ajout
  const [form, setForm] = useState({
    title: "",
    technique: "",
    year: "",
    dimensions: "",
    description: "",
    imageUrl: "",
    imageFile: null as File | null,
    mode: "url" as "url" | "upload"
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "file") {
      setForm(f => ({ ...f, imageFile: (e.target as HTMLInputElement).files?.[0] || null }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleModeChange = (mode: "url" | "upload") => {
    setForm(f => ({ ...f, mode, imageUrl: "", imageFile: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleAddArtwork(e: React.FormEvent) {
    e.preventDefault();
    setAddError("");
    setAddSuccess("");
    setIsAdding(true);
    try {
      let imageUrl = form.imageUrl;
      // Si upload local, envoyer le fichier à /api/upload
      if (form.mode === "upload" && form.imageFile) {
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
        imageUrl = uploadData.imageUrl;
      }
      const res = await fetch("/api/artworks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          technique: form.technique,
          year: form.year,
          dimensions: form.dimensions,
          description: form.description,
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
          imageUrl: "",
          imageFile: null,
          mode: form.mode
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

  const canSubmit = form.title && form.technique && form.year && ((form.mode === "url" && form.imageUrl) || (form.mode === "upload" && form.imageFile));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setStep("dashboard");
        setError("");
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

  // Remplacer le drag & drop par un champ numérique pour l'ordre
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

  // Section œuvres phares indépendantes
  interface FeaturedWork {
    id: number;
    imageUrl: string;
    title: string;
    description?: string;
    year?: string;
    technique?: string;
  }

  function FeaturedWorksAdmin() {
    const [works, setWorks] = useState<FeaturedWork[]>([]);
    const [form, setForm] = useState<{ title: string; description: string; year: string; technique: string; image: File | null }>({ title: "", description: "", year: "", technique: "", image: null });
    const [editId, setEditId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      fetch("/api/featured-works", { credentials: "include" })
        .then(res => res.ok ? res.json() : [])
        .then(setWorks);
    }, []);

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
      const { name, value, files } = e.target as HTMLInputElement;
      setForm(f => ({ ...f, [name]: files ? files[0] : value }));
    }

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setLoading(true);
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("year", form.year);
      data.append("technique", form.technique);
      if (form.image) data.append("image", form.image);
      const method = editId ? "PUT" : "POST";
      const url = editId ? `/api/featured-works/${editId}` : "/api/featured-works";
      await fetch(url, {
        method,
        body: data,
        credentials: "include"
      });
      setForm({ title: "", description: "", year: "", technique: "", image: null });
      setEditId(null);
      setLoading(false);
      fetch("/api/featured-works", { credentials: "include" })
        .then(res => res.ok ? res.json() : [])
        .then(setWorks);
    }

    async function handleDelete(id: number) {
      if (!window.confirm("Supprimer cette œuvre phare ?")) return;
      await fetch(`/api/featured-works/${id}`, { method: "DELETE", credentials: "include" });
      setWorks(ws => ws.filter(w => w.id !== id));
    }

    function handleEdit(work: FeaturedWork) {
      setForm({ title: work.title, description: work.description || "", year: work.year || "", technique: work.technique || "", image: null });
      setEditId(work.id);
    }

    return (
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Œuvres phares (upload dédié)</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white/10 p-4 rounded mb-8">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Titre" className="p-2 rounded text-black" required />
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="p-2 rounded text-black" />
          <input name="year" value={form.year} onChange={handleChange} placeholder="Année" className="p-2 rounded text-black" />
          <input name="technique" value={form.technique} onChange={handleChange} placeholder="Technique" className="p-2 rounded text-black" />
          <input name="image" type="file" accept="image/*" onChange={handleChange} className="p-2" />
          <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Valider l'ajout ou la modification de l'œuvre">
            {editId ? "Modifier" : "Ajouter"} l'œuvre phare
          </button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ title: "", description: "", year: "", technique: "", image: null }); }} className="text-sm text-gray-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Annuler la modification">Annuler la modification</button>}
        </form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {works.map(work => (
            <div key={work.id} className="bg-white/10 rounded p-4 flex flex-col gap-2">
              <img src={work.imageUrl} alt={work.title} className="w-full h-48 object-cover rounded mb-2" loading="lazy" />
              <div className="font-bold text-lg">{work.title}</div>
              {work.year && <div className="text-sm text-gray-300">{work.year}</div>}
              {work.technique && <div className="text-sm text-gray-400">{work.technique}</div>}
              {work.description && <div className="text-sm text-gray-200 mt-1">{work.description}</div>}
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleEdit(work)} className="bg-yellow-500 hover:bg-yellow-600 text-white rounded px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Modifier cette œuvre">Modifier</button>
                <button onClick={() => handleDelete(work.id)} className="bg-red-500 hover:bg-red-600 text-white rounded px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Supprimer cette œuvre">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (step === "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-xl shadow-xl flex flex-col gap-4 w-full max-w-xs border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Admin</h2>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-3 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            autoFocus
          />
          {error && <div className="text-red-400 text-sm text-center">{error}</div>}
          <button type="submit" className="bg-white text-black font-semibold rounded p-2 mt-2 border border-white hover:bg-white/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Connexion admin">Se connecter</button>
        </form>
      </div>
    );
  }

  // Dashboard : bouton + formulaire d'ajout + affichage des œuvres
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Dashboard Admin</h2>
        <div className="flex justify-end mb-8">
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 font-semibold shadow"
            onClick={() => setLocation("/admin/expos")}
          >
            Gérer les expositions
          </button>
        </div>
        {!showForm && (
          <button
            className="bg-green-500 hover:bg-green-600 text-white rounded p-3 font-semibold mb-8 w-full"
            onClick={() => setShowForm(true)}
          >
            Uploader une œuvre
          </button>
        )}
        {showForm && (
          <form onSubmit={handleAddArtwork} className="bg-white/10 rounded-xl p-6 mb-8 border border-white/20 flex flex-col gap-4">
            <h3 className="text-xl font-semibold mb-2">Ajouter une œuvre</h3>
            <div className="flex gap-4 mb-2">
              <button type="button" onClick={() => handleModeChange("url")} className={`px-3 py-1 rounded ${form.mode === "url" ? "bg-white text-black" : "bg-black text-white border border-white/30"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`} aria-label="Image par URL">Image par URL</button>
              <button type="button" onClick={() => handleModeChange("upload")} className={`px-3 py-1 rounded ${form.mode === "upload" ? "bg-white text-black" : "bg-black text-white border border-white/30"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`} aria-label="Upload local">Upload local</button>
            </div>
            <input name="title" value={form.title} onChange={handleFormChange} placeholder="Titre*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
            <input name="technique" value={form.technique} onChange={handleFormChange} placeholder="Technique*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
            <input name="year" value={form.year} onChange={handleFormChange} placeholder="Année*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
            <input name="dimensions" value={form.dimensions} onChange={handleFormChange} placeholder="Dimensions" className="p-2 rounded bg-white/20 text-white border border-white/30" />
            <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Description" className="p-2 rounded bg-white/20 text-white border border-white/30" rows={2} />
            {form.mode === "url" ? (
              <input name="imageUrl" value={form.imageUrl} onChange={handleFormChange} placeholder="URL de l'image*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
            ) : (
              <input name="imageFile" type="file" accept="image/*" ref={fileInputRef} onChange={handleFormChange} className="p-2 rounded bg-white/20 text-white border border-white/30" required />
            )}
            <div className="flex gap-4 mt-2">
              <button type="submit" className="bg-green-500 hover:bg-green-600 text-white rounded p-2 font-semibold flex-1 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Ajouter l'œuvre">{isAdding ? "Ajout..." : "Ajouter l'œuvre"}</button>
              <button type="button" className="bg-gray-700 hover:bg-gray-800 text-white rounded p-2 font-semibold flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" onClick={() => setShowForm(false)} aria-label="Annuler l'ajout">Annuler</button>
            </div>
            {addError && <div className="text-red-400 text-center mt-2">{addError}</div>}
            {addSuccess && <div className="text-green-400 text-center mt-2">{addSuccess}</div>}
          </form>
        )}
        <h3 className="text-xl font-semibold mb-4">Liste des œuvres</h3>
        {deleteError && <div className="text-red-400 text-center mb-4">{deleteError}</div>}
        {isLoading ? (
          <div>Chargement...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artworks && artworks.map((artwork) => (
                <div key={artwork.id} className="bg-white/10 rounded-xl p-4 flex flex-col gap-2 border border-white/20">
                  <img src={artwork.imageUrl} alt={artwork.title} className="w-full h-32 object-cover rounded mb-2 border border-white/10" loading="lazy" />
                  <div className="font-bold text-lg">{artwork.title}</div>
                  <div className="text-sm opacity-80">{artwork.technique} • {artwork.year}</div>
                  <div className="text-xs opacity-60 mb-2">{artwork.description}</div>
                  <button className="bg-red-500 hover:bg-red-600 text-white rounded p-2 mt-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" onClick={() => handleDelete(artwork.id)} disabled={deletingId === artwork.id} aria-label="Supprimer cette œuvre">Supprimer</button>
                </div>
              ))}
            </div>
          </>
        )}
        <FeaturedWorksAdmin />
      </div>
    </div>
  );
} 