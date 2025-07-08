import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  quality?: number;
  onLoad?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  quality = 75,
  onLoad
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>('');

  useEffect(() => {
    const optimizeImage = async () => {
      try {
        // Create a tiny placeholder
        const placeholder = 'data:image/svg+xml;base64,' + btoa(`
          <svg width="${width || 100}" height="${height || 100}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#1f2937"/>
          </svg>
        `);
        setImgSrc(placeholder);

        // Start loading the actual image
        const img = new Image();
        img.src = src;
        await img.decode();
        setImgSrc(src);
        setLoaded(true);
        onLoad?.();
      } catch (e) {
        setError(true);
        console.error('Error loading image:', e);
      }
    };

    optimizeImage();
  }, [src, width, height, onLoad]);

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ aspectRatio: width && height ? width/height : 'auto' }}>
      <img
        src={imgSrc}
        alt={alt}
        className={`
          w-full h-full object-cover transition-opacity duration-300
          ${loaded ? 'opacity-100' : 'opacity-60'}
          ${error ? 'opacity-50 grayscale' : ''}
        `}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{
          transform: 'translate3d(0,0,0)',
          backfaceVisibility: 'hidden'
        }}
        onError={() => setError(true)}
      />
    </div>
  );
} 