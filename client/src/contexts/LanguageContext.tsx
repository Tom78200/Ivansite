import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions
const translations = {
  fr: {
    // Navigation
    'nav.gallery': 'Galerie',
    'nav.exhibitions': 'Expositions',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    
    // Page principale
    'home.title': 'IVAN GAUTHIER',
    'home.subtitle': 'Artiste Contemporain',
    'home.loading': 'Chargement de la galerie...',
    'home.no-artworks': 'Galerie en préparation',
    'home.no-artworks-desc': 'Les œuvres seront bientôt disponibles.',
    
    // Galerie
    'gallery.title': 'Galerie',
    'gallery.no-artworks': 'Aucune œuvre pour le moment.',
    'gallery.others': 'Autres',
    
    // Expositions
    'exhibitions.title': 'Expositions',
    'exhibitions.no-exhibitions': 'Aucune exposition pour le moment.',
    'exhibitions.details': 'Détails',
    'exhibitions.close': 'Fermer',
    
    // À propos
    'about.title': 'À propos',
    'about.bio': 'Biographie',
    'about.technique': 'Technique',
    'about.exhibitions': 'Expositions',
    
    // Contact
    'contact.title': 'Contact',
    'contact.form.name': 'Nom',
    'contact.form.email': 'Email',
    'contact.form.message': 'Message',
    'contact.form.send': 'Envoyer',
    'contact.info': 'Informations',
    'contact.address': 'Adresse',
    'contact.email': 'Email',
    
    // Admin
    'admin.title': 'Admin',
    'admin.password': 'Mot de passe',
    'admin.login': 'Se connecter',
    'admin.dashboard': 'Dashboard Admin',
    'admin.manage-exhibitions': 'Gérer les expositions',
    'admin.add-artwork': 'Uploader une œuvre',
    'admin.artwork-title': 'Titre',
    'admin.artwork-technique': 'Technique',
    'admin.artwork-year': 'Année',
    'admin.artwork-dimensions': 'Dimensions',
    'admin.artwork-description': 'Description',
    'admin.artwork-category': 'Choisir une catégorie…',
    'admin.artwork-image': 'Image',
    'admin.artwork-add': 'Ajouter l\'œuvre',
    'admin.artwork-cancel': 'Annuler',
    'admin.artwork-order': 'Ordre des œuvres (glisser‑déposer)',
    'admin.artwork-save-order': 'Enregistrer l\'ordre',
    'admin.artwork-list': 'Liste des œuvres',
    'admin.artwork-add-photos': 'Ajouter photos',
    'admin.artwork-delete': 'Supprimer',
    'admin.artwork-max-reached': 'Max atteint',
    'admin.artwork-additional-images': 'Ajouter des images supplémentaires',
    'admin.artwork-add-images': 'Ajouter',
    'admin.artwork-cancel-images': 'Annuler',
    
    // Lightbox
    'lightbox.close': 'Fermer la fenêtre d\'aperçu',
    'lightbox.previous': 'Image précédente',
    'lightbox.next': 'Image suivante',
    'lightbox.go-to': 'Aller à l\'image',
    
    // Général
    'general.loading': 'Chargement...',
    'general.error': 'Erreur',
    'general.success': 'Succès',
    'general.cancel': 'Annuler',
    'general.save': 'Enregistrer',
    'general.delete': 'Supprimer',
    'general.edit': 'Modifier',
    'general.add': 'Ajouter',
    'general.close': 'Fermer',
    'general.open': 'Ouvrir',
    'general.previous': 'Précédent',
    'general.next': 'Suivant',
    
    // Catégories d'œuvres
    'category.portrait': 'Portrait',
    'category.paysage': 'Paysage',
    'category.abstrait': 'Abstrait',
    'category.nature_morte': 'Nature morte',
    'category.figuratif': 'Figuratif',
    'category.contemporain': 'Contemporain',
    'category.autres': 'Autres',
  },
  en: {
    // Navigation
    'nav.gallery': 'Gallery',
    'nav.exhibitions': 'Exhibitions',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Page principale
    'home.title': 'IVAN GAUTHIER',
    'home.subtitle': 'Contemporary Artist',
    'home.loading': 'Loading gallery...',
    'home.no-artworks': 'Gallery in preparation',
    'home.no-artworks-desc': 'Artworks will be available soon.',
    
    // Galerie
    'gallery.title': 'Gallery',
    'gallery.no-artworks': 'No artworks at the moment.',
    'gallery.others': 'Others',
    
    // Expositions
    'exhibitions.title': 'Exhibitions',
    'exhibitions.no-exhibitions': 'No exhibitions at the moment.',
    'exhibitions.details': 'Details',
    'exhibitions.close': 'Close',
    
    // À propos
    'about.title': 'About',
    'about.bio': 'Biography',
    'about.technique': 'Technique',
    'about.exhibitions': 'Exhibitions',
    
    // Contact
    'contact.title': 'Contact',
    'contact.form.name': 'Name',
    'contact.form.email': 'Email',
    'contact.form.message': 'Message',
    'contact.form.send': 'Send',
    'contact.info': 'Information',
    'contact.address': 'Address',
    'contact.email': 'Email',
    
    // Admin
    'admin.title': 'Admin',
    'admin.password': 'Password',
    'admin.login': 'Login',
    'admin.dashboard': 'Admin Dashboard',
    'admin.manage-exhibitions': 'Manage exhibitions',
    'admin.add-artwork': 'Upload artwork',
    'admin.artwork-title': 'Title',
    'admin.artwork-technique': 'Technique',
    'admin.artwork-year': 'Year',
    'admin.artwork-dimensions': 'Dimensions',
    'admin.artwork-description': 'Description',
    'admin.artwork-category': 'Choose a category…',
    'admin.artwork-image': 'Image',
    'admin.artwork-add': 'Add artwork',
    'admin.artwork-cancel': 'Cancel',
    'admin.artwork-order': 'Artwork order (drag & drop)',
    'admin.artwork-save-order': 'Save order',
    'admin.artwork-list': 'Artwork list',
    'admin.artwork-add-photos': 'Add photos',
    'admin.artwork-delete': 'Delete',
    'admin.artwork-max-reached': 'Max reached',
    'admin.artwork-additional-images': 'Add additional images',
    'admin.artwork-add-images': 'Add',
    'admin.artwork-cancel-images': 'Cancel',
    
    // Lightbox
    'lightbox.close': 'Close preview window',
    'lightbox.previous': 'Previous image',
    'lightbox.next': 'Next image',
    'lightbox.go-to': 'Go to image',
    
    // Général
    'general.loading': 'Loading...',
    'general.error': 'Error',
    'general.success': 'Success',
    'general.cancel': 'Cancel',
    'general.save': 'Save',
    'general.delete': 'Delete',
    'general.edit': 'Edit',
    'general.add': 'Add',
    'general.close': 'Close',
    'general.open': 'Open',
    'general.previous': 'Previous',
    'general.next': 'Next',
    
    // Catégories d'œuvres
    'category.portrait': 'Portrait',
    'category.paysage': 'Landscape',
    'category.abstrait': 'Abstract',
    'category.nature_morte': 'Still Life',
    'category.figuratif': 'Figurative',
    'category.contemporain': 'Contemporary',
    'category.autres': 'Others',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en')) {
        setLanguage(savedLanguage);
        return;
      }
      const nav = (navigator?.language || navigator?.languages?.[0] || '').toLowerCase();
      if (nav.startsWith('fr')) setLanguage('fr');
      else setLanguage('en');
    } catch {
      setLanguage('en');
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
