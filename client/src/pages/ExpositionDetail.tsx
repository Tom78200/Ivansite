import { motion } from "framer-motion";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useEffect } from "react";

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
            <h1 className="text-5xl md:text-7xl font-playfair text-white mb-4">
              {exhibition.title}
            </h1>
            <p className="text-xl text-white/80">
              {exhibition.location} • {exhibition.year}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="prose prose-lg prose-invert max-w-none"
          >
            <p className="text-xl text-white/80 leading-relaxed">
              {exhibition.description || "Description de l'exposition à venir..."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Galerie d'images */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {(exhibition.galleryImages || []).length === 0 ? (
              <div className="text-white/60 col-span-full text-center">Aucune image pour cette exposition.</div>
            ) : (
              ((exhibition.galleryImages ?? []) as { url: string; caption: string }[]).map((image: { url: string; caption: string }, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer relative"
                >
                  <img
                    src={image.url}
                    alt={image.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <p className="text-white font-medium text-lg">{image.caption}</p>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
} 