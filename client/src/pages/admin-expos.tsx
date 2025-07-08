import { useState, useRef } from "react";
import type { Exhibition } from "@shared/schema";

export default function AdminExpos() {
  const [expos, setExpos] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    location: "",
    year: "",
    imageUrl: "",
    description: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverMode, setCoverMode] = useState<"url" | "upload">("url");
  const [step, setStep] = useState<"auth" | "dashboard">("auth");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Charger les expositions au montage
  useState(() => {
    fetch("/api/exhibitions")
      .then(res => res.json())
      .then(data => {
        setExpos(data);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Erreur lors du chargement des expositions");
        setIsLoading(false);
      });
  });

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
        setAuthError("");
      } else {
        const data = await res.json();
        setAuthError(data.error || "Mot de passe incorrect");
      }
    } catch {
      setAuthError("Erreur réseau");
    }
  };

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    setStep("auth");
    setPassword("");
  }

  async function handleAddExpo(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);
    setAddError("");
    try {
      let imageUrl = form.imageUrl;
      if (coverMode === "upload" && fileInputRef.current?.files?.[0]) {
        const data = new FormData();
        data.append("image", fileInputRef.current.files[0]);
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
      const res = await fetch("/api/exhibitions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          imageUrl,
          galleryImages: [],
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || "Erreur lors de l'ajout.");
      } else {
        const newExpo = await res.json();
        setExpos(expos => [...expos, newExpo]);
        setForm({ title: "", location: "", year: "", imageUrl: "", description: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch {
      setAddError("Erreur réseau lors de l'ajout.");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDeleteExpo(id: number) {
    if (!window.confirm("Supprimer cette exposition ?")) return;
    try {
      const res = await fetch(`/api/exhibitions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpos(expos => expos.filter(e => e.id !== id));
      }
    } catch {}
  }

  if (step === "auth") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <form onSubmit={handleSubmit} className="bg-white/10 p-8 rounded-xl shadow-xl flex flex-col gap-4 w-full max-w-xs border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Admin Expositions</h2>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-3 rounded bg-white/20 text-white border border-white/30 focus:outline-none"
            autoFocus
          />
          {authError && <div className="text-red-400 text-sm text-center">{authError}</div>}
          <button type="submit" className="bg-white text-black font-semibold rounded p-2 mt-2 border border-white hover:bg-white/80 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Connexion admin">Se connecter</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <button onClick={handleLogout} className="bg-gray-700 hover:bg-gray-800 text-white rounded p-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Déconnexion admin">Déconnexion</button>
        </div>
        <h2 className="text-3xl font-bold mb-8 text-center">Admin Expositions</h2>
        <form onSubmit={handleAddExpo} className="bg-white/10 rounded-xl p-6 mb-8 border border-white/20 flex flex-col gap-4">
          <h3 className="text-xl font-semibold mb-2">Créer une exposition</h3>
          <input name="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Titre*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
          <input name="location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lieu*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
          <input name="year" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="Année*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
          <div className="flex gap-4 mb-2">
            <button type="button" onClick={() => setCoverMode("url")} className={`px-3 py-1 rounded ${coverMode === "url" ? "bg-white text-black" : "bg-black text-white border border-white/30"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`} aria-label="Image par URL">Image par URL</button>
            <button type="button" onClick={() => setCoverMode("upload")} className={`px-3 py-1 rounded ${coverMode === "upload" ? "bg-white text-black" : "bg-black text-white border border-white/30"} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400`} aria-label="Upload local">Upload local</button>
          </div>
          {coverMode === "url" ? (
            <input name="imageUrl" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="Image de couverture (URL)*" className="p-2 rounded bg-white/20 text-white border border-white/30" required />
          ) : (
            <input name="imageFile" type="file" accept="image/*" ref={fileInputRef} className="p-2 rounded bg-white/20 text-white border border-white/30" required />
          )}
          <textarea name="description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description*" className="p-2 rounded bg-white/20 text-white border border-white/30" rows={2} required />
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white rounded p-2 font-semibold mt-2 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Créer l'exposition">{isAdding ? "Ajout..." : "Créer l'exposition"}</button>
          {addError && <div className="text-red-400 text-center mt-2">{addError}</div>}
        </form>
        <h3 className="text-xl font-semibold mb-4">Liste des expositions</h3>
        {isLoading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div className="text-red-400 text-center mb-4">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {expos.map(expo => (
              <div key={expo.id} className="bg-white/10 rounded-xl p-4 flex flex-col gap-2 border border-white/20">
                <img src={expo.imageUrl} alt={expo.title} className="w-full h-32 object-cover rounded mb-2 border border-white/10" loading="lazy" />
                <div className="font-bold text-lg">{expo.title}</div>
                <div className="text-sm opacity-80">{expo.location} • {expo.year}</div>
                <div className="text-xs opacity-60 mb-2">{expo.description}</div>
                <button className="bg-red-500 hover:bg-red-600 text-white rounded p-2 mt-2 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" onClick={() => handleDeleteExpo(expo.id)} aria-label="Supprimer cette exposition">Supprimer</button>
                <a href={`/admin/expos/${expo.id}/images`} className="bg-blue-500 hover:bg-blue-600 text-white rounded p-2 mt-2 font-semibold text-center">Gérer les images</a>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mt-12 flex justify-center">
        <a href="/admin" className="bg-gray-700 hover:bg-gray-800 text-white rounded p-3 font-semibold">Retour à la gestion des œuvres</a>
      </div>
    </div>
  );
} 