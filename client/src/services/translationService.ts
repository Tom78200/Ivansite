// Service de traduction automatique utilisant l'API de traduction
export class TranslationService {
  private static instance: TranslationService;
  private cache = new Map<string, string>();

  static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  async translateText(text: string, targetLang: 'fr' | 'en'): Promise<string> {
    if (!text || text.trim() === '') return text;
    
    // Vérifier le cache
    const cacheKey = `${text}-${targetLang}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    try {
      // Appeler l'API serveur si disponible
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      let translatedText = text;
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, target: targetLang }),
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          translatedText = data?.translated || text;
        } else {
          // Fallback local si l'API échoue
          translatedText = await this.performTranslation(text, targetLang);
        }
      } catch {
        translatedText = await this.performTranslation(text, targetLang);
      } finally {
        clearTimeout(timeout);
      }
      
      // Mettre en cache
      this.cache.set(cacheKey, translatedText);
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Retourner le texte original en cas d'erreur
    }
  }

  private async performTranslation(text: string, targetLang: 'fr' | 'en'): Promise<string> {
    // Simulation d'une traduction - en production, remplacer par une vraie API
    const translations: Record<string, Record<string, string>> = {
      'fr': {
        'Portrait': 'Portrait',
        'Paysage': 'Paysage',
        'Abstrait': 'Abstrait',
        'Nature morte': 'Nature morte',
        'Figuratif': 'Figuratif',
        'Contemporain': 'Contemporain',
        'Autres': 'Autres',
        'Artiste Contemporain': 'Artiste Contemporain',
        'Biographie': 'Biographie',
        'Technique': 'Technique',
        'Expositions': 'Expositions',
        'Informations de contact': 'Informations de contact',
        'Horaires d\'atelier': 'Horaires d\'atelier',
        'Envoyez-moi un message': 'Envoyez-moi un message',
        'Nom complet': 'Nom complet',
        'Email': 'Email',
        'Message': 'Message',
        'Envoyer le message': 'Envoyer le message',
        'Envoi en cours...': 'Envoi en cours...',
        'Message envoyé !': 'Message envoyé !',
        'Merci pour votre message. Je vous répondrai dans les plus brefs délais.': 'Merci pour votre message. Je vous répondrai dans les plus brefs délais.',
        'Envoyer un autre message': 'Envoyer un autre message',
        'Que ce soit pour un projet de collaboration, une acquisition d\'œuvre ou toute autre demande, n\'hésitez pas à me contacter.': 'Que ce soit pour un projet de collaboration, une acquisition d\'œuvre ou toute autre demande, n\'hésitez pas à me contacter.',
        'Lundi - Vendredi : 9h00 - 18h00': 'Lundi - Vendredi : 9h00 - 18h00',
        'Samedi : Sur rendez-vous': 'Samedi : Sur rendez-vous',
        'Dimanche : Fermé': 'Dimanche : Fermé',
        'Qui suis-je ?': 'Qui suis-je ?',
        'Cliquez pour découvrir': 'Cliquez pour découvrir',
        'Mon parcours': 'Mon parcours',
        'Mon art': 'Mon art',
        'Très jeune ma sensibilité s\'ouvre et je me confronte à de nombreuses formes d\'expression : la danse, le théâtre, le cinéma, le piano, le dessin, la mode puis la peinture. Chacune ne cesseront de s\'enrichir l\'une de l\'autre.': 'Très jeune ma sensibilité s\'ouvre et je me confronte à de nombreuses formes d\'expression : la danse, le théâtre, le cinéma, le piano, le dessin, la mode puis la peinture. Chacune ne cesseront de s\'enrichir l\'une de l\'autre.',
        'J\'expose et vend mes œuvres depuis l\'âge de 16 ans en France et sur tous les continents. Mon travail expressionniste et figuratif traduit une émotion souvent intense mais délicate, une gamme chromatique large et forte au service de créations oniriques parfois tendres ou qui témoignent de l\'âpreté de la vie. Ses personnages, ses paysages et ses ciels racontent des histoires paradoxales et profondément humaines.': 'J\'expose et vend mes œuvres depuis l\'âge de 16 ans en France et sur tous les continents. Mon travail expressionniste et figuratif traduit une émotion souvent intense mais délicate, une gamme chromatique large et forte au service de créations oniriques parfois tendres ou qui témoignent de l\'âpreté de la vie. Ses personnages, ses paysages et ses ciels racontent des histoires paradoxales et profondément humaines.',
        'Je suis né le 1er mars 2000 à Beregovo en Ukraine.': 'Je suis né le 1er mars 2000 à Beregovo en Ukraine.',
      },
      'en': {
        'Portrait': 'Portrait',
        'Paysage': 'Landscape',
        'Abstrait': 'Abstract',
        'Nature morte': 'Still Life',
        'Figuratif': 'Figurative',
        'Contemporain': 'Contemporary',
        'Autres': 'Others',
        'Artiste Contemporain': 'Contemporary Artist',
        'Biographie': 'Biography',
        'Technique': 'Technique',
        'Expositions': 'Exhibitions',
        'Informations de contact': 'Contact Information',
        'Horaires d\'atelier': 'Studio Hours',
        'Envoyez-moi un message': 'Send me a message',
        'Nom complet': 'Full Name',
        'Email': 'Email',
        'Message': 'Message',
        'Envoyer le message': 'Send Message',
        'Envoi en cours...': 'Sending...',
        'Message envoyé !': 'Message sent!',
        'Merci pour votre message. Je vous répondrai dans les plus brefs délais.': 'Thank you for your message. I will respond as soon as possible.',
        'Envoyer un autre message': 'Send another message',
        'Que ce soit pour un projet de collaboration, une acquisition d\'œuvre ou toute autre demande, n\'hésitez pas à me contacter.': 'Whether for a collaboration project, artwork acquisition or any other request, please don\'t hesitate to contact me.',
        'Lundi - Vendredi : 9h00 - 18h00': 'Monday - Friday: 9:00 AM - 6:00 PM',
        'Samedi : Sur rendez-vous': 'Saturday: By appointment',
        'Dimanche : Fermé': 'Sunday: Closed',
        'Qui suis-je ?': 'Who am I?',
        'Cliquez pour découvrir': 'Click to discover',
        'Mon parcours': 'My Journey',
        'Mon art': 'My Art',
        'Très jeune ma sensibilité s\'ouvre et je me confronte à de nombreuses formes d\'expression : la danse, le théâtre, le cinéma, le piano, le dessin, la mode puis la peinture. Chacune ne cesseront de s\'enrichir l\'une de l\'autre.': 'From a very young age, my sensitivity opened up and I confronted many forms of expression: dance, theater, cinema, piano, drawing, fashion, then painting. Each one will continue to enrich the others.',
        'J\'expose et vend mes œuvres depuis l\'âge de 16 ans en France et sur tous les continents. Mon travail expressionniste et figuratif traduit une émotion souvent intense mais délicate, une gamme chromatique large et forte au service de créations oniriques parfois tendres ou qui témoignent de l\'âpreté de la vie. Ses personnages, ses paysages et ses ciels racontent des histoires paradoxales et profondément humaines.': 'I have been exhibiting and selling my works since the age of 16 in France and on all continents. My expressionist and figurative work translates an often intense but delicate emotion, a wide and strong chromatic range at the service of dreamlike creations sometimes tender or that testify to the harshness of life. Its characters, its landscapes and its skies tell paradoxical and deeply human stories.',
        'Je suis né le 1er mars 2000 à Beregovo en Ukraine.': 'I was born on March 1, 2000 in Beregovo, Ukraine.',
      }
    };

    // Retourner la traduction si elle existe, sinon le texte original
    return translations[targetLang]?.[text] || text;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const translationService = TranslationService.getInstance();
