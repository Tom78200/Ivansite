import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white bg-opacity-10 rounded-lg backdrop-blur-sm max-w-md"
        >
          <h2 className="text-2xl font-playfair mb-4">Merci !</h2>
          <p className="text-lg">
            Votre message a été envoyé. Je vous répondrai dans les plus brefs délais.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <section className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-playfair text-center mb-16"
        >
          Contact
        </motion.h2>
        
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="space-y-6">
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Votre nom"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-4 bg-white text-[hsl(210,40%,12%)] rounded-lg border-2 border-transparent focus:border-white outline-none transition-all duration-300 text-lg"
              />
            </div>
            
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Votre email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-4 bg-white text-[hsl(210,40%,12%)] rounded-lg border-2 border-transparent focus:border-white outline-none transition-all duration-300 text-lg"
              />
            </div>
            
            <div>
              <Textarea
                name="message"
                rows={6}
                placeholder="Votre message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-4 bg-white text-[hsl(210,40%,12%)] rounded-lg border-2 border-transparent focus:border-white outline-none transition-all duration-300 text-lg resize-none"
              />
            </div>
          </div>
          
          <div className="text-center">
            <Button
              type="submit"
              disabled={submitMessage.isPending}
              className="bg-white text-[hsl(210,40%,12%)] px-12 py-4 rounded-lg text-lg font-semibold hover:bg-opacity-90 transform hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitMessage.isPending ? "Envoi..." : "Envoyer"}
            </Button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}
