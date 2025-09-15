import { useLanguage } from '@/contexts/LanguageContext';

// Mapping des catégories vers les clés de traduction
const CATEGORY_TRANSLATION_MAP: Record<string, string> = {
  'Portrait': 'category.portrait',
  'Paysage': 'category.paysage',
  'Abstrait': 'category.abstrait',
  'Nature morte': 'category.nature_morte',
  'Figuratif': 'category.figuratif',
  'Contemporain': 'category.contemporain',
  'Autres': 'category.autres',
};

// Fonction pour traduire une catégorie
export function translateCategory(category: string, t: (key: string) => string): string {
  const translationKey = CATEGORY_TRANSLATION_MAP[category];
  return translationKey ? t(translationKey) : category;
}

// Hook personnalisé pour les traductions d'œuvres
export function useArtworkTranslations() {
  const { t } = useLanguage();
  
  return {
    translateCategory: (category: string) => translateCategory(category, t),
  };
}
