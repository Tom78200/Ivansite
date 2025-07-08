import { fileURLToPath } from 'url';
import path from 'path';
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
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTWORKS_PATH = path.join(__dirname, "artworks.json");
const EXHIBITIONS_PATH = path.join(__dirname, "exhibitions.json");
const SLOTS_PATH = path.join(__dirname, "slots.json");
const FEATURED_PATH = path.join(__dirname, "featured.json");
const FEATURED_WORKS_PATH = path.join(__dirname, "featured-works.json");

export interface FeaturedWork {
  id: number;
  imageUrl: string;
  title: string;
  description?: string;
  year?: string;
  technique?: string;
}

function loadArtworksFromFile(): Artwork[] {
  try {
    const data = fs.readFileSync(ARTWORKS_PATH, "utf-8");
    const arr = JSON.parse(data);
    return arr.map((a: any, idx: number) => ({ ...a, order: typeof a.order === "number" ? a.order : idx }));
  } catch (e) {
    return [];
  }
}

function saveArtworksToFile(artworks: Artwork[]) {
  fs.writeFileSync(ARTWORKS_PATH, JSON.stringify(artworks, null, 2), "utf-8");
}

function loadExhibitionsFromFile(): Exhibition[] {
  try {
    const data = fs.readFileSync(EXHIBITIONS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveExhibitionsToFile(exhibitions: Exhibition[]) {
  fs.writeFileSync(EXHIBITIONS_PATH, JSON.stringify(exhibitions, null, 2), "utf-8");
}

function loadSlotsFromFile(): (number|null)[] {
  try {
    const data = fs.readFileSync(SLOTS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [null, null, null];
  }
}

function saveSlotsToFile(slots: (number|null)[]) {
  fs.writeFileSync(SLOTS_PATH, JSON.stringify(slots, null, 2), "utf-8");
}

function loadFeaturedFromFile(): number[] {
  try {
    const data = fs.readFileSync(FEATURED_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveFeaturedToFile(featured: number[]) {
  fs.writeFileSync(FEATURED_PATH, JSON.stringify(featured, null, 2), "utf-8");
}

function loadFeaturedWorksFromFile(): FeaturedWork[] {
  try {
    const data = fs.readFileSync(FEATURED_WORKS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

function saveFeaturedWorksToFile(works: FeaturedWork[]) {
  fs.writeFileSync(FEATURED_WORKS_PATH, JSON.stringify(works, null, 2), "utf-8");
}

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

  deleteArtwork(id: number): Promise<boolean>;

  updateExhibitionGallery(id: number, galleryImages: { url: string; caption: string }[]): Promise<Exhibition | undefined>;

  deleteExhibition(id: number): Promise<boolean>;

  reorderArtworks(newOrder: {id: number, order: number}[]): Promise<void>;

  getSlots(): Promise<(number | null)[]>;
  setSlots(slots: (number | null)[]): Promise<void>;

  getFeatured(): Promise<number[]>;
  setFeatured(featured: number[]): Promise<void>;

  getFeaturedWorks(): Promise<FeaturedWork[]>;
  addFeaturedWork(work: FeaturedWork): Promise<void>;
  updateFeaturedWork(id: number, data: Partial<FeaturedWork>): Promise<void>;
  deleteFeaturedWork(id: number): Promise<void>;
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
  private slots: (number | null)[];
  private featured: number[];
  private featuredWorks: FeaturedWork[] = loadFeaturedWorksFromFile();

  constructor() {
    this.users = new Map();
    this.artworks = new Map();
    this.exhibitions = new Map();
    this.contactMessages = new Map();
    this.currentUserId = 1;
    this.currentArtworkId = 1;
    this.currentExhibitionId = 1;
    this.currentMessageId = 1;
    
    // Initialisation des œuvres depuis le fichier JSON
    this.loadArtworks();
    this.loadExhibitions();
    this.slots = loadSlotsFromFile();
    this.featured = loadFeaturedFromFile();
  }

  private loadArtworks() {
    const loaded = loadArtworksFromFile();
    loaded.forEach(artwork => {
      this.artworks.set(artwork.id, artwork);
      if (artwork.id >= this.currentArtworkId) {
        this.currentArtworkId = artwork.id + 1;
      }
    });
  }

  private saveArtworks() {
    saveArtworksToFile(Array.from(this.artworks.values()));
  }

  private loadExhibitions() {
    const loaded = loadExhibitionsFromFile();
    loaded.forEach(expo => {
      this.exhibitions.set(expo.id, expo);
      if (expo.id >= this.currentExhibitionId) {
        this.currentExhibitionId = expo.id + 1;
      }
    });
  }

  private saveExhibitions() {
    saveExhibitionsToFile(Array.from(this.exhibitions.values()));
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
    return Array.from(this.artworks.values())
      .filter(artwork => artwork.isVisible)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  async getArtwork(id: number): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = this.currentArtworkId++;
    const all = Array.from(this.artworks.values());
    const artwork: Artwork = { 
      ...insertArtwork, 
      id,
      isVisible: insertArtwork.isVisible ?? true,
      showInSlider: insertArtwork.showInSlider ?? true,
      order: typeof insertArtwork.order === "number" ? insertArtwork.order : all.length
    };
    this.artworks.set(id, artwork);
    this.saveArtworks();
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
    const exhibition: Exhibition = {
      ...insertExhibition,
      id,
      galleryImages: insertExhibition.galleryImages ?? [],
      videoUrl: insertExhibition.videoUrl ?? null
    };
    this.exhibitions.set(id, exhibition);
    this.saveExhibitions();
    return exhibition;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = this.currentMessageId++;
    const message: ContactMessage = { ...insertMessage, id };
    this.contactMessages.set(id, message);
    return message;
  }

  async deleteArtwork(id: number): Promise<boolean> {
    if (this.artworks.has(id)) {
      this.artworks.delete(id);
      this.saveArtworks();
      return true;
    }
    return false;
  }

  async updateExhibitionGallery(id: number, galleryImages: { url: string; caption: string }[]): Promise<Exhibition | undefined> {
    const expo = this.exhibitions.get(id);
    if (!expo) return undefined;
    expo.galleryImages = galleryImages;
    this.exhibitions.set(id, expo);
    this.saveExhibitions();
    return expo;
  }

  async deleteExhibition(id: number): Promise<boolean> {
    if (this.exhibitions.has(id)) {
      this.exhibitions.delete(id);
      this.saveExhibitions();
      return true;
    }
    return false;
  }

  async reorderArtworks(newOrder: {id: number, order: number}[]): Promise<void> {
    const all = Array.from(this.artworks.values());
    // Mettre à jour le champ order de chaque œuvre
    newOrder.forEach(({id, order}) => {
      const a = all.find(a => a.id === id);
      if (a) a.order = order;
    });
    // Re-trier et sauvegarder
    const final = [...all].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.artworks = new Map(final.map(a => [a.id, a]));
    this.saveArtworks();
  }

  async getSlots(): Promise<(number | null)[]> {
    return this.slots;
  }

  async setSlots(slots: (number | null)[]): Promise<void> {
    this.slots = slots;
    saveSlotsToFile(slots);
  }

  async getFeatured(): Promise<number[]> {
    return this.featured;
  }

  async setFeatured(featured: number[]): Promise<void> {
    this.featured = featured;
    saveFeaturedToFile(featured);
  }

  async getFeaturedWorks(): Promise<FeaturedWork[]> {
    return this.featuredWorks;
  }

  async addFeaturedWork(work: FeaturedWork): Promise<void> {
    this.featuredWorks.push(work);
    saveFeaturedWorksToFile(this.featuredWorks);
  }

  async updateFeaturedWork(id: number, data: Partial<FeaturedWork>): Promise<void> {
    const idx = this.featuredWorks.findIndex((w: FeaturedWork) => w.id === id);
    if (idx !== -1) {
      this.featuredWorks[idx] = { ...this.featuredWorks[idx], ...data };
      saveFeaturedWorksToFile(this.featuredWorks);
    }
  }

  async deleteFeaturedWork(id: number): Promise<void> {
    this.featuredWorks = this.featuredWorks.filter((w: FeaturedWork) => w.id !== id);
    saveFeaturedWorksToFile(this.featuredWorks);
  }
}

export const storage = new MemStorage();
