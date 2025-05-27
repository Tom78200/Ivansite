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
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="relative w-[90vw] h-[90vh] overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 z-20 bg-black/30 backdrop-blur-sm rounded-full p-3 hover:bg-black/50 transition-all duration-300"
            >
              <X className="text-white" size={24} />
            </button>
            
            {/* Image takes 90% of space */}
            <div className="relative w-full h-[90%]">
              <img 
                src={artwork.imageUrl} 
                alt={artwork.title}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Info panel at bottom - 10% with transparency */}
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-t from-black/80 to-transparent backdrop-blur-sm p-6 flex items-center justify-between"
            >
              <div className="text-white">
                <h3 className="text-2xl font-playfair mb-1">{artwork.title}</h3>
                <p className="text-white/80 text-sm">
                  {artwork.technique} • {artwork.dimensions} • {artwork.year}
                </p>
              </div>
              <div className="text-right text-white/60 text-xs max-w-md">
                <p className="line-clamp-2">{artwork.description}</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
