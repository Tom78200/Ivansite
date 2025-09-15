import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translationService } from '@/services/translationService';

export function useAutoTranslation(text: string) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!text || text.trim() === '') {
      setTranslatedText(text);
      return;
    }

    const translate = async () => {
      setIsTranslating(true);
      try {
        const translated = await translationService.translateText(text, language);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(text);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [text, language]);

  return { translatedText, isTranslating };
}
