import type { Express } from "express";
import dotenv from "dotenv";
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
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hasSupabase = !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE && !!process.env.SUPABASE_BUCKET;
const forceSupabase = process.env.FORCE_SUPABASE === "1" || process.env.FORCE_SUPABASE === "true";
const supabase = hasSupabase
  ? createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE as string)
  : null;
const featuredTable = (process.env.SUPABASE_FEATURED_TABLE || "featured_works");

const upload = multer({
  storage: hasSupabase
    ? multer.memoryStorage()
    : multer.diskStorage({
        destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
          cb(null, path.join(__dirname, "../public/images/"));
        },
        filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        },
      }),
  fileFilter: (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Seules les images sont autorisées"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

async function uploadBufferToSupabase(originalName: string, mimeType: string, buffer: Buffer): Promise<string> {
  if (!supabase) throw new Error("Supabase non configuré");
  const bucket = process.env.SUPABASE_BUCKET as string;
  const ext = path.extname(originalName) || '.jpg';
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const storagePath = `images/${uniqueName}`;
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, { contentType: mimeType, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

// Middleware de protection admin
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if ((req.session as any).isAdmin) return next();
  res.status(401).json({ error: "Non authentifié" });
}

function extractSupabasePathFromPublicUrl(publicUrl: string, bucket: string): string | null {
  try {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.slice(idx + marker.length);
  } catch {
    return null;
  }
}

async function deleteSupabasePublicFile(publicUrl: string): Promise<void> {
  if (!supabase) return;
  const bucket = process.env.SUPABASE_BUCKET as string;
  const pathInBucket = extractSupabasePathFromPublicUrl(publicUrl, bucket);
  if (!pathInBucket) return;
  await supabase.storage.from(bucket).remove([pathInBucket]);
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all artworks
  app.get("/api/artworks", async (req, res) => {
    try {
      let artworks;
      
      // Essayer de lire depuis Supabase d'abord
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('is_visible', true)
            .order('order', { ascending: true });
          
          if (!error && data) {
            artworks = data.map(artwork => ({
              id: artwork.id,
              title: artwork.title,
              imageUrl: artwork.image_url,
              dimensions: artwork.dimensions,
              technique: artwork.technique,
              year: artwork.year,
              description: artwork.description,
              isVisible: artwork.is_visible,
              showInSlider: artwork.show_in_slider,
              order: artwork.order
            }));
          }
        } catch (e) {
          console.warn('Erreur lecture Supabase artworks:', e);
        }
      }
      
      // Fallback vers le storage local si Supabase échoue
      if (!artworks) {
        artworks = await storage.getArtworks();
      }
      
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

  // Diagnostic de stockage (admin)
  app.get("/api/storage/diagnostics", requireAdmin, async (_req, res) => {
    try {
      const diagnostics = {
        supabaseConfigured: !!supabase,
        hasSupabaseEnv: {
          SUPABASE_URL: !!process.env.SUPABASE_URL,
          SUPABASE_SERVICE_ROLE: !!process.env.SUPABASE_SERVICE_ROLE,
          SUPABASE_BUCKET: !!process.env.SUPABASE_BUCKET,
        },
        bucket: process.env.SUPABASE_BUCKET || null,
        featuredTable,
        uploadStrategy: supabase ? "supabase" : "local-disk",
      };
      res.json(diagnostics);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Diagnostics failed" });
    }
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
      
      // Sauvegarder aussi dans Supabase pour la persistance
      if (supabase) {
        try {
          await supabase.from('artworks').insert({
            id: artwork.id,
            title: artwork.title,
            image_url: artwork.imageUrl,
            dimensions: artwork.dimensions,
            technique: artwork.technique,
            year: artwork.year,
            description: artwork.description,
            is_visible: artwork.isVisible,
            show_in_slider: artwork.showInSlider,
            order: artwork.order
          });
        } catch (e) {
          console.warn('Erreur sauvegarde Supabase artwork:', e);
        }
      }
      
      res.status(201).json(artwork);
    } catch (error) {
      res.status(400).json({ error: "Invalid artwork data" });
    }
  });

  // Get all exhibitions
  app.get("/api/exhibitions", async (req, res) => {
    try {
      let exhibitions;
      
      // Essayer de lire depuis Supabase d'abord
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('exhibitions')
            .select('*')
            .order('order', { ascending: true });
          
          if (!error && data) {
            exhibitions = data.map(exhibition => ({
              id: exhibition.id,
              title: exhibition.title,
              location: exhibition.location,
              year: exhibition.year,
              imageUrl: exhibition.image_url,
              description: exhibition.description,
              galleryImages: exhibition.gallery_images || [],
              videoUrl: exhibition.video_url,
              order: exhibition.order
            }));
          }
        } catch (e) {
          console.warn('Erreur lecture Supabase exhibitions:', e);
        }
      }
      
      // Fallback vers le storage local si Supabase échoue
      if (!exhibitions) {
        exhibitions = await storage.getExhibitions();
      }
      
      res.setHeader("Cache-Control", "no-store");
      res.json(exhibitions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exhibitions" });
    }
  });

  // Réordonner les expositions
  app.put("/api/exhibitions/order", requireAdmin, async (req, res) => {
    try {
      const newOrder = req.body;
      if (!Array.isArray(newOrder)) {
        return res.status(400).json({ error: "Format invalide" });
      }
      await storage.reorderExhibitions(newOrder);
      
      // Sauvegarder aussi dans Supabase pour la persistance
      if (supabase) {
        try {
          for (const { id, order } of newOrder) {
            await supabase.from('exhibitions').update({ order }).eq('id', id);
          }
        } catch (e) {
          console.warn('Erreur sauvegarde Supabase exhibitions order:', e);
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors du réordonnancement des expositions" });
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
      
      // Sauvegarder aussi dans Supabase pour la persistance
      if (supabase) {
        try {
          await supabase.from('exhibitions').insert({
            id: exhibition.id,
            title: exhibition.title,
            location: exhibition.location,
            year: exhibition.year,
            image_url: exhibition.imageUrl,
            description: exhibition.description,
            gallery_images: exhibition.galleryImages || [],
            video_url: exhibition.videoUrl || null,
            order: exhibition.order
          });
        } catch (e) {
          console.warn('Erreur sauvegarde Supabase exhibition:', e);
        }
      }
      
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
      // Envoi d'un email via nodemailer si configuré
      try {
        const hasSmtp = !!process.env.SMTP_HOST && !!process.env.SMTP_USER && !!process.env.SMTP_PASS;
        if (hasSmtp) {
          const nodemailer = await import('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            secure: process.env.SMTP_SECURE === '1' || process.env.SMTP_SECURE === 'true',
            auth: { user: process.env.SMTP_USER as string, pass: process.env.SMTP_PASS as string },
          });
          await transporter.sendMail({
            from: `Site Ivan Gauthier <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: process.env.SMTP_TO || 'ivangauthier009@gmail.com',
            subject: `Nouveau message de contact: ${validatedData.name}`,
            replyTo: validatedData.email,
            text: `Nom: ${validatedData.name}\nEmail: ${validatedData.email}\n\nMessage:\n${validatedData.message}`,
          });
        }
      } catch (e) {
        console.warn('[CONTACT] Email non envoyé:', (e as any)?.message || e);
      }
      res.status(201).json({ success: true, id: message.id });
    } catch (error) {
      res.status(400).json({ error: "Invalid contact form data" });
    }
  });

  // Delete artwork
  app.delete("/api/artworks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getArtwork(id);
      const deleted = await storage.deleteArtwork(id);
      if (!deleted) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      
      // Supprimer aussi de Supabase pour la persistance
      if (supabase) {
        try {
          await supabase.from('artworks').delete().eq('id', id);
        } catch (e) {
          console.warn('Erreur suppression Supabase artwork:', e);
        }
      }
      
      if (supabase && existing?.imageUrl && existing.imageUrl.startsWith("http")) {
        try { await deleteSupabasePublicFile(existing.imageUrl); } catch {}
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
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    try {
      if (forceSupabase && !supabase) {
        return res.status(500).json({ error: "Supabase requis: configurez SUPABASE_URL, SUPABASE_SERVICE_ROLE, SUPABASE_BUCKET" });
      }
      console.log("[UPLOAD] Strategy:", supabase ? "supabase" : (forceSupabase ? "blocked-no-supabase" : "local-disk"));
      if (supabase) {
        console.log("[UPLOAD] Supabase bucket:", process.env.SUPABASE_BUCKET);
      }
      if (supabase) {
        let processed: Buffer;
        if (ext === "jpg" || ext === "jpeg") {
          processed = await sharp(file.buffer).jpeg({ quality: 80 }).toBuffer();
        } else if (ext === "png") {
          processed = await sharp(file.buffer).png({ quality: 80, compressionLevel: 8 }).toBuffer();
        } else {
          processed = file.buffer;
        }
        const publicUrl = await uploadBufferToSupabase(file.originalname, file.mimetype, processed);
        console.log("[UPLOAD] Supabase public URL:", publicUrl);
        return res.json({ imageUrl: publicUrl });
      } else {
        // fallback disque local
        const filePath = (file as any).path as string;
        if (ext === "jpg" || ext === "jpeg") {
          await sharp(filePath).jpeg({ quality: 80 }).toFile(filePath + ".tmp");
          fs.renameSync(filePath + ".tmp", filePath);
        } else if (ext === "png") {
          await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(filePath + ".tmp");
          fs.renameSync(filePath + ".tmp", filePath);
        }
        const imageUrl = `/images/${file.filename}`;
        console.log("[UPLOAD] Local image URL:", imageUrl);
        return res.json({ imageUrl });
      }
    } catch (e: any) {
      return res.status(500).json({ error: e.message || "Échec de l'upload" });
    }
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
      // Récupérer l'exposition existante pour détecter les suppressions
      const existingExpo = await storage.getExhibition(id);
      // Déterminer les URLs supprimées
      const previousUrls = new Set((existingExpo?.galleryImages || []).map((g: any) => g.url).filter(Boolean));
      const nextUrls = new Set(galleryImages.map((g: any) => g.url).filter(Boolean));
      const removed: string[] = [];
      previousUrls.forEach((url: string) => { if (!nextUrls.has(url)) removed.push(url); });

      // Supprimer les fichiers correspondants si nécessaire
      for (const url of removed) {
        try {
          if (supabase && url.startsWith("http")) {
            await deleteSupabasePublicFile(url);
          } else if (url.startsWith("/images/")) {
            const fileName = path.basename(url);
            const localPath = path.join(__dirname, "../public/images/", fileName);
            if (fs.existsSync(localPath)) {
              fs.unlinkSync(localPath);
            }
          }
        } catch (e) {
          console.warn("[GALLERY_DELETE] Échec suppression fichier:", url, (e as any)?.message || e);
        }
      }

      const expo = await storage.updateExhibitionGallery(id, galleryImages);
      if (!expo) {
        return res.status(404).json({ error: "Exposition non trouvée" });
      }
      
      // Sauvegarder aussi dans Supabase pour la persistance
      if (supabase) {
        try {
          await supabase.from('exhibitions').update({
            gallery_images: galleryImages
          }).eq('id', id);
        } catch (e) {
          console.warn('Erreur sauvegarde Supabase gallery:', e);
        }
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
      const existing = await storage.getExhibition(id);
      const deleted = await storage.deleteExhibition(id);
      if (!deleted) {
        return res.status(404).json({ error: "Exposition non trouvée" });
      }
      
      // Supprimer aussi de Supabase pour la persistance
      if (supabase) {
        try {
          await supabase.from('exhibitions').delete().eq('id', id);
        } catch (e) {
          console.warn('Erreur suppression Supabase exhibition:', e);
        }
      }
      if (existing) {
        // Supprimer l'image de couverture
        try {
          if (supabase && existing.imageUrl && existing.imageUrl.startsWith("http")) {
            await deleteSupabasePublicFile(existing.imageUrl);
          } else if (existing.imageUrl && existing.imageUrl.startsWith("/images/")) {
            const coverBasename = path.basename(existing.imageUrl);
            const coverLocal = path.join(__dirname, "../public/images/", coverBasename);
            if (fs.existsSync(coverLocal)) fs.unlinkSync(coverLocal);
          }
        } catch {}
        // Supprimer les images de galerie
        const gallery = (existing as any).galleryImages as { url: string; caption: string }[] | undefined;
        if (Array.isArray(gallery)) {
          for (const gi of gallery) {
            try {
              if (supabase && gi?.url && gi.url.startsWith("http")) {
                await deleteSupabasePublicFile(gi.url);
              } else if (gi?.url && gi.url.startsWith("/images/")) {
                const base = path.basename(gi.url);
                const p = path.join(__dirname, "../public/images/", base);
                if (fs.existsSync(p)) fs.unlinkSync(p);
              }
            } catch {}
          }
        }
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
      
      // Sauvegarder aussi dans Supabase pour la persistance
      if (supabase) {
        try {
          for (const { id, order } of newOrder) {
            await supabase.from('artworks').update({ order }).eq('id', id);
          }
        } catch (e) {
          console.warn('Erreur sauvegarde Supabase order:', e);
        }
      }
      
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

  // Helper: fetch featured rows ordered, compatible si colonne 'order' absente
  async function fetchFeaturedRowsOrdered() {
    if (!supabase) return { data: null as any, error: new Error("no supabase") };
    let q = await supabase.from(featuredTable).select("id,image_url,title,description,year,technique,created_at,order").order("order", { ascending: true }).order("created_at", { ascending: false });
    if (q.error) {
      q = await supabase.from(featuredTable).select("id,image_url,title,description,year,technique,created_at").order("created_at", { ascending: false });
    }
    return q;
  }

  // Œuvres phares indépendantes (Supabase table si dispo, sinon fallback fichier)
  app.get("/api/featured-works", requireAdmin, async (_req, res) => {
    if (supabase) {
      const { data, error } = await fetchFeaturedRowsOrdered();
      if (error) {
        res.setHeader("Cache-Control", "no-store");
        return res.json(await storage.getFeaturedWorks());
      }
      res.setHeader("Cache-Control", "no-store");
      return res.json((data || []).map((r: any) => ({ id: r.id, imageUrl: r.image_url, title: r.title, description: r.description, year: r.year, technique: r.technique })));
    }
    res.setHeader("Cache-Control", "no-store");
    res.json(await storage.getFeaturedWorks());
  });

  app.post("/api/featured-works", requireAdmin, upload.single("image"), async (req, res) => {
    const { title, description, year, technique } = req.body;
    let imageUrl = "";
    if (req.file) {
      const ext2 = req.file.originalname.split('.').pop()?.toLowerCase();
      if (supabase) {
        let processed: Buffer;
        if (ext2 === "jpg" || ext2 === "jpeg") {
          processed = await sharp(req.file.buffer).jpeg({ quality: 80 }).toBuffer();
        } else if (ext2 === "png") {
          processed = await sharp(req.file.buffer).png({ quality: 80, compressionLevel: 8 }).toBuffer();
        } else {
          processed = req.file.buffer;
        }
        imageUrl = await uploadBufferToSupabase(req.file.originalname, req.file.mimetype, processed);
      } else {
        const filePath = (req.file as any).path as string;
        if (ext2 === "jpg" || ext2 === "jpeg") {
          await sharp(filePath).jpeg({ quality: 80 }).toFile(filePath + ".tmp");
          fs.renameSync(filePath + ".tmp", filePath);
        } else if (ext2 === "png") {
          await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(filePath + ".tmp");
          fs.renameSync(filePath + ".tmp", filePath);
        }
        imageUrl = "/images/" + req.file.filename;
      }
    }
    if (supabase) {
      // Déterminer le prochain ordre (si la colonne existe)
      let nextOrder = undefined as number | undefined;
      try {
        const { data: maxRow } = await supabase.from(featuredTable).select("order").order("order", { ascending: false }).limit(1);
        if (maxRow && maxRow.length > 0 && typeof (maxRow[0] as any).order === 'number') {
          nextOrder = ((maxRow[0] as any).order as number) + 1;
        }
      } catch {}
      const insertPayload: any = { image_url: imageUrl, title, description, year, technique };
      if (typeof nextOrder === 'number') insertPayload.order = nextOrder;
      const { error } = await supabase.from(featuredTable).insert(insertPayload);
      if (!error) return res.json({ success: true });
      // Fallback si la table n'existe pas
      const msg = String(error.message || "").toLowerCase();
      if (!msg.includes("could not find the table")) {
        return res.status(500).json({ error: error.message });
      }
      // sinon, on passe en local
    }
    const id = Date.now();
    await storage.addFeaturedWork({ id, imageUrl, title, description, year, technique });
    res.json({ success: true });
  });

  app.put("/api/featured-works/:id", requireAdmin, upload.single("image"), async (req, res) => {
    const { title, description, year, technique } = req.body;
    const id = Number(req.params.id);
    let imageUrl = undefined as string | undefined;
    if (req.file) {
      const ext3 = req.file.originalname.split('.').pop()?.toLowerCase();
      if (supabase) {
        let processed: Buffer;
        if (ext3 === "jpg" || ext3 === "jpeg") {
          processed = await sharp(req.file.buffer).jpeg({ quality: 80 }).toBuffer();
        } else if (ext3 === "png") {
          processed = await sharp(req.file.buffer).png({ quality: 80, compressionLevel: 8 }).toBuffer();
        } else {
          processed = req.file.buffer;
        }
        imageUrl = await uploadBufferToSupabase(req.file.originalname, req.file.mimetype, processed);
      } else {
        const filePath = (req.file as any).path as string;
        if (ext3 === "jpg" || ext3 === "jpeg") {
          await sharp(filePath).jpeg({ quality: 80 }).toFile(filePath + ".tmp");
          fs.renameSync(filePath + ".tmp", filePath);
        } else if (ext3 === "png") {
          await sharp(filePath).png({ quality: 80, compressionLevel: 8 }).toFile(filePath + ".tmp");
          fs.renameSync(filePath + ".tmp", filePath);
        }
        imageUrl = "/images/" + req.file.filename;
      }
    }
    if (supabase) {
      const payload: any = { title, description, year, technique };
      if (imageUrl) payload.image_url = imageUrl;
      const { error } = await supabase.from(featuredTable).update(payload).eq("id", id);
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    }
    await storage.updateFeaturedWork(id, { title, description, year, technique, ...(imageUrl ? { imageUrl } : {}) });
    res.json({ success: true });
  });

  app.delete("/api/featured-works/:id", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    let supabaseOk = false;
    let localOk = false;
    let supabaseUrl: string | undefined = undefined;

    // Tenter de charger l'URL depuis la source locale (au cas où la ligne supabase n'existe pas)
    try {
      const localList = await storage.getFeaturedWorks();
      const localItem = localList.find((w: any) => w.id === id);
      if (localItem?.imageUrl && String(localItem.imageUrl).startsWith("http")) {
        supabaseUrl = localItem.imageUrl as string;
      }
    } catch {}

    // Tenter suppression côté Supabase (ligne + fichier)
    if (supabase) {
      try {
        const { data: rowToDelete } = await supabase.from(featuredTable).select("image_url").eq("id", id).maybeSingle();
        const { error } = await supabase.from(featuredTable).delete().eq("id", id);
        if (!error) {
          supabaseOk = true;
          const url = (rowToDelete?.image_url as string) || supabaseUrl;
          if (url) {
            try { await deleteSupabasePublicFile(url); } catch {}
          }
        } else {
          // ignorer si la table n'existe pas
          const msg = String(error.message || "").toLowerCase();
          if (msg.includes("could not find the table")) {
            supabaseOk = true; // considérer comme non-bloquant
          }
        }
      } catch {}
    }

    // Tenter suppression côté local (fallback)
    try {
      await storage.deleteFeaturedWork(id);
      localOk = true;
    } catch {}

    if (supabaseOk || localOk) return res.json({ success: true });
    return res.status(500).json({ error: "Échec de suppression de l'œuvre phare" });
  });

  app.get("/api/featured-works/public", async (_req, res) => {
    if (supabase) {
      const { data, error } = await fetchFeaturedRowsOrdered();
      if (error) {
        res.setHeader("Cache-Control", "no-store");
        return res.json(await storage.getFeaturedWorks());
      }
      res.setHeader("Cache-Control", "no-store");
      return res.json((data || []).map((r: any) => ({ id: r.id, imageUrl: r.image_url, title: r.title, description: r.description, year: r.year, technique: r.technique })));
    }
    res.setHeader("Cache-Control", "no-store");
    res.json(await storage.getFeaturedWorks());
  });

  // Réordonner les œuvres phares
  app.put("/api/featured-works/order", requireAdmin, async (req, res) => {
    const orderIds: number[] = req.body;
    if (!Array.isArray(orderIds)) return res.status(400).json({ error: "Format invalide" });
    if (supabase) {
      try {
        // Pré‑check: si la table n'existe pas, fallback local immédiat
        const probe = await supabase.from(featuredTable).select("id").limit(1);
        if (probe.error) {
          const msg = String(probe.error.message || "").toLowerCase();
          if (msg.includes("could not find the table") || msg.includes("does not exist") || msg.includes("not exist")) {
            await storage.setFeaturedWorksOrder(orderIds);
            return res.json({ success: true, fallback: true });
          }
        }
        // Mettre à jour le champ order par batch
        for (let i = 0; i < orderIds.length; i++) {
          const id = orderIds[i];
          const { error } = await supabase.from(featuredTable).update({ order: i }).eq("id", id);
          if (error) throw error;
        }
        return res.json({ success: true });
      } catch (err: any) {
        const msg = String(err?.message || "").toLowerCase();
        if (msg.includes("could not find the table") || msg.includes("does not exist") || msg.includes("not exist")) {
          await storage.setFeaturedWorksOrder(orderIds);
          return res.json({ success: true, fallback: true });
        }
        return res.status(500).json({ error: err?.message || "unknown error" });
      }
    }
    await storage.setFeaturedWorksOrder(orderIds);
    res.json({ success: true });
  });

  // (horaires désactivés)

  const httpServer = createServer(app);
  return httpServer;
}
