import { useArtworks } from "@/hooks/use-artworks";
import { ARTWORK_CATEGORIES } from "@shared/categories";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useArtworkTranslations } from "@/utils/translations";

export default function Galerie() {
  const { data: artworks } = useArtworks();
  const data = Array.isArray(artworks) ? artworks : [];
  const scrollersRef = useRef<Record<string, HTMLDivElement | null>>({});
  const [activeRow, setActiveRow] = useState<string | null>(null);
  const { t } = useLanguage();
  const { translateCategory } = useArtworkTranslations();

  const setScrollerRef = (key: string) => (el: HTMLDivElement | null) => {
    scrollersRef.current[key] = el;
  };

  const [selectedIndexByRow, setSelectedIndexByRow] = useState<Record<string, number>>({});

  const setSelected = (key: string, idx: number) => {
    setSelectedIndexByRow((prev) => ({ ...prev, [key]: idx }));
  };

  const scroll = (key: string, dir: -1 | 1) => {
    const el = scrollersRef.current[key];
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;
    const currentIndex = Math.max(0, Math.min(children.length - 1, (selectedIndexByRow[key] ?? 0)));
    const targetIndex = Math.max(0, Math.min(children.length - 1, currentIndex + dir));
    const child = children[targetIndex] as HTMLElement;
    
    // Calcul plus stable pour le centrage
    const containerWidth = el.clientWidth;
    const childWidth = child.clientWidth;
    const childLeft = child.offsetLeft;
    
    // Centrer l'image dans le conteneur avec un offset minimal
    const targetLeft = Math.max(0, childLeft - (containerWidth - childWidth) / 2);
    
    el.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setSelected(key, targetIndex);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!activeRow) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scroll(activeRow, 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scroll(activeRow, -1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeRow, selectedIndexByRow]);
  return (
    <div className="min-h-screen bg-black text-white pt-16 sm:pt-20 md:pt-28">
      <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
        <motion.h1 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-playfair mb-6 sm:mb-8 md:mb-10"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2
          }}
        >
          {t('gallery.title')}
        </motion.h1>
        {data.length === 0 ? (
          <div className="text-white/60">{t('gallery.no-artworks')}</div>
        ) : (
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {ARTWORK_CATEGORIES.filter(c => c !== 'Autres').map((cat, catIndex) => {
              const list = data.filter(a => normalize(a.category) === normalize(cat));
              if (list.length === 0) return null;
              return (
                <motion.div 
                  key={cat} 
                  className="relative overflow-visible"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      duration: 0.8, 
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: catIndex * 0.2
                    } 
                  }}
                  viewport={{ once: true, margin: "-10%" }}
                >
                  <motion.h2 
                    className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { 
                        duration: 0.6, 
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: catIndex * 0.2 + 0.3
                      } 
                    }}
                    viewport={{ once: true }}
                  >
                    {translateCategory(cat)}
                  </motion.h2>
                  <div className="relative">
                    <motion.button 
                      aria-label="Défiler à gauche" 
                      onClick={() => { setActiveRow(cat); scroll(cat, -1); }} 
                      className="hidden md:block absolute -left-10 md:-left-14 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 border border-white/20 rounded-full p-2"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { 
                          duration: 0.5, 
                          ease: [0.25, 0.46, 0.45, 0.94],
                          delay: catIndex * 0.2 + 0.5
                        } 
                      }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      ‹
                    </motion.button>
                    <div ref={setScrollerRef(cat)} className="overflow-x-auto overflow-visible whitespace-nowrap snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent py-2 sm:py-3 pl-0 pr-4 sm:pr-6 md:pr-8" style={{scrollbarWidth:'none', overflowY:'visible'}}>
                      {list.map((a, idx) => {
                        const isSelected = (selectedIndexByRow[cat] ?? 0) === idx;
                        return (
                          <motion.button
                            key={a.id}
                            className={`relative inline-block mr-3 sm:mr-4 align-top snap-start rounded focus:outline-none overflow-visible transition-all duration-300 last:mr-3 sm:last:mr-4 md:last:mr-6 ${idx === 0 ? 'sm:ml-1 md:ml-2 lg:ml-3' : ''} ${isSelected ? 'scale-[1.08]' : 'opacity-85 hover:opacity-100'} `}
                            onClick={() => {
                              setActiveRow(cat);
                              setSelected(cat, idx);
                              const el = scrollersRef.current[cat];
                              if (el) {
                                const child = (el.children[idx] as HTMLElement) || null;
                                if (child) {
                                  // Calcul stable pour le centrage au clic
                                  const containerWidth = el.clientWidth;
                                  const childWidth = child.clientWidth;
                                  const childLeft = child.offsetLeft;
                                  const left = Math.max(0, childLeft - (containerWidth - childWidth) / 2);
                                  el.scrollTo({ left, behavior: 'smooth' });
                                }
                              }
                            }}
                            aria-label={a.title}
                            initial={{ 
                              opacity: 0, 
                              scale: 0.9,
                              filter: "blur(4px)"
                            }}
                            whileInView={{ 
                              opacity: 0.85, 
                              scale: 1,
                              filter: "blur(0px)",
                              transition: { 
                                duration: 0.8, 
                                ease: [0.25, 0.46, 0.45, 0.94],
                                delay: catIndex * 0.2 + idx * 0.1
                              } 
                            }}
                            viewport={{ once: true, margin: "-5%" }}
                            whileHover={{ 
                              opacity: 1,
                              scale: 1.05,
                              transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                            }}
                          >
                            <div className={`relative rounded-xl overflow-visible ${isSelected ? 'before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:border-2 before:border-white/70 before:shadow-[inset_0_0_10px_rgba(255,255,255,0.35),0_0_6px_rgba(255,255,255,0.15)] after:absolute after:inset-0 after:rounded-xl after:pointer-events-none after:bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0)_40%)]' : ''}`}>
                              <img
                                src={a.imageUrl}
                                alt={a.title}
                                className={`h-36 sm:h-44 md:h-56 w-auto object-contain rounded-xl border ${isSelected ? 'border-white/30' : 'border-white/10'} bg-black/20 transition-all duration-300`}
                                loading="lazy"
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    <motion.button 
                      aria-label="Défiler à droite" 
                      onClick={() => { setActiveRow(cat); scroll(cat, 1); }} 
                      className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 border border-white/20 rounded-full p-2"
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ 
                        opacity: 1, 
                        x: 0,
                        transition: { 
                          duration: 0.5, 
                          ease: [0.25, 0.46, 0.45, 0.94],
                          delay: catIndex * 0.2 + 0.5
                        } 
                      }}
                      viewport={{ once: true }}
                      whileHover={{ 
                        scale: 1.1,
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      ›
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
            {(() => {
              const list = data.filter(a => !ARTWORK_CATEGORIES.some(c => c !== 'Autres' && normalize(a.category) === normalize(c)));
              if (list.length === 0) return null;
              return (
                <motion.div 
                  key="Autres" 
                  className="relative overflow-visible"
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    transition: { 
                      duration: 0.8, 
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: ARTWORK_CATEGORIES.filter(c => c !== 'Autres').length * 0.2
                    } 
                  }}
                  viewport={{ once: true, margin: "-10%" }}
                >
                  <motion.h2 
                    className="text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { 
                        duration: 0.6, 
                        ease: [0.25, 0.46, 0.45, 0.94],
                        delay: ARTWORK_CATEGORIES.filter(c => c !== 'Autres').length * 0.2 + 0.3
                      } 
                    }}
                    viewport={{ once: true }}
                  >
                    {t('gallery.others')}
                  </motion.h2>
                  <div className="relative">
                    <button aria-label="Défiler à gauche" onClick={() => { setActiveRow('Autres'); scroll('Autres', -1); }} className="hidden md:block absolute -left-10 md:-left-14 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 border border-white/20 rounded-full p-2">‹</button>
                    <div ref={setScrollerRef('Autres')} className="overflow-x-auto overflow-visible whitespace-nowrap snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent py-2 sm:py-3 pl-0 pr-4 sm:pr-6 md:pr-8" style={{scrollbarWidth:'none', overflowY:'visible'}}>
                      {list.map((a, idx) => {
                        const rowKey = 'Autres';
                        const isSelected = (selectedIndexByRow[rowKey] ?? 0) === idx;
                        return (
                          <motion.button
                            key={a.id}
                            className={`relative inline-block mr-3 sm:mr-4 align-top snap-start rounded focus:outline-none overflow-visible transition-all duration-300 last:mr-3 sm:last:mr-4 md:last:mr-6 ${idx === 0 ? 'sm:ml-1 md:ml-2 lg:ml-3' : ''} ${isSelected ? 'scale-[1.08]' : 'opacity-85 hover:opacity-100'} `}
                            onClick={() => {
                              setActiveRow(rowKey);
                              setSelected(rowKey, idx);
                              const el = scrollersRef.current[rowKey];
                              if (el) {
                                const child = (el.children[idx] as HTMLElement) || null;
                                if (child) {
                                  // Calcul stable pour le centrage au clic
                                  const containerWidth = el.clientWidth;
                                  const childWidth = child.clientWidth;
                                  const childLeft = child.offsetLeft;
                                  const left = Math.max(0, childLeft - (containerWidth - childWidth) / 2);
                                  el.scrollTo({ left, behavior: 'smooth' });
                                }
                              }
                            }}
                            aria-label={a.title}
                            initial={{ 
                              opacity: 0, 
                              scale: 0.9,
                              filter: "blur(4px)"
                            }}
                            whileInView={{ 
                              opacity: 0.85, 
                              scale: 1,
                              filter: "blur(0px)",
                              transition: { 
                                duration: 0.8, 
                                ease: [0.25, 0.46, 0.45, 0.94],
                                delay: ARTWORK_CATEGORIES.filter(c => c !== 'Autres').length * 0.2 + idx * 0.1
                              } 
                            }}
                            viewport={{ once: true, margin: "-5%" }}
                            whileHover={{ 
                              opacity: 1,
                              scale: 1.05,
                              transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                            }}
                          >
                            <div className={`relative rounded-xl overflow-visible ${isSelected ? 'before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:border-2 before:border-white/70 before:shadow-[inset_0_0_10px_rgba(255,255,255,0.35),0_0_6px_rgba(255,255,255,0.15)] after:absolute after:inset-0 after:rounded-xl after:pointer-events-none after:bg-[linear-gradient(135deg,rgba(255,255,255,0.15),rgba(255,255,255,0)_40%)]' : ''}`}>
                              <img
                                src={a.imageUrl}
                                alt={a.title}
                                className={`h-36 sm:h-44 md:h-56 w-auto object-contain rounded-xl border ${isSelected ? 'border-white/30' : 'border-white/10'} bg-black/20 transition-all duration-300`}
                                loading="lazy"
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                    <button aria-label="Défiler à droite" onClick={() => { setActiveRow('Autres'); scroll('Autres', 1); }} className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 border border-white/20 rounded-full p-2">›</button>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        )}
      </section>
    </div>
  );
}

function normalize(input?: string | null): string {
  const raw = (input || '').toString().trim();
  if (!raw) return 'Autres';
  return raw
    .normalize('NFD')
    .replace(/\p{Diacritic}+/gu, '')
    .toLowerCase();
}


