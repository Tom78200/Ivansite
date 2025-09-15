import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MobileScrollbarProps {
  isVisible: boolean;
  onScroll: (scrollTop: number) => void;
  scrollHeight: number;
  containerHeight: number;
}

export default function MobileScrollbar({ isVisible, onScroll, scrollHeight, containerHeight }: MobileScrollbarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const startScrollTop = useRef(0);

  const scrollbarHeight = Math.max(40, (containerHeight / scrollHeight) * containerHeight);
  const maxScrollTop = containerHeight - scrollbarHeight;
  const scrollRatio = scrollHeight / containerHeight;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollbarRef.current) return;
    setIsDragging(true);
    startY.current = e.touches[0].clientY;
    startScrollTop.current = scrollPosition;
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !scrollbarRef.current) return;
    
    const deltaY = e.touches[0].clientY - startY.current;
    const newScrollPosition = Math.max(0, Math.min(maxScrollTop, startScrollTop.current + deltaY));
    
    setScrollPosition(newScrollPosition);
    const scrollTop = newScrollPosition * scrollRatio;
    onScroll(scrollTop);
    
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Mise à jour de la position du scrollbar quand on scroll normalement
  useEffect(() => {
    if (!isDragging) {
      const newPosition = (window.scrollY / scrollHeight) * maxScrollTop;
      setScrollPosition(Math.max(0, Math.min(maxScrollTop, newPosition)));
    }
  }, [isDragging, scrollHeight, maxScrollTop]);

  if (!isVisible || scrollHeight <= containerHeight) return null;

  return (
    <motion.div
      ref={scrollbarRef}
      className="fixed right-2 top-1/2 -translate-y-1/2 z-50 w-1 bg-white/20 rounded-full"
      style={{ height: `${containerHeight}px` }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full bg-white/60 rounded-full cursor-pointer touch-none"
        style={{ 
          height: `${scrollbarHeight}px`,
          transform: `translateY(${scrollPosition}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
        whileTap={{ scale: 1.1 }}
        animate={{
          backgroundColor: isDragging ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.6)'
        }}
      />
    </motion.div>
  );
}
