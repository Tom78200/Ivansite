import { motion } from "framer-motion";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function ExpositionDetail() {
  const { data: exhibitions } = useExhibitions();
  const [, setLocation] = useLocation();
  const exhibitionId = window.location.pathname.split("/").pop();
  const exhibition = exhibitions?.find(expo => expo.id === Number(exhibitionId));

  useEffect(() => {
    // Faire défiler la page vers le haut au chargement
    window.scrollTo(0, 0);
  }, []);

  if (!exhibition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-playfair mb-4">Exposition non trouvée</h2>
          <button
            onClick={() => setLocation("/expositions")}
            className="text-white/60 hover:text-white transition-colors"
          >
            Retour aux expositions
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Bouton de retour */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => setLocation("/expositions")}
        className="fixed top-20 left-4 md:top-8 md:left-8 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-label="Retour aux expositions"
      >
        <ArrowLeft className="w-6 h-6 text-white" />
      </motion.button>

      {/* Bannière */}
      <section className="relative h-[70vh] overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={exhibition.imageUrl}
            alt={exhibition.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
        </motion.div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-playfair text-white mb-2">
              {exhibition.title}
            </h1>
            <p className="text-xl text-white/80">
              {exhibition.location} • {exhibition.year}
            </p>
            {(exhibition as any).theme && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-white/15 border border-white/25 backdrop-blur-sm">
                <span className="text-sm text-white/85">{(exhibition as any).theme}</span>
              </div>
            )}
            {exhibition.description && (
              <p className="mt-4 text-lg md:text-xl text-white/80 max-w-3xl leading-relaxed">
                {exhibition.description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Description (section complémentaire retirée, description déplacée dans le hero) */}

      {/* Galerie d'images */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <ExpositionMasonry images={(exhibition.galleryImages ?? []) as { url: string; caption: string }[]} />
          </motion.div>
        </div>
      </section>
    </div>
  );
} 

function ExpositionMasonry({ images }: { images: { url: string; caption: string }[] }) {
  const [columns, setColumns] = useState(3);
  const [ratios, setRatios] = useState<number[]>([]);

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 768) setColumns(1);
      else if (w < 1280) setColumns(2);
      else setColumns(3);
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const r: number[] = [];
      for (const im of images) {
        const ratio = await new Promise<number>((resolve) => {
          const img = new Image();
          img.onload = () => resolve(img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1);
          img.onerror = () => resolve(1);
          img.src = im.url;
        });
        r.push(ratio || 1);
      }
      if (!cancelled) setRatios(r);
    }
    load();
    return () => { cancelled = true; };
  }, [images]);

  const cols: { url: string; caption: string }[][] = Array.from({ length: columns }, () => []);
  if (ratios.length === images.length) {
    const heights = Array.from({ length: columns }, () => 0);
    const gapUnit = 1;
    images.forEach((im, idx) => {
      const ratio = ratios[idx] || 1;
      const estimatedHeight = 1 / ratio;
      let minIndex = 0;
      for (let i = 1; i < columns; i++) if (heights[i] < heights[minIndex]) minIndex = i;
      cols[minIndex].push(im);
      heights[minIndex] += estimatedHeight + gapUnit;
    });
  } else {
    images.forEach((im, idx) => cols[idx % columns].push(im));
  }

  if (images.length === 0) return <div className="text-white/60 text-center">Aucune image pour cette exposition.</div>;

  return (
    <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-8">
          {col.map((image, index) => (
            <motion.div
              key={`c${ci}-img-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] } }}
              viewport={{ once: true, margin: "-10%" }}
              className="rounded-lg overflow-hidden group cursor-pointer relative"
            >
              <img
                src={image.url}
                alt={image.caption}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <p className="text-white font-medium text-lg">{image.caption}</p>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}