import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: "/", label: "Galerie" },
    { href: "/expositions", label: "Expositions" },
    { href: "/about", label: "À propos" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      {/* Hamburger Menu Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={toggleMenu}
        className={`fixed top-6 right-6 z-50 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 hover:bg-opacity-30 transition-all duration-300 ${isOpen ? 'hamburger-open' : ''}`}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className="hamburger-line line1 block w-6 h-0.5 bg-white mb-1" />
          <span className="hamburger-line line2 block w-6 h-0.5 bg-white mb-1" />
          <span className="hamburger-line line3 block w-6 h-0.5 bg-white" />
        </div>
      </motion.button>

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleMenu}
          />
        )}
      </AnimatePresence>

      {/* Navigation Menu */}
      <motion.nav
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-full w-80 bg-white z-40 shadow-2xl"
      >
        <div className="flex flex-col h-full pt-20 px-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMenu}
              className={`text-xl font-playfair mb-8 hover:opacity-70 transition-opacity duration-300 ${
                location === item.href ? 'text-[hsl(210,40%,12%)] font-semibold' : 'text-[hsl(210,40%,12%)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </motion.nav>
    </>
  );
}
