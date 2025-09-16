import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { Artwork } from "@shared/schema";
import TranslatedText from "@/components/TranslatedText";

interface ArtworkLightboxProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtworkLightbox({ artwork, isOpen, onClose }: ArtworkLightboxProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) {
      setIsImageLoaded(false);
      setCurrentImageIndex(0);
    }
  }, [isOpen]);

  const allImages = useMemo(() => (
    artwork ? [artwork.imageUrl, ...(artwork.additionalImages || [])] : []
  ), [artwork]);
  const hasMultipleImages = allImages.length > 1;

  const [isAnimating, setIsAnimating] = useState(false);

  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
    setTimeout(() => setIsAnimating(false), 300);
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
    setTimeout(() => setIsAnimating(false), 300);
  };

  // Gestion du swipe tactile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasMultipleImages) {
      goToNext();
    }
    if (isRightSwipe && hasMultipleImages) {
      goToPrevious();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Précharger l'image suivante pour une transition instantanée
  useEffect(() => {
    if (!isOpen || !hasMultipleImages) return;
    const nextIndex = (currentImageIndex + 1) % allImages.length;
    const url = allImages[nextIndex];
    if (!url) return;
    const img = new Image();
    img.decoding = 'async' as any;
    img.src = url;
  }, [isOpen, hasMultipleImages, currentImageIndex, allImages]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          role="dialog" aria-modal="true"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.3 : 0.45, ease: "easeInOut" }}
        >
          <motion.div
            className="relative w-[95vw] h-[95vh] sm:w-[90vw] sm:h-[90vh] overflow-hidden rounded-lg bg-black/50 will-change-transform"
            onClick={onClose}
            initial={{ scale: reduceMotion ? 1 : 0.97, opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: reduceMotion ? 1 : 0.97, opacity: 0, y: reduceMotion ? 0 : -12 }}
            transition={{ duration: reduceMotion ? 0.3 : 0.5, ease: "easeInOut" }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 bg-black/60 rounded-full p-1.5 sm:p-2 hover:bg-white/20 transition-all duration-300 shadow-md border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              aria-label="Fermer la fenêtre d'aperçu"
            >
              <X className="text-white" size={18} />
            </button>
            
            <div 
              className="relative w-full h-[85%] sm:h-[90%]"
              onTouchStart={(e) => { e.stopPropagation(); onTouchStart(e); }}
              onTouchMove={(e) => { e.stopPropagation(); onTouchMove(e); }}
              onTouchEnd={(e) => { e.stopPropagation(); onTouchEnd(); }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.img 
                  key={currentImageIndex}
                  src={allImages[currentImageIndex]} 
                  alt={`${artwork.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain transform-gpu will-change-transform"
                  onLoad={() => setIsImageLoaded(true)}
                  onClick={(e) => e.stopPropagation()}
                  initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.995 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: reduceMotion ? 1 : 1.005 }}
                  transition={{ duration: reduceMotion ? 0.25 : 0.45, ease: "easeInOut" }}
                  loading="eager"
                  decoding="async"
                  fetchpriority="high"
                />
              </AnimatePresence>
              
              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-white/20 rounded-full p-2 sm:p-3 shadow-md border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer select-none touch-manipulation"
                    aria-label="Image précédente"
                    whileHover={{}}
                    whileTap={{}}
                    transition={{ duration: 0 }}
                    style={{ willChange: 'auto', WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
                  >
                    <span className="text-white text-lg sm:text-xl font-bold">‹</span>
                  </motion.button>
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-white/20 rounded-full p-2 sm:p-3 shadow-md border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer select-none touch-manipulation"
                    aria-label="Image suivante"
                    whileHover={{}}
                    whileTap={{}}
                    transition={{ duration: 0 }}
                    style={{ willChange: 'auto', WebkitTapHighlightColor: 'transparent', WebkitUserSelect: 'none' }}
                  >
                    <span className="text-white text-lg sm:text-xl font-bold">›</span>
                  </motion.button>
                </>
              )}
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 md:p-8">
              {/* Image indicators */}
              {hasMultipleImages && (
                <div className="flex justify-center gap-1.5 sm:gap-2 mb-3 sm:mb-4" onClick={(e) => e.stopPropagation()}>
                  {allImages.map((_, index) => (
                    <motion.button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Aller à l'image ${index + 1}`}
                      animate={{ opacity: index === currentImageIndex ? 1 : 0.6 }}
                      transition={{ duration: 0.15 }}
                    />
                  ))}
                </div>
              )}
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
                <div className="text-white">
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-playfair mb-1 sm:mb-2 will-change-transform">
                    <TranslatedText text={artwork.title} />
                  </h3>
                  <p className="text-sm sm:text-base md:text-lg opacity-80 will-change-transform">
                    <TranslatedText text={`${artwork.technique}`} /> • {artwork.dimensions} • {artwork.year}
                  </p>
                </div>
                {/* Description cachée sur mobile */}
                <div className="text-right text-sm sm:text-base max-w-md hidden md:block opacity-70 will-change-transform">
                  <p className="line-clamp-2"><TranslatedText text={artwork.description || ''} /></p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
