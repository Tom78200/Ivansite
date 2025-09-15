import { useState, useEffect } from 'react';
import type { Artwork } from '@shared/schema';

interface ArtworkModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtworkModal({ artwork, isOpen, onClose }: ArtworkModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset index when artwork changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [artwork]);

  if (!isOpen || !artwork) return null;

  const allImages = [artwork.imageUrl, ...(artwork.additionalImages || [])];
  const hasMultipleImages = allImages.length > 1;

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">{artwork.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Image Section */}
          <div className="lg:w-2/3 relative">
            <div className="relative">
              <img
                src={allImages[currentImageIndex]}
                alt={`${artwork.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-64 lg:h-96 object-contain bg-gray-100"
              />
              
              {/* Navigation arrows */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    aria-label="Image précédente"
                  >
                    ‹
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
                    aria-label="Image suivante"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Image indicators */}
            {hasMultipleImages && (
              <div className="flex justify-center gap-2 p-4">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    aria-label={`Aller à l'image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="lg:w-1/3 p-6 bg-gray-50">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Technique</h3>
                <p className="text-gray-700">{artwork.technique}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Année</h3>
                <p className="text-gray-700">{artwork.year}</p>
              </div>
              
              {artwork.dimensions && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Dimensions</h3>
                  <p className="text-gray-700">{artwork.dimensions}</p>
                </div>
              )}
              
              {artwork.category && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Catégorie</h3>
                  <p className="text-gray-700">{artwork.category}</p>
                </div>
              )}
              
              {artwork.description && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
                  <p className="text-gray-700">{artwork.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



