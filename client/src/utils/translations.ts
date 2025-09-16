import { useLanguage } from '@/contexts/LanguageContext';

// Mapping des catégories vers les clés de traduction
const CATEGORY_TRANSLATION_MAP: Record<string, string> = {
  'Portrait': 'category.portrait',
  'Paysage': 'category.paysage',
  'Abstraction': 'category.abstraction',
  'Abstrait': 'category.abstraction',
  'Nature morte': 'category.nature_morte',
  'Urbain': 'category.urbain',
  'Figuratif': 'category.figuratif',
  'Expressionnisme': 'category.expressionnisme',
  'Scène de vie': 'category.scene_de_vie',
  'Marin': 'category.marin',
  'Animalier': 'category.animalier',
  'Nu': 'category.nu',
  'Impressionnisme': 'category.impressionnisme',
  'Surréalisme': 'category.surrealisme',
  'Cubisme': 'category.cubisme',
  'Minimalisme': 'category.minimalisme',
  'Symbolisme': 'category.symbolisme',
  'Réaliste': 'category.realiste',
  'Post‑impressionnisme': 'category.post_impressionnisme',
  'Baroque': 'category.baroque',
  'Renaissance': 'category.renaissance',
  'Fauvisme': 'category.fauvisme',
  'Art brut': 'category.art_brut',
  'Street art': 'category.street_art',
  'Pop art': 'category.pop_art',
  'Art naïf': 'category.art_naif',
  'Art déco': 'category.art_deco',
  'Art nouveau': 'category.art_nouveau',
  'Calligraphie': 'category.calligraphie',
  'Paysage urbain': 'category.paysage_urbain',
  'Paysage marin': 'category.paysage_marin',
  'Nature abstraite': 'category.nature_abstraite',
  'Portrait abstrait': 'category.portrait_abstrait',
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
