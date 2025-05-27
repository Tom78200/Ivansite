import { useState } from "react";
import { motion } from "framer-motion";
import { useArtworks } from "@/hooks/use-artworks";
import ArtworkLightbox from "@/components/ArtworkLightbox";
import type { Artwork } from "@shared/schema";

export default function Gallery() {
  const { data: artworks, isLoading } = useArtworks();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const openLightbox = (artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setSelectedArtwork(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-playfair"
        >
          Chargement de la galerie...
        </motion.div>
      </div>
    );
  }

  if (!artworks || artworks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-playfair mb-4">Galerie en préparation</h2>
          <p className="text-lg opacity-80">Les œuvres seront bientôt disponibles.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section with Featured Artwork */}
      <section className="relative w-full h-screen overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <img 
            src={artworks[0]?.imageUrl} 
            alt={artworks[0]?.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(210,40%,12%)]" />
        </motion.div>
        
        {/* Floating Artist Name */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-10"
        >
          <h1 className="text-6xl md:text-8xl font-playfair text-white mb-4 tracking-wider">
            IVAN GAUTHIER
          </h1>
          <p className="text-xl text-white opacity-80 tracking-[0.3em] uppercase">
            Artiste Contemporain
          </p>
        </motion.div>
      </section>

      {/* Gallery Grid */}
      <section className="min-h-screen bg-[hsl(210,40%,12%)] py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto px-8"
        >
          <div className="masonry-grid">
            {artworks.slice(1).map((artwork, index) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
                className="artwork-card group cursor-pointer relative overflow-hidden rounded-lg mb-8 break-inside-avoid"
                onClick={() => openLightbox(artwork)}
              >
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title}
                  className="w-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute bottom-0 left-0 right-0 p-6 text-white"
                >
                  <h3 className="text-2xl font-playfair mb-2">{artwork.title}</h3>
                  <p className="text-sm opacity-80">{artwork.technique} • {artwork.year}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <ArtworkLightbox
        artwork={selectedArtwork}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
      />
    </>
  );
}
