import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="relative z-0 isolate bg-gradient-to-t from-black/50 to-transparent border-t border-white/10">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left - Artist Name */}
          <div>
            <h3 className="text-2xl font-playfair text-white tracking-wider">
              Ivan Gauthier
            </h3>
            <p className="text-white/60 mt-2">Artiste Contemporain</p>
          </div>

          {/* Center - Social Links */}
          <div className="flex justify-center space-x-6">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                className="text-white/60 hover:text-white transition-all duration-300"
                aria-label={label}
              >
                <Icon size={24} />
              </a>
            ))}
          </div>

          {/* Right - Copyright */}
          <div className="text-right">
            <p className="text-white/60 text-sm">
              © 2025 Ivan Gauthier
            </p>
            <p className="text-white/40 text-xs mt-1">
              Tous droits réservés
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}