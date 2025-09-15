import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useArtworks } from "@/hooks/use-artworks";
import ArtworkLightbox from "@/components/ArtworkLightbox";
import MobileScrollbar from "@/components/MobileScrollbar";
import type { Artwork } from "@shared/schema";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import TranslatedText from "@/components/TranslatedText";

export default function Gallery() {
  const { data: artworks, isLoading } = useArtworks();
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showMobileScrollbar, setShowMobileScrollbar] = useState(false);
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  const sliderArtworks = artworks?.filter(artwork => artwork.showInSlider) || [];

  const openLightbox = useCallback((artwork: Artwork) => {
    setSelectedArtwork(artwork);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setTimeout(() => setSelectedArtwork(null), 300);
  }, []);

  useEffect(() => {
    if (sliderArtworks.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % sliderArtworks.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [sliderArtworks.length]);

  // Gestion de la scrollbar mobile
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth < 768;
      const scrollHeight = document.documentElement.scrollHeight;
      const containerHeight = window.innerHeight;
      
      if (isMobile && scrollHeight > containerHeight) {
        setShowMobileScrollbar(true);
      } else {
        setShowMobileScrollbar(false);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const handleMobileScroll = (scrollTop: number) => {
    window.scrollTo({ top: scrollTop, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-playfair"
        >
          {t('home.loading')}
        </motion.div>
      </div>
    );
  }

  if (!artworks || artworks.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-3xl font-playfair mb-4">{t('home.no-artworks')}</h2>
          <p className="text-lg opacity-80">{t('home.no-artworks-desc')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Galerie d'œuvres — Ivan Gauthier, Artiste Peintre Contemporain</title>
        <meta name="description" content="Galerie d'œuvres d'Ivan Gauthier, artiste peintre contemporain. Peinture figurative et expressionniste, expositions, techniques, années." />
        <link rel="canonical" href="https://www.ivangauthier.com/" />
        <meta name="keywords" content="Ivan Gauthier, galerie, œuvres, peintre, peinture contemporaine, art contemporain, Paris, exposition, artiste" />
        <meta property="og:title" content="Galerie d'œuvres — Ivan Gauthier, Artiste Peintre Contemporain" />
        <meta property="og:description" content="Découvrez la galerie d'œuvres d'Ivan Gauthier, artiste peintre contemporain. Peinture figurative et expressionniste." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.ivangauthier.com/" />
        <meta property="og:image" content="https://www.ivangauthier.com/generated-icon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Galerie d'œuvres — Ivan Gauthier" />
        <meta name="twitter:description" content="Galerie d'œuvres d'Ivan Gauthier, artiste peintre contemporain." />
        <meta name="twitter:image" content="https://www.ivangauthier.com/generated-icon.png" />
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Galerie d'œuvres d'Ivan Gauthier",
            "description": "Galerie d'œuvres d'Ivan Gauthier, artiste peintre contemporain. Peinture figurative et expressionniste.",
            "url": "https://www.ivangauthier.com/",
            "mainEntity": {
              "@type": "Person",
              "name": "Ivan Gauthier",
              "jobTitle": "Artiste Peintre Contemporain"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Accueil",
                  "item": "https://www.ivangauthier.com/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Galerie",
                  "item": "https://www.ivangauthier.com/"
                }
              ]
            }
          }
        `}</script>
      </Helmet>
      <AnimatePresence>
        <section className="relative w-full h-[90vh] overflow-hidden">
          {/* Slider principal : sur mobile, pas d'images à gauche/droite */}
          {sliderArtworks.length > 0 ? (
            <AnimatePresence mode="wait">
              {sliderArtworks[currentSlideIndex] && (
                <motion.div
                  key={`slider-${currentSlideIndex}-${sliderArtworks[currentSlideIndex]?.id || 'fallback'}`}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 1.2,
                    ease: [0.45, 0, 0.55, 1]
                  }}
                  className="absolute inset-0"
                >
                  <img 
                    src={sliderArtworks[currentSlideIndex]?.imageUrl} 
                    alt={`${sliderArtworks[currentSlideIndex]?.title} - Œuvre d'Ivan Gauthier, artiste peintre contemporain`}
                    className="w-full h-full object-cover"
                    loading="eager"
                    width="1920"
                    height="1080"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black" />
          )}
          {/* Les flèches ou images latérales sont désactivées sur mobile (rien à faire car il n'y en a pas dans ce code) */}
          {/* Nom centré mobile */}
          <div className="md:hidden absolute top-1/2 left-1/2 z-20 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none select-none w-full px-3 sm:px-4">
            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-playfair text-white mb-2 tracking-wider uppercase">IVAN GAUTHIER</h1>
            <p className="text-sm sm:text-base text-white opacity-80 tracking-[0.2em] uppercase mb-4">Artiste Contemporain</p>
            {/* Bouton 'Voir les œuvres phares' retiré sur mobile */}
          </div>
          {/* Nom centré desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8,
              delay: 0.5,
              ease: [0.19, 1, 0.22, 1]
            }}
            className="hidden md:block absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center z-10"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-playfair text-white mb-4 tracking-wider">IVAN GAUTHIER</h1>
            <p className="text-lg md:text-xl text-white opacity-80 tracking-[0.3em] uppercase">Artiste Contemporain</p>
            <div className="flex justify-center w-full mt-8">
              {/* Lien œuvres phares supprimé */}
            </div>
          </motion.div>
        </section>

        <section className="bg-black py-12 sm:py-16 md:py-20">
          <div className="w-full max-w-[2000px] mx-auto px-3 sm:px-4 md:px-6">
            <MasonryColumns artworks={artworks} isLightboxOpen={isLightboxOpen} onOpen={openLightbox} />
          </div>
        </section>

        <ArtworkLightbox
          artwork={selectedArtwork}
          isOpen={isLightboxOpen}
          onClose={closeLightbox}
        />
        
        <MobileScrollbar
          isVisible={showMobileScrollbar}
          onScroll={handleMobileScroll}
          scrollHeight={typeof window !== 'undefined' ? document.documentElement.scrollHeight : 0}
          containerHeight={typeof window !== 'undefined' ? window.innerHeight : 0}
        />
      </AnimatePresence>
    </>
  );
}

