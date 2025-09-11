import { motion } from "framer-motion";
import { Instagram, Facebook, Linkedin } from "lucide-react";

export default function Footer() {
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/ivan_gauthier.art/", label: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/people/Ivan-Gauthier/pfbid02U73yjwshjppWZq7RvudSg8mgvTBsm9gDcrTPHdoi4bcR8ErUBZP518YQmVp3EDPcl/?ref=_ig_profile_ac", label: "Facebook" },
    { icon: Linkedin, href: "https://fr.linkedin.com/in/ivan-gauthier-b5636220a", label: "LinkedIn" },
    // TikTok icon not in lucide-react by default; using plain link text
  ];

  return (
    <footer className="relative z-[1] isolate bg-gradient-to-t from-black/50 to-transparent border-t border-white/10 will-change-auto">
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
          <div className="flex justify-center flex-wrap gap-6">
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
            <a
              href="https://www.tiktok.com/@ivan.gauthier"
              className="text-white/60 hover:text-white transition-all duration-300"
              aria-label="TikTok"
              title="TikTok"
            >
              <svg width="24" height="24" viewBox="0 0 48 48" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
                <path d="M41 18.2c-4.6-.4-8.2-2.4-10.8-6V33c0 6.7-5.4 12-12.1 12S6 39.7 6 33.1c0-6.7 5.4-12.1 12.1-12.1 1 0 2 .1 2.9.4v6.6c-.9-.6-2-.9-3.2-.9-3.1 0-5.6 2.5-5.6 5.6S14.7 38.3 17.8 38.3 23.4 35.8 23.4 32.7V3h6.8c1.1 4.9 4.8 8.4 10.7 9.1v6.1z"/>
              </svg>
            </a>
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

        {/* Legal links */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-white/60 space-x-3">
          <a href="/mentions-legales" className="hover:text-white">Mentions légales</a>
          <span>·</span>
          <a href="/confidentialite" className="hover:text-white">Confidentialité</a>
          <span>·</span>
          <a href="/cookies" className="hover:text-white">Cookies</a>
          <span>·</span>
          <a href="/conditions" className="hover:text-white">Conditions d’utilisation</a>
          <span>·</span>
          <a href="/accessibilite" className="hover:text-white">Accessibilité</a>
        </div>
      </div>
    </footer>
  );
}