import { useEffect, useState } from "react";
import { useLocation } from "wouter";

interface FeaturedWork {
  id: number;
  imageUrl: string;
  title: string;
  description?: string;
  year?: string;
  technique?: string;
}

function Lightbox({ work, open, onClose }: { work: FeaturedWork|null, open: boolean, onClose: () => void }) {
  if (!open || !work) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-black rounded-lg p-4 max-w-lg w-full mx-2 relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-2 right-2 text-white text-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Fermer la galerie des œuvres phares">×</button>
        <img src={work.imageUrl} alt={work.title} className="w-full max-h-[60vh] object-contain rounded mb-4" loading="lazy" />
        <h2 className="text-2xl font-bold mb-2">{work.title}</h2>
        <div className="text-sm text-gray-300 mb-1">{[work.year, work.technique].filter(Boolean).join(" • ")}</div>
        {work.description && <div className="text-base text-gray-200 mt-2">{work.description}</div>}
      </div>
    </div>
  );
}

export default function GalleryFeatured() {
  const [works, setWorks] = useState<FeaturedWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FeaturedWork|null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetch("/api/featured-works/public")
      .then(res => res.ok ? res.json() : [])
      .then(setWorks)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="min-h-screen bg-black text-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center mt-24 md:mt-32">Œuvres phares</h1>
        <div className="flex justify-center mb-8">
          <button onClick={() => setLocation("/")} className="text-blue-400 hover:text-blue-300 underline underline-offset-4 px-4 py-2 rounded transition text-base font-medium bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="Retour à la galerie principale">
            ← Retour à la galerie
          </button>
        </div>
        {loading ? (
          <div className="text-center">Chargement…</div>
        ) : (
          <div className="masonry-grid">
            {works.map(work => (
              <div key={work.id} className="artwork-card group cursor-pointer" onClick={() => setSelected(work)}>
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img src={work.imageUrl} alt={work.title} className="w-full h-auto object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </div>
                <div className="bg-black/70 p-4 rounded-b-lg mt-[-1rem] relative z-10">
                  <h3 className="text-xl font-bold mb-1">{work.title}</h3>
                  <div className="text-sm text-gray-300 mb-1">{[work.year, work.technique].filter(Boolean).join(" • ")}</div>
                  {work.description && <div className="text-sm text-gray-200 mt-1">{work.description}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
        <Lightbox work={selected} open={!!selected} onClose={() => setSelected(null)} />
      </div>
    </section>
  );
} 