type MasonryProps = {
  artworks: Artwork[];
  onOpen: (artwork: Artwork) => void;
  isLightboxOpen: boolean;
};

function MasonryColumns({ artworks, onOpen, isLightboxOpen }: MasonryProps) {
  const [columns, setColumns] = useState<number>(3);
  const [ratios, setRatios] = useState<number[]>([]);

  useEffect(() => {
    let ticking = false;
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setColumns(1);
      else if (w < 768) setColumns(1);
      else if (w < 1024) setColumns(2);
      else if (w < 1280) setColumns(2);
      else setColumns(3);
    };
    const onResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          compute();
          ticking = false;
        });
        ticking = true;
      }
    };
    compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const r: number[] = [];
      for (const a of artworks) {
        const ratio = await new Promise<number>((resolve) => {
          const img = new Image();
          img.onload = () => {
            if (!img.naturalWidth || !img.naturalHeight) resolve(1);
            else resolve(img.naturalWidth / img.naturalHeight);
          };
          img.onerror = () => resolve(1);
          img.src = a.imageUrl;
        });
        r.push(ratio || 1);
      }
      if (!cancelled) setRatios(r);
    }
    load();
    return () => { cancelled = true; };
  }, [artworks]);

  const cols: Artwork[][] = Array.from({ length: columns }, () => []);
  if (ratios.length === artworks.length) {
    const heights: number[] = Array.from({ length: columns }, () => 0);
    const gapUnit = 1; // proxy for vertical gap
    artworks.forEach((artwork, idx) => {
      const ratio = ratios[idx] || 1; // width/height
      // Proxy for rendered height at fixed column width: 1/ratio
      const estimatedHeight = 1 / (ratio || 1);
      let minIndex = 0;
      for (let i = 1; i < columns; i++) {
        if (heights[i] < heights[minIndex]) minIndex = i;
      }
      cols[minIndex].push(artwork);
      heights[minIndex] += estimatedHeight + gapUnit;
    });
  } else {
    // Fallback round-robin while ratios load
    artworks.forEach((artwork, idx) => {
      cols[idx % columns].push(artwork);
    });
  }

  return (
    <div className="grid gap-4 sm:gap-5 md:gap-6" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
      {cols.map((col, ci) => (
        <div key={ci} className="flex flex-col gap-4 sm:gap-5 md:gap-6">
          {col.map((artwork, index) => (
            <motion.div
              key={`c${ci}-art-${index}`}
              initial={{ 
                opacity: 0, 
                y: 40, 
                scale: 0.95,
                filter: "blur(8px)"
              }}
              whileInView={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                filter: "blur(0px)",
                transition: { 
                  duration: 0.8, 
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: index * 0.1
                } 
              }}
              viewport={{ once: true, margin: "-5%" }}
              className="artwork-card group cursor-pointer"
              onClick={() => onOpen(artwork)}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={artwork.imageUrl}
                  alt={`${artwork.title} - ${artwork.technique} ${artwork.year} - Œuvre d'Ivan Gauthier, artiste peintre contemporain`}
                  loading="lazy"
                  className="w-full h-auto object-cover"
                  width="800"
                  height="600"
                />
                <motion.div 
                  className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 text-white bg-gradient-to-t from-black/80 via-black/40 to-transparent${isLightboxOpen ? ' hide-on-mobile' : ''}`}
                  initial={{ opacity: 0.8, y: 5 }}
                  whileHover={{ 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                  }}
                  animate={{ opacity: 0.8, y: 5 }}
                >
                  <motion.h3 
                    className="text-lg sm:text-xl font-playfair mb-1"
                    initial={{ opacity: 0.9, x: 0 }}
                    whileHover={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { duration: 0.2, delay: 0.1 }
                    }}
                    animate={{ opacity: 0.9, x: 0 }}
                  >
                    <TranslatedText text={artwork.title} />
                  </motion.h3>
                  <motion.p 
                    className="text-xs sm:text-sm opacity-90"
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { duration: 0.2, delay: 0.15 }
                    }}
                  >
                    <TranslatedText text={`${artwork.technique}`} /> • {artwork.year}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}
