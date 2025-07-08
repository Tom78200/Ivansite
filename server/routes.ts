import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArtworkSchema, insertExhibitionSchema, insertContactMessageSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import type { Multer, FileFilterCallback } from "multer";
import { fileURLToPath } from 'url';
import sharp from "sharp";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, path.join(__dirname, "../public/images/"));
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
  }),
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Seules les images sont autorisées"));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5 Mo max
});

// Middleware de protection admin
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any).isAdmin) return next();
  res.status(401).json({ error: "Non authentifié" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all artworks
  app.get("/api/artworks", async (req, res) => {
    try {
      const artworks = await storage.getArtworks();
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  // Récupérer les slots
  app.get("/api/artworks/slots", requireAdmin, async (req, res) => {
    const slots = await storage.getSlots();
    res.json(slots);
  });

  // Sauvegarder les slots
  app.put("/api/artworks/slots", requireAdmin, async (req, res) => {
    const slots = req.body;
    if (!Array.isArray(slots) || slots.length !== 3) {
      return res.status(400).json({ error: "Format de slots invalide" });
    }
    await storage.setSlots(slots);
    res.json({ success: true });
  });

  // Get single artwork
  app.get("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const artwork = await storage.getArtwork(id);
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artwork" });
    }
  });

  // Create artwork
  app.post("/api/artworks", async (req, res) => {
    try {
      const validatedData = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(validatedData);
      res.status(201).json(artwork);
    } catch (error) {
      res.status(400).json({ error: "Invalid artwork data" });
    }
  });

  // Get all exhibitions
  app.get("/api/exhibitions", async (req, res) => {
    try {
      const exhibitions = await storage.getExhibitions();
      res.json(exhibitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exhibitions" });
    }
  });

  // Get single exhibition
  app.get("/api/exhibitions/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const exhibition = await storage.getExhibition(id);
      if (!exhibition) {
        return res.status(404).json({ error: "Exhibition not found" });
      }
      res.json(exhibition);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exhibition" });
    }
  });

  // Create exhibition
  app.post("/api/exhibitions", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertExhibitionSchema.parse(req.body);
      const exhibition = await storage.createExhibition(validatedData);
      res.status(201).json(exhibition);
    } catch (error) {
      res.status(400).json({ error: "Invalid exhibition data" });
    }
  });

  // Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(validatedData);
      res.status(201).json({ success: true, id: message.id });
    } catch (error) {
      res.status(400).json({ error: "Invalid contact form data" });
    }
  });

  // Delete artwork
  app.delete("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteArtwork(id);
      if (!deleted) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete artwork" });
    }
  });

  // Upload image
  app.post("/api/upload", requireAdmin, upload.single("image"), async (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File;
    if (!file) {
      return res.status(400).json({ error: "Aucun fichier reçu" });
    }
    // Compression automatique
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const filePath = file.path;
    if (ext === "jpg" || ext === "jpeg") {
      await sharp(filePath).jpeg({ quality: 80 }).toFile(filePath + ".tmp");
      fs.renameSync(filePath + ".tmp", filePath);
    } else if (ext === "png") {
      await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(filePath + ".tmp");
      fs.renameSync(filePath + ".tmp", filePath);
    }
    const imageUrl = `/images/${file.filename}`;
    res.json({ imageUrl });
  });

  // Mettre à jour la galerie d'une exposition
  app.put("/api/exhibitions/:id/gallery", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const galleryImages = req.body;
      console.log("[DEBUG] Body reçu pour la galerie:", JSON.stringify(galleryImages));
      if (!Array.isArray(galleryImages)) {
        return res.status(400).json({ error: "Format de galerie invalide" });
      }
      const expo = await storage.updateExhibitionGallery(id, galleryImages);
      if (!expo) {
        return res.status(404).json({ error: "Exposition non trouvée" });
      }
      res.json(expo);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de la galerie" });
    }
  });

  // Supprimer une exposition
  app.delete("/api/exhibitions/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteExhibition(id);
      if (!deleted) {
        return res.status(404).json({ error: "Exposition non trouvée" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'exposition" });
    }
  });

  // Authentification admin (login)
  app.post("/api/login", (req, res) => {
    const { password } = req.body;
    if (password === "Guthier2024!") {
      (req.session as any).isAdmin = true;
      return res.json({ success: true });
    }
    res.status(401).json({ error: "Mot de passe incorrect" });
  });

  // Déconnexion admin (logout)
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Réordonner les œuvres
  app.put("/api/artworks/order", requireAdmin, async (req, res) => {
    try {
      const newOrder = req.body;
      console.log("[DEBUG] Reorder artworks reçu:", JSON.stringify(newOrder));
      if (!Array.isArray(newOrder)) {
        return res.status(400).json({ error: "Format invalide" });
      }
      await storage.reorderArtworks(newOrder);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du réordonnancement" });
    }
  });

  // Récupérer les œuvres phares
  app.get("/api/artworks/featured", requireAdmin, async (req, res) => {
    const featured = await storage.getFeatured();
    res.json(featured);
  });

  // Sauvegarder les œuvres phares
  app.put("/api/artworks/featured", requireAdmin, async (req, res) => {
    const featured = req.body;
    if (!Array.isArray(featured) || featured.length > 6) {
      return res.status(400).json({ error: "Format de featured invalide" });
    }
    await storage.setFeatured(featured);
    res.json({ success: true });
  });

  // Route publique pour les œuvres phares
  app.get("/api/artworks/featured-public", async (req, res) => {
    const featuredIds = await storage.getFeatured();
    const allArtworks = await storage.getArtworks();
    const featuredArtworks = allArtworks.filter(a => featuredIds.includes(a.id));
    res.json(featuredArtworks);
  });

  // Œuvres phares indépendantes
  app.get("/api/featured-works", requireAdmin, async (req, res) => {
    res.json(await storage.getFeaturedWorks());
  });
  app.post("/api/featured-works", requireAdmin, upload.single("image"), async (req, res) => {
    const { title, description, year, technique } = req.body;
    let imageUrl = "";
    if (req.file) {
      // Compression automatique
      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      const filePath = req.file.path;
      if (ext === "jpg" || ext === "jpeg") {
        await sharp(filePath).jpeg({ quality: 80 }).toFile(filePath + ".tmp");
        fs.renameSync(filePath + ".tmp", filePath);
      } else if (ext === "png") {
        await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(filePath + ".tmp");
        fs.renameSync(filePath + ".tmp", filePath);
      }
      imageUrl = "/images/" + req.file.filename;
    }
    const id = Date.now();
    await storage.addFeaturedWork({ id, imageUrl, title, description, year, technique });
    res.json({ success: true });
  });
  app.put("/api/featured-works/:id", requireAdmin, upload.single("image"), async (req, res) => {
    const { title, description, year, technique } = req.body;
    const id = Number(req.params.id);
    let imageUrl = undefined;
    if (req.file) {
      // Compression automatique
      const ext = req.file.originalname.split('.').pop()?.toLowerCase();
      const filePath = req.file.path;
      if (ext === "jpg" || ext === "jpeg") {
        await sharp(filePath).jpeg({ quality: 80 }).toFile(filePath + ".tmp");
        fs.renameSync(filePath + ".tmp", filePath);
      } else if (ext === "png") {
        await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(filePath + ".tmp");
        fs.renameSync(filePath + ".tmp", filePath);
      }
      imageUrl = "/images/" + req.file.filename;
    }
    await storage.updateFeaturedWork(id, { title, description, year, technique, ...(imageUrl ? { imageUrl } : {}) });
    res.json({ success: true });
  });
  app.delete("/api/featured-works/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteFeaturedWork(id);
    res.json({ success: true });
  });
  app.get("/api/featured-works/public", async (req, res) => {
    res.json(await storage.getFeaturedWorks());
  });

  const httpServer = createServer(app);
  return httpServer;
}
