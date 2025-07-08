import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Artwork } from "@shared/schema";

interface ArtworkLightboxProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtworkLightbox({ artwork, isOpen, onClose }: ArtworkLightboxProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsImageLoaded(false);
    }
  }, [isOpen]);

  if (!artwork) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          role="dialog" aria-modal="true"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ 
              type: "spring",
              damping: 30,
              stiffness: 200,
              mass: 1
            }}
            className="relative w-[90vw] h-[90vh] overflow-hidden rounded-lg bg-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.button
              onClick={onClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute top-2 right-2 z-20 bg-black/60 rounded-full p-2 hover:bg-white/20 active:scale-95 transition-all duration-300 shadow-md border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Fermer la fenêtre d'aperçu"
              whileHover={{ scale: 1.12, rotate: 90 }}
              whileTap={{ scale: 0.93 }}
              style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.25)' }}
            >
              <X className="text-white" size={22} />
            </motion.button>
            
            <motion.div 
              className="relative w-full h-[90%]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <img 
                src={artwork.imageUrl} 
                alt={artwork.title}
                className="w-full h-full object-contain transform-gpu"
                onLoad={() => setIsImageLoaded(true)}
                style={{ 
                  opacity: isImageLoaded ? 1 : 0,
                  transition: 'opacity 0.5s ease-in-out'
                }}
                loading="lazy"
              />
            </motion.div>
            
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ 
                type: "spring",
                damping: 25,
                stiffness: 200,
                delay: 0.2
              }}
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
                <div className="text-white">
                  <motion.h3 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl font-playfair mb-2"
                  >
                    {artwork.title}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ delay: 0.5 }}
                    className="text-base md:text-lg"
                  >
                    {artwork.technique} • {artwork.dimensions} • {artwork.year}
                  </motion.p>
                </div>
                {/* Description cachée sur mobile */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ delay: 0.6 }}
                  className="text-right text-base max-w-md hidden md:block"
                >
                  <p className="line-clamp-2">{artwork.description}</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
