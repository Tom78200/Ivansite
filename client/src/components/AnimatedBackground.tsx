import { memo, useMemo } from "react";
import { motion } from "framer-motion";

function AnimatedBackgroundInner() {
  // Respecter prefers-reduced-motion
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    return <div className="fixed inset-0 -z-10" />;
  }

  // Pré-calcule des positions et durées pour éviter Math.random à chaque render
  const particles = useMemo(() => {
    const count = window.innerWidth < 768 ? 8 : 16; // moins de particules sur mobile
    return Array.from({ length: count }).map((_, i) => ({
      key: i,
      x0: Math.random() * window.innerWidth,
      y0: Math.random() * window.innerHeight,
      x1: Math.random() * window.innerWidth,
      y1: Math.random() * window.innerHeight,
      duration: 18 + Math.random() * 14,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 will-change-transform">
      {particles.map((p) => (
        <motion.div
          key={p.key}
          className="absolute w-1 h-1 bg-foreground opacity-10 rounded-full"
          initial={{ x: p.x0, y: p.y0 }}
          animate={{ x: p.x1, y: p.y1 }}
          transition={{ duration: p.duration, repeat: Infinity, ease: "linear", repeatType: "mirror" }}
        />
      ))}

      {/* Orbes: réduites et animées via transform uniquement */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-white/5 to-white/0 rounded-full blur-3xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.16, 0.1, 0.16] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-2/3 right-1/4 w-64 h-64 bg-gradient-to-r from-white/5 to-white/0 rounded-full blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.16, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-56 h-56 bg-gradient-to-r from-white/5 to-white/0 rounded-full blur-3xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.06, 0.12] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default memo(AnimatedBackgroundInner);