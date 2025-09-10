import { motion } from "framer-motion";
import { Instagram, Facebook, Linkedin } from "lucide-react";

function TikTokIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M168.6 32c8.7 20.9 26.1 36.9 47.4 43.8v29.1c-17.5-.4-33.8-5.4-47.4-14.1v61.6c0 43.8-35.5 79.3-79.3 79.3S10 196.2 10 152.4 45.5 73.1 89.3 73.1c7.2 0 14.2 1 20.8 3v31.2c-6.6-3.1-14-4.8-21.8-4.8-26.7 0-48.3 21.6-48.3 48.3s21.6 48.3 48.3 48.3 48.3-21.6 48.3-48.3V32h32z"/>
    </svg>
  );
}

export default function Footer() {
  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/ivan_gauthier.art/", label: "Instagram" },
    { icon: TikTokIcon, href: "https://www.tiktok.com/@ivan.gauthier", label: "TikTok" },
    { icon: Facebook, href: "https://www.facebook.com/people/Ivan-Gauthier/pfbid02U73yjwshjppWZq7RvudSg8mgvTBsm9gDcrTPHdoi4bcR8ErUBZP518YQmVp3EDPcl/?ref=_ig_profile_ac", label: "Facebook" },
    { icon: Linkedin, href: "https://fr.linkedin.com/in/ivan-gauthier-b5636220a", label: "LinkedIn" },
  ];

  const legalLinks = [
    { href: "/mentions-legales", label: "Mentions légales" },
    { href: "/confidentialite", label: "Confidentialité" },
    { href: "/cookies", label: "Cookies" },
    { href: "/conditions", label: "Conditions d’utilisation" },
    { href: "/accessibilite", label: "Accessibilité" },
  ];

  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-t from-black/50 to-transparent backdrop-blur-sm border-t border-white/10" role="contentinfo">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Left - Artist Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-playfair text-white tracking-wider">
              Ivan Gauthier
            </h3>
            <p className="text-white/60 mt-2">Artiste Contemporain</p>
          </motion.div>

          {/* Center - Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex justify-center"
          >
            <nav aria-label="Réseaux sociaux">
              <ul className="flex items-center gap-6">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <li key={label}>
                    <motion.a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.2, y: -2 }}
                      className="text-white/70 hover:text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
                      aria-label={label}
                    >
                      <Icon size={24} />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>

          {/* Right - Copyright */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-right"
          >
            <p className="text-white/60 text-sm">
              © {currentYear} Ivan Gauthier
            </p>
            <p className="text-white/40 text-xs mt-1">
              Tous droits réservés
            </p>
          </motion.div>
        </div>

        {/* Legal / Utility links */}
        <div className="mt-10">
          <nav aria-label="Liens légaux">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/60">
              {legalLinks.map(({ href, label }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 rounded"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}