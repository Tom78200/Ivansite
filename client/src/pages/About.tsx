import { motion } from "framer-motion";

export default function About() {
  const bioSections = [
    "Artiste contemporain reconnu pour ses compositions abstraites qui explorent les frontières entre lumière et obscurité, Ivan Gauthier crée des œuvres qui transcendent les limites traditionnelles de la peinture.",
    "Né en 1985, diplômé des Beaux-Arts de Paris, il développe un langage visuel unique mêlant techniques classiques et approches numériques innovantes.",
    "Ses œuvres sont exposées dans les plus prestigieuses galeries internationales et font partie de collections privées à travers le monde."
  ];

  return (
    <section className="min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-6xl md:text-8xl font-playfair mb-16"
        >
          Ivan Gauthier
        </motion.h1>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=800" 
              alt="Portrait d'Ivan Gauthier" 
              className="w-full max-w-md mx-auto rounded-xl shadow-2xl mb-8"
            />
          </motion.div>
          
          <div className="space-y-6 text-left">
            {bioSections.map((text, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.3, duration: 0.8 }}
              >
                <p className="text-lg leading-relaxed">
                  {text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
