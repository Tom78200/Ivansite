import { motion } from "framer-motion";
import { useExhibitions } from "@/hooks/use-exhibitions";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Expositions() {
  const { data: exhibitions, isLoading } = useExhibitions();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-playfair"
        >
          {t('general.loading')}
        </motion.div>
      </div>
    );
  }

  if (!exhibitions || exhibitions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-3xl font-playfair mb-4">{t('exhibitions.title')}</h2>
          <p className="text-lg opacity-80">{t('exhibitions.no-exhibitions')}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Expositions - Ivan Gauthier</title>
        <meta name="description" content="Retrouvez toutes les expositions passées et à venir d'Ivan Gauthier, artiste contemporain." />
      </Helmet>
      <section className="min-h-screen pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-playfair text-center mb-16"
          >
            Expositions
          </motion.h2>
          
          <div className="space-y-12">
            {exhibitions.map((exhibition, index) => (
              <motion.div
                key={exhibition.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="group cursor-pointer relative overflow-hidden rounded-xl h-96"
                onClick={() => setLocation(`/expositions/${exhibition.id}`)}
              >
                <img 
                  src={exhibition.imageUrl} 
                  alt={exhibition.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[hsl(210,40%,12%)] bg-opacity-40 group-hover:bg-opacity-20 transition-all duration-500" />
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center">
                    <h3 className="text-5xl font-playfair text-white mb-4 drop-shadow-lg">
                      {exhibition.title}
                    </h3>
                    <p className="text-xl text-white opacity-80">
                      {exhibition.location} • {exhibition.year}
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
