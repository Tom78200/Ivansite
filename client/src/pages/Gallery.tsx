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
    <section className="min-h-screen w-full p-0 m-0">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0 h-screen"
      >
        {artworks.map((artwork, index) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="artwork-hover-glow group cursor-pointer relative overflow-hidden"
            onClick={() => openLightbox(artwork)}
          >
            <img 
              src={artwork.imageUrl} 
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-500" />
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-end p-6"
            >
              <h3 className="text-white text-xl font-playfair drop-shadow-lg">
                {artwork.title}
              </h3>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <ArtworkLightbox
        artwork={selectedArtwork}
        isOpen={isLightboxOpen}
        onClose={closeLightbox}
      />
    </section>
  );
}
