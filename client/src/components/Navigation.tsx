import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu } from "react-icons/hi";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { href: "/", label: "Galerie" },
    { href: "/expositions", label: "Expositions" },
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Header desktop uniquement */}
      <motion.header
        initial={{ y: 0, opacity: 1 }}
        animate={{ 
          y: isScrolled ? -100 : 0,
          opacity: isScrolled ? 0 : 1
        }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm hidden md:block"
      >
        <nav className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Left Menu */}
            <div className="flex space-x-8">
              <Link href="/expositions">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-white font-playfair text-lg hover:opacity-70 transition-opacity cursor-pointer ${
                    location === '/expositions' ? 'opacity-100 font-semibold' : 'opacity-80'
                  }`}
                >
                  Expositions
                </motion.span>
              </Link>
              <Link href="/about">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-white font-playfair text-lg hover:opacity-70 transition-opacity cursor-pointer ${
                    location === '/about' ? 'opacity-100 font-semibold' : 'opacity-80'
                  }`}
                >
                  À propos
                </motion.span>
              </Link>
            </div>

            {/* Center Logo */}
            <Link href="/">
              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-white font-playfair text-2xl md:text-3xl tracking-[0.2em] uppercase cursor-pointer"
              >
                Ivan Gauthier
              </motion.h1>
            </Link>

            {/* Right Menu */}
            <div className="flex space-x-8">
              <Link href="/">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-white font-playfair text-lg hover:opacity-70 transition-opacity cursor-pointer ${
                    location === '/' ? 'opacity-100 font-semibold' : 'opacity-80'
                  }`}
                >
                  Galerie
                </motion.span>
              </Link>
              <Link href="/contact">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className={`text-white font-playfair text-lg hover:opacity-70 transition-opacity cursor-pointer ${
                    location === '/contact' ? 'opacity-100 font-semibold' : 'opacity-80'
                  }`}
                >
                  Contact
                </motion.span>
              </Link>
            </div>
          </div>
        </nav>
      </motion.header>
      {/* Menu hamburger mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-black/80 px-4 py-3">
        <Link href="/">
          <span className="text-white font-playfair text-xl tracking-[0.2em] uppercase">Ivan Gauthier</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen((v) => !v)}
          className="w-10 h-10 flex flex-col items-center justify-center group focus:outline-none bg-black/80 rounded-full z-[100] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          aria-label={mobileMenuOpen ? "Fermer le menu de navigation" : "Ouvrir le menu de navigation"}
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
        >
          {/* Hamburger/Cross animé */}
          <motion.span
            animate={mobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            className="block w-8 h-1 bg-white rounded mb-1 origin-center transition-all duration-300"
          />
          <motion.span
            animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-8 h-1 bg-white rounded mb-1 origin-center transition-all duration-300"
          />
          <motion.span
            animate={mobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            className="block w-8 h-1 bg-white rounded origin-center transition-all duration-300"
          />
        </button>
      </div>
      {/* Menu latéral mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-40 bg-black/80 flex flex-col items-end"
          >
            <nav className="flex flex-col w-full items-center gap-8 mt-20">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg font-playfair tracking-[0.15em] uppercase font-semibold hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Galerie</Link>
              <Link href="/expositions" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg font-playfair tracking-[0.15em] uppercase font-semibold hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Expositions</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg font-playfair tracking-[0.15em] uppercase font-semibold hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">À propos</Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="text-white text-lg font-playfair tracking-[0.15em] uppercase font-semibold hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">Contact</Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
