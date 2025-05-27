import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();

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
    <motion.header
      initial={{ y: 0, opacity: 1 }}
      animate={{ 
        y: isScrolled ? -100 : 0,
        opacity: isScrolled ? 0 : 1
      }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/30 to-transparent backdrop-blur-sm"
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
  );
}
