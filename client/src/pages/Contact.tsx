import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, MapPin, Send } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAutoTranslation } from "@/hooks/useAutoTranslation";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Traductions automatiques
  const { translatedText: translatedDescription } = useAutoTranslation("Que ce soit pour un projet de collaboration, une acquisition d'œuvre ou toute autre demande, n'hésitez pas à me contacter.");
  const { translatedText: translatedStudioHours } = useAutoTranslation("Horaires d'atelier");
  const { translatedText: translatedSchedule } = useAutoTranslation("Lundi - Vendredi : 9h00 - 18h00\nSamedi : Sur rendez-vous\nDimanche : Fermé");
  const { translatedText: translatedFormTitle } = useAutoTranslation("Envoyez-moi un message");
  const { translatedText: translatedSuccessMessage } = useAutoTranslation("Merci pour votre message. Je vous répondrai dans les plus brefs délais.");
  const { translatedText: translatedAnotherMessage } = useAutoTranslation("Envoyer un autre message");

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
    { icon: Mail, text: "ivangauthier009@gmail.com", label: t('contact.email') },
    { icon: MapPin, text: "Paris, France", label: t('contact.address') },
  ];

  if (isSubmitted) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center py-24">
          <div
            className="text-center p-12 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 max-w-lg shadow-2xl"
          >
            <div
              className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Send className="text-green-400" size={32} />
            </div>
            <h2 className="text-3xl font-playfair mb-6 text-white">{t('general.success')} !</h2>
            <p className="text-lg text-white/80 mb-8">
              {translatedSuccessMessage}
            </p>
            <Button
              onClick={() => setIsSubmitted(false)}
              className="bg-white/10 text-black border border-black hover:bg-white/20 transition-all duration-300"
            >
              {translatedAnotherMessage}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Contact - Ivan Gauthier</title>
        <meta name="description" content="Contactez Ivan Gauthier pour toute demande d'information, d'exposition ou de collaboration artistique." />
      </Helmet>
      <section className="min-h-[100dvh] pt-28 md:pt-24 pb-16 px-6 md:px-8 relative z-10 overflow-x-hidden">
        <div className="w-full mx-auto max-w-[480px] md:max-w-6xl overflow-hidden">
          <div
            className="text-center mb-10 md:mb-16 antialiased"
          >
            <h1 className="text-4xl md:text-6xl font-playfair mb-4 md:mb-6 text-white">
              {t('contact.title')}
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto">
              {translatedDescription}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-16">
            {/* Contact Info */}
            <div className="space-y-8 max-w-md mx-auto md:max-w-none md:mx-0 w-full">
              <div className="bg-white/5 md:backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                <h3 className="text-2xl font-playfair mb-8 text-white">{t('contact.info')}</h3>
                <div className="space-y-6">
                  {contactInfo.map(({ icon: Icon, text, label }, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                        <Icon className="text-white" size={20} />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm">{label}</p>
                        <p className="text-white text-base md:text-lg break-words">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 md:backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                <h3 className="text-xl font-playfair mb-4 text-white">{translatedStudioHours}</h3>
                <p className="text-white/80 whitespace-pre-line">
                  {translatedSchedule}
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="max-w-md mx-auto md:max-w-none md:mx-0 w-full">
              <form
                onSubmit={handleSubmit}
                className="bg-white/5 md:backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 space-y-6"
              >
                <h3 className="text-2xl font-playfair mb-8 text-white">{translatedFormTitle}</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-white/80 text-sm font-medium mb-2 block">{t('contact.form.name')}</label>
                    <Input
                      type="text"
                      name="name"
                      placeholder={t('contact.form.name')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 md:p-4 bg-white/10 text-white placeholder:text-white/50 rounded-xl border border-white/20 focus:border-white/50 outline-none transition-all duration-300 text-base md:text-lg backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/80 text-sm font-medium mb-2 block">{t('contact.form.email')}</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder={t('contact.form.email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 md:p-4 bg-white/10 text-white placeholder:text-white/50 rounded-xl border border-white/20 focus:border-white/50 outline-none transition-all duration-300 text-base md:text-lg backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/80 text-sm font-medium mb-2 block">{t('contact.form.message')}</label>
                    <Textarea
                      name="message"
                      rows={6}
                      placeholder={t('contact.form.message')}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full p-3 md:p-4 bg-white/10 text-white placeholder:text-white/50 rounded-xl border border-white/20 focus:border-white/50 outline-none transition-all duration-300 text-base md:text-lg resize-none backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 md:py-4 rounded-lg shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    aria-label="Envoyer le message de contact"
                    disabled={submitMessage.isPending}
                  >
                    {submitMessage.isPending ? (
                      <span className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-black rounded-full animate-spin" />
                        <span>{t('general.loading')}</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-2">
                        <Send size={20} className="text-white" />
                        <span>{t('contact.form.send')}</span>
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
