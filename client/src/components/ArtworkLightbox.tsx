import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Artwork } from "@shared/schema";

interface ArtworkLightboxProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtworkLightbox({ artwork, isOpen, onClose }: ArtworkLightboxProps) {
  if (!artwork) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-[hsl(210,40%,12%)] bg-opacity-95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl max-h-screen relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 hover:bg-opacity-30 transition-all duration-300"
            >
              <X className="text-white text-xl" size={20} />
            </button>
            
            <div className="bg-white rounded-xl p-8 max-h-full overflow-auto">
              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <img 
                    src={artwork.imageUrl} 
                    alt={artwork.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <div className="space-y-6 text-[hsl(210,40%,12%)]">
                  <h3 className="text-3xl font-playfair">{artwork.title}</h3>
                  <div className="space-y-3 text-lg">
                    <p><strong>Dimensions:</strong> {artwork.dimensions}</p>
                    <p><strong>Technique:</strong> {artwork.technique}</p>
                    <p><strong>Année:</strong> {artwork.year}</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-3">Description</h4>
                    <p className="leading-relaxed">{artwork.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
