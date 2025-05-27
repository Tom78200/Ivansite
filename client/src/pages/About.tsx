import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Linkedin, Mail, MapPin, Calendar } from "lucide-react";

export default function About() {
  const bioSections = [
    {
      title: "Formation & Débuts",
      content: "Diplômé des Beaux-Arts de Paris en 2008, Ivan Gauthier développe très tôt une fascination pour l'exploration des émotions humaines à travers la couleur et la forme. Ses premières œuvres révèlent déjà une sensibilité particulière pour les nuances subtiles et les contrastes expressifs."
    },
    {
      title: "Évolution Artistique",
      content: "Au fil des années, son travail évolue vers une synthèse unique entre figuration et abstraction. La série 'Juste en Bleu' marque un tournant majeur dans son œuvre, où la couleur devient le véhicule principal de l'émotion, transcendant les limites de la représentation traditionnelle."
    },
    {
      title: "Reconnaissance Internationale",
      content: "Ses œuvres sont aujourd'hui exposées dans les galeries les plus prestigieuses d'Europe et d'Amérique du Nord. Collectionné par des amateurs d'art du monde entier, Ivan Gauthier s'impose comme une voix distinctive de l'art contemporain français."
    },
    {
      title: "Approche & Philosophie",
      content: "Chaque œuvre d'Ivan Gauthier naît d'une introspection profonde. Il explore les territoires de l'âme humaine, transformant les émotions les plus intimes en compositions visuelles d'une rare intensité. Son travail interroge notre rapport à la beauté, à la mélancolie et à la transcendance."
    }
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram", color: "hover:text-pink-400" },
    { icon: Twitter, href: "#", label: "Twitter", color: "hover:text-blue-400" },
    { icon: Facebook, href: "#", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Linkedin, href: "#", label: "LinkedIn", color: "hover:text-blue-500" },
  ];

  const contactInfo = [
    { icon: Mail, text: "contact@ivan-gauthier.com" },
    { icon: MapPin, text: "Paris, France" },
    { icon: Calendar, text: "Né en 1985" },
  ];

  return (
    <>
      <section className="min-h-screen py-24 px-8 relative">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-20"
          >
            <h1 className="text-6xl md:text-8xl font-playfair mb-8 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Ivan Gauthier
            </h1>
            <p className="text-2xl text-white/80 tracking-[0.3em] uppercase">
              Artiste Contemporain
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Portrait & Contact */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-8"
            >
              <div className="relative group">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800" 
                  alt="Portrait d'Ivan Gauthier" 
                  className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-xl font-playfair mb-4 text-white">Contact</h3>
                <div className="space-y-3">
                  {contactInfo.map(({ icon: Icon, text }, index) => (
                    <div key={index} className="flex items-center space-x-3 text-white/80">
                      <Icon size={18} />
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-center"
              >
                <h3 className="text-lg font-playfair mb-4 text-white">Suivez l'artiste</h3>
                <div className="flex justify-center space-x-6">
                  {socialLinks.map(({ icon: Icon, href, label, color }) => (
                    <motion.a
                      key={label}
                      href={href}
                      whileHover={{ scale: 1.2, y: -3 }}
                      className={`text-white/60 ${color} transition-all duration-300 p-3 bg-white/5 rounded-full hover:bg-white/10`}
                      aria-label={label}
                    >
                      <Icon size={24} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Biography */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="space-y-12"
            >
              {bioSections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.2, duration: 0.8 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-500"
                >
                  <h3 className="text-2xl font-playfair mb-4 text-white">
                    {section.title}
                  </h3>
                  <p className="text-white/80 leading-relaxed text-lg">
                    {section.content}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
