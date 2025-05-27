import { 
  users, 
  artworks, 
  exhibitions, 
  contactMessages,
  type User, 
  type InsertUser,
  type Artwork,
  type InsertArtwork,
  type Exhibition,
  type InsertExhibition,
  type ContactMessage,
  type InsertContactMessage
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getArtworks(): Promise<Artwork[]>;
  getArtwork(id: number): Promise<Artwork | undefined>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  
  getExhibitions(): Promise<Exhibition[]>;
  getExhibition(id: number): Promise<Exhibition | undefined>;
  createExhibition(exhibition: InsertExhibition): Promise<Exhibition>;
  
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private artworks: Map<number, Artwork>;
  private exhibitions: Map<number, Exhibition>;
  private contactMessages: Map<number, ContactMessage>;
  private currentUserId: number;
  private currentArtworkId: number;
  private currentExhibitionId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.artworks = new Map();
    this.exhibitions = new Map();
    this.contactMessages = new Map();
    this.currentUserId = 1;
    this.currentArtworkId = 1;
    this.currentExhibitionId = 1;
    this.currentMessageId = 1;
    
    // Initialize with Ivan Gauthier's artworks
    this.initializeArtworks();
    this.initializeExhibitions();
  }

  private initializeArtworks() {
    const artworks = [
      {
        title: "Juste en Bleu 3",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_JUSTE_EN_BLEU_3_61X48_CM_GOUACHE_POLYCHROMOS_ET_ACRYLIQUE_SUR_PAPIER.jpg",
        dimensions: "61 x 48 cm",
        technique: "Gouache, Polychromos et acrylique sur papier",
        year: "2023",
        description: "Une exploration délicate des nuances de bleu, où la couleur devient émotion pure. Cette œuvre capture l'essence de la mélancolie transformée en beauté.",
        isVisible: true
      },
      {
        title: "Juste en Bleu",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_JUSTE_EN_BLEU___61X48_CM_GOUACHE_POLYCHROMOS_ACRYLIQUE_SUR_PAPIER_.jpg",
        dimensions: "61 x 48 cm",
        technique: "Gouache, Polychromos et acrylique sur papier",
        year: "2023",
        description: "La première de la série 'Juste en Bleu', où l'artiste explore les profondeurs émotionnelles à travers une palette monochrome.",
        isVisible: true
      },
      {
        title: "Juste en Bleu 2",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_JUSTE_EN_BLEU_2_61X48_CM_GOUACHE_POLYCHROMOS_ET_ACRYLIQUE.jpg",
        dimensions: "61 x 48 cm",
        technique: "Gouache, Polychromos et acrylique sur papier",
        year: "2023",
        description: "Continuation de l'exploration du bleu comme langage universel. Chaque nuance raconte une histoire différente.",
        isVisible: true
      },
      {
        title: "La Dame du Cirque",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_LA_DAME_DU_CIRQUE_POSCA_ET_ACRYLIQUE_SUR_TOILE.jpg",
        dimensions: "50 x 65 cm",
        technique: "Posca et acrylique sur toile",
        year: "2023",
        description: "Portrait théâtral capturant l'essence mystérieuse des arts du spectacle. Une œuvre qui révèle la beauté cachée derrière le masque.",
        isVisible: true
      },
      {
        title: "La Jouvencelle",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_LA_JOUVENCELLE_AQUARELLE_ET_ENCRE_DE_CHINE_SUR_PAPIER.jpg",
        dimensions: "42 x 30 cm",
        technique: "Aquarelle et encre de Chine sur papier",
        year: "2022",
        description: "Portrait délicat d'une jeune femme, où la technique de l'aquarelle révèle toute sa poésie et sa spontanéité.",
        isVisible: true
      },
      {
        title: "Petit Garçon",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_PETIT_GARCON_AQUARELLE_ENCRE_DE_CHINE_SUR_PAPIER_.jpg",
        dimensions: "42 x 30 cm",
        technique: "Aquarelle et encre de Chine sur papier",
        year: "2022",
        description: "Portrait touchant qui capture l'innocence et la curiosité de l'enfance avec une sensibilité remarquable.",
        isVisible: true
      },
      {
        title: "Un Au Revoir",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_UN_AUREVOIR_61X48_CM_AQUARELLE_ET_ENCRE_DE_CHINE_SUR_PAPIER_.jpg",
        dimensions: "61 x 48 cm",
        technique: "Aquarelle et encre de Chine sur papier",
        year: "2023",
        description: "Œuvre empreinte de mélancolie qui explore les moments de séparation avec une profondeur émotionnelle saisissante.",
        isVisible: true
      },
      {
        title: "Une Tache sur le Visage",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_UNE_TACHE_SUR_LE_VISAGE_GOUACHE_ET_ACRYLIQUE_SUR_TOILE.jpg",
        dimensions: "65 x 50 cm",
        technique: "Gouache et acrylique sur toile",
        year: "2023",
        description: "Exploration de l'imperfection comme beauté. Cette œuvre questionne nos perceptions de l'idéal esthétique.",
        isVisible: true
      },
      {
        title: "Un Amour Impossible",
        imageUrl: "https://www.galerie-breheret.com/datas/img/IVAN_GAUTHIER_UN_AMOUR_IMPOSSIBLE_61X48CM_AQUARELLE.jpg",
        dimensions: "61 x 48 cm",
        technique: "Aquarelle sur papier",
        year: "2022",
        description: "Portrait intimiste qui exprime la douleur et la beauté d'un amour non partagé à travers des tons subtils.",
        isVisible: true
      },
      {
        title: "Composition Abstraite I",
        imageUrl: "https://www.googleapis.com/download/storage/v1/b/ya-d-ups/o/xl_IMG_0887_5d1e1d8b-a08b-49ad-9ce6-c11babdbb5dc.webp?generation=1736331786837999&alt=media",
        dimensions: "80 x 60 cm",
        technique: "Technique mixte sur toile",
        year: "2024",
        description: "Exploration abstraite des formes et des couleurs, où l'intuition guide la création vers des territoires inexplorés.",
        isVisible: true
      },
      {
        title: "Composition Abstraite II",
        imageUrl: "https://www.googleapis.com/download/storage/v1/b/ya-d-ups/o/xl_IMG_0896_c15d842a-4e41-409e-bc84-7b09358b2847.webp?generation=1736332385784926&alt=media",
        dimensions: "80 x 60 cm",
        technique: "Technique mixte sur toile",
        year: "2024",
        description: "Continuation de la série abstraite, où les textures et les nuances créent un dialogue visuel captivant.",
        isVisible: true
      },
      {
        title: "Étude Contemporaine",
        imageUrl: "https://www.googleapis.com/download/storage/v1/b/ya-d-ups/o/xl_IMG_0884_a5cf1ecb-1036-449e-a0e0-83ec0aff1d80.webp?generation=1736330845447728&alt=media",
        dimensions: "70 x 50 cm",
        technique: "Technique mixte sur papier",
        year: "2024",
        description: "Œuvre contemporaine qui mélange figuration et abstraction dans une harmonie visuelle unique.",
        isVisible: true
      }
    ];

    artworks.forEach(artwork => {
      const id = this.currentArtworkId++;
      this.artworks.set(id, { ...artwork, id, isVisible: artwork.isVisible ?? true });
    });
  }

  private initializeExhibitions() {
    const exhibitions = [
      {
        title: "Paris",
        location: "Galerie Bréheret, Paris",
        year: "2023",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        description: "Exposition personnelle présentant la série 'Juste en Bleu' et les portraits contemporains d'Ivan Gauthier. Cette exposition marque un tournant dans l'œuvre de l'artiste, explorant les frontières entre figuration et abstraction.",
        galleryImages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
      },
      {
        title: "New York",
        location: "Manhattan Art Gallery, New York",
        year: "2024",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        description: "Première exposition internationale d'Ivan Gauthier aux États-Unis. Une sélection d'œuvres récentes qui témoigne de la maturité artistique de l'artiste et de sa reconnaissance sur la scène internationale.",
        galleryImages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: null
      },
      {
        title: "Rome",
        location: "Palazzo delle Esposizioni, Rome",
        year: "2024",
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800",
        description: "Exposition collective prestigieuse réunissant les artistes contemporains européens les plus prometteurs. Ivan Gauthier y présente ses dernières créations abstraites.",
        galleryImages: [
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
        ],
        videoUrl: null
      }
    ];

    exhibitions.forEach(exhibition => {
      const id = this.currentExhibitionId++;
      this.exhibitions.set(id, { 
        ...exhibition, 
        id,
        galleryImages: exhibition.galleryImages ?? null,
        videoUrl: exhibition.videoUrl ?? null
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getArtworks(): Promise<Artwork[]> {
    return Array.from(this.artworks.values()).filter(artwork => artwork.isVisible);
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = this.currentArtworkId++;
    const artwork: Artwork = { ...insertArtwork, id };
    this.artworks.set(id, artwork);
    return artwork;
  }

  async getExhibitions(): Promise<Exhibition[]> {
    return Array.from(this.exhibitions.values());
  }

  async getExhibition(id: number): Promise<Exhibition | undefined> {
    return this.exhibitions.get(id);
  }

  async createExhibition(insertExhibition: InsertExhibition): Promise<Exhibition> {
    const id = this.currentExhibitionId++;
    const exhibition: Exhibition = { ...insertExhibition, id };
    this.exhibitions.set(id, exhibition);
    return exhibition;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentMessageId++;
    const message: ContactMessage = { ...insertMessage, id };
    this.contactMessages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
