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
