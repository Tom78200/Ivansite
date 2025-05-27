import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const submitMessage = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      toast({
        title: "Message envoyé",
        description: "Merci pour votre message. Je vous répondrai dans les plus brefs délais.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'envoi du message.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    { icon: Mail, text: "contact@ivan-gauthier.com", label: "Email" },
    { icon: MapPin, text: "Paris, France", label: "Localisation" },
    { icon: Phone, text: "+33 (0)1 23 45 67 89", label: "Téléphone" },
  ];

  if (isSubmitted) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-lg shadow-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Send className="text-green-400" size={32} />
            </motion.div>
            <h2 className="text-3xl font-playfair mb-6 text-white">Message envoyé !</h2>
            <p className="text-lg text-white/80 mb-8">
              Merci pour votre message. Je vous répondrai dans les plus brefs délais.
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-all duration-300"
            >
              Envoyer un autre message
            </Button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <section className="min-h-screen py-24 px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-playfair mb-6 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Contact
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Que ce soit pour un projet de collaboration, une acquisition d'œuvre ou toute autre demande, 
              n'hésitez pas à me contacter.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-2xl font-playfair mb-8 text-white">Informations de contact</h3>
                <div className="space-y-6">
                  {contactInfo.map(({ icon: Icon, text, label }, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                      className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <Icon className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">{label}</p>
                        <p className="text-white text-lg">{text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <h3 className="text-xl font-playfair mb-4 text-white">Horaires d'atelier</h3>
                <p className="text-white/80">
                  Lundi - Vendredi : 9h00 - 18h00<br />
                  Samedi : Sur rendez-vous<br />
                  Dimanche : Fermé
                </p>
              </motion.div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <form
                onSubmit={handleSubmit}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-6"
              >
                <h3 className="text-2xl font-playfair mb-8 text-white">Envoyez-moi un message</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-white/80 text-sm font-medium mb-2 block">Nom complet</label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Votre nom"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-white/10 text-white placeholder:text-white/50 rounded-xl border border-white/20 focus:border-white/50 outline-none transition-all duration-300 text-lg backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/80 text-sm font-medium mb-2 block">Email</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="votre@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-white/10 text-white placeholder:text-white/50 rounded-xl border border-white/20 focus:border-white/50 outline-none transition-all duration-300 text-lg backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/80 text-sm font-medium mb-2 block">Message</label>
                    <Textarea
                      name="message"
                      rows={6}
                      placeholder="Décrivez votre projet ou votre demande..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-white/10 text-white placeholder:text-white/50 rounded-xl border border-white/20 focus:border-white/50 outline-none transition-all duration-300 text-lg resize-none backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-4"
                >
                  <Button
                    type="submit"
                    disabled={submitMessage.isPending}
                    className="w-full bg-gradient-to-r from-white/20 to-white/30 text-white border border-white/30 px-8 py-4 rounded-xl text-lg font-semibold hover:from-white/30 hover:to-white/40 transition-all duration-500 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  >
                    {submitMessage.isPending ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Envoi en cours...</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Send size={20} />
                        <span>Envoyer le message</span>
                      </span>
                    )}
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
