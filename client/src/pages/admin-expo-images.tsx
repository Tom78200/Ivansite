import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import type { Exhibition } from "@shared/schema";

export default function AdminExpoImages() {
  const [, setLocation] = useLocation();
  const expoId = Number(window.location.pathname.split("/").slice(-2, -1)[0]);
  const [expo, setExpo] = useState<Exhibition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [images, setImages] = useState<{ url: string; caption: string }[]>([]);
  const [addForm, setAddForm] = useState({ caption: "" });
  const [addFile, setAddFile] = useState<File | null>(null);
  const [addError, setAddError] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/exhibitions/${expoId}`)
      .then(res => res.json())
      .then(data => {
        setExpo(data);
        setImages(data.galleryImages || []);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement de l'exposition");
        setIsLoading(false);
      });
  }, [expoId]);

  async function handleAddImage(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    setAddError("");
    if (!addFile) {
      setAddError("Veuillez sélectionner une image.");
      setIsAdding(false);
      return;
    }
    const data = new FormData();
    data.append("image", addFile);
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
    const url = uploadData.imageUrl;
    // Ajout dans la galerie
    const newImages = [...images, { url, caption: addForm.caption }];
    const res = await fetch(`/api/exhibitions/${expoId}/gallery`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newImages)
    });
    if (!res.ok) {
      setAddError("Erreur lors de l'ajout de l'image à la galerie.");
    } else {
      setImages(newImages);
      setAddForm({ caption: "" });
      setAddFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
    setIsAdding(false);
  }

  async function handleDeleteImage(index: number) {
    if (!window.confirm("Supprimer cette image ?")) return;
    const newImages = images.filter((_, i) => i !== index);
    const res = await fetch(`/api/exhibitions/${expoId}/gallery`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newImages)
    });
    if (res.ok) setImages(newImages);
  }

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-white">Chargement...</div>;
  if (error || !expo) return <div className="min-h-screen flex items-center justify-center text-red-400">{error || "Exposition introuvable"}</div>;

  return (
    <div className="min-h-screen bg-black text-white p-8 pt-24 md:pt-32">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-4">Gérer les images de « {expo.title} »</h2>
        <button onClick={() => setLocation("/admin/expos")} className="mb-6 text-blue-400 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Retour aux expositions admin">&larr; Retour aux expositions</button>
        <form onSubmit={handleAddImage} className="bg-white/10 rounded-xl p-6 mb-8 border border-white/20 flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-2">Ajouter une image</h3>
          <input name="imageFile" type="file" accept="image/*" ref={fileInputRef} onChange={e => setAddFile(e.target.files?.[0] || null)} className="p-2 rounded bg-white/20 text-white border border-white/30" required />
          <input name="caption" value={addForm.caption} onChange={e => setAddForm(f => ({ ...f, caption: e.target.value }))} placeholder="Légende (facultatif)" className="p-2 rounded bg-white/20 text-white border border-white/30" />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white rounded p-2 font-semibold mt-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Ajouter à la galerie" disabled={isAdding}>{isAdding ? "Ajout..." : "Ajouter à la galerie"}</button>
          {addError && <div className="text-red-400 text-center mt-2">{addError}</div>}
        </form>
        <h3 className="text-xl font-semibold mb-4">Images de la galerie</h3>
        {images.length === 0 ? (
          <div className="text-white/60 text-center">Aucune image dans la galerie.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((img, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-4 flex flex-col gap-2 border border-white/20">
                <img src={img.url} alt={img.caption} className="w-full h-40 object-cover rounded mb-2 border border-white/10" loading="lazy" />
                <div className="text-sm opacity-80">{img.caption}</div>
                <button className="bg-red-500 hover:bg-red-600 text-white rounded p-2 mt-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" onClick={() => handleDeleteImage(i)} aria-label="Supprimer cette image">Supprimer</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 