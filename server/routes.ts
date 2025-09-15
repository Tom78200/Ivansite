import type { Express } from "express";
import dotenv from "dotenv";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertArtworkSchema, insertExhibitionSchema, insertContactMessageSchema, users } from "@shared/schema";
import multer from "multer";
import path from "path";
import type { Request, Response, NextFunction } from "express";
import type { Multer, FileFilterCallback } from "multer";
import { fileURLToPath } from 'url';
import sharp from "sharp";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import type { Request as ExpressRequest } from "express";

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

// Middleware de protection admin (Ivan uniquement)
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = req.session as any;
  if (session?.isAdmin && session?.adminUser?.username === 'ivan') {
    return next();
  }
  res.status(401).json({ error: "Accès non autorisé" });
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
  // Seed admin en base si absent, sans changer l'UX (mot de passe seul)
  async function ensureAdminUser() {
    try {
      if (!supabase) return;
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) return;
      if (Array.isArray(data) && data.length > 0) return; // déjà présent
      const rawPass = process.env.ADMIN_PASSWORD;
      const username = process.env.ADMIN_USERNAME || 'ivan';
      if (!rawPass) return; // rien à seeder si pas de mdp fourni
      const hash = await bcrypt.hash(String(rawPass), 10);
      await supabase.from('users').insert({ username, password: hash });
      log(`[AUTH] Admin seed créé pour l'utilisateur '${username}'`, 'auth');
    } catch {}
  }

  await ensureAdminUser();
  // Plus d'hydratation locale - 100% Supabase
  console.log('[BOOT] Mode 100% Supabase activé');
  
  // Get all artworks
  app.get("/api/artworks", async (req, res) => {
    try {
      res.setHeader("Cache-Control", "no-store");
      
      // 100% Supabase - pas de fallback local
      if (!supabase) {
        return res.status(500).json({ error: "Supabase not configured" });
      }
      
      const { data, error } = await supabase
        .from('artworks')
        .select('*')
        .eq('is_visible', true)
        .order('order', { ascending: true });
      
      if (error) {
        console.error('[ARTWORKS] Erreur Supabase:', error);
        return res.status(500).json({ error: "Failed to fetch artworks from Supabase" });
      }
      
      const artworks = (data || []).map((artwork: any) => ({
        id: artwork.id,
        title: artwork.title,
        imageUrl: artwork.image_url,
        dimensions: artwork.dimensions,
        technique: artwork.technique,
        year: artwork.year,
        description: artwork.description,
        category: artwork.category,
        additionalImages: artwork.additional_images || [],
        isVisible: artwork.is_visible,
        showInSlider: artwork.show_in_slider,
        order: artwork.order
      }));
      
      console.log(`[ARTWORKS] Returning Supabase artworks: ${artworks.length}`);
      return res.json(artworks);
    } catch (error) {
      console.error('[ARTWORKS] Error:', error);
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
      // Mapper les noms JavaScript vers les noms SQL
      const mappedData = {
        title: req.body.title,
        image_url: req.body.imageUrl,
        dimensions: req.body.dimensions,
        technique: req.body.technique,
        year: req.body.year,
        description: req.body.description,
        category: req.body.category,
        is_visible: req.body.isVisible,
        show_in_slider: req.body.showInSlider,
        order: req.body.order
      };
      const validatedData = insertArtworkSchema.parse(mappedData);
      
      // Créer directement dans Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from('artworks')
          .insert({
            title: validatedData.title,
            image_url: validatedData.image_url,
            dimensions: validatedData.dimensions,
            technique: validatedData.technique,
            year: validatedData.year,
            description: validatedData.description,
            category: validatedData.category,
            additional_images: [],
            is_visible: validatedData.is_visible,
            show_in_slider: validatedData.show_in_slider,
            order: validatedData.order
          })
          .select()
          .single();
        
        if (error) {
          console.error('Erreur création Supabase artwork:', error);
          return res.status(500).json({ error: "Failed to create artwork in Supabase" });
        }
        
        const artwork = {
          id: data.id,
          title: data.title,
          imageUrl: data.image_url,
          dimensions: data.dimensions,
          technique: data.technique,
          year: data.year,
          description: data.description,
          category: data.category,
          additionalImages: data.additional_images || [],
          isVisible: data.is_visible,
          showInSlider: data.show_in_slider,
          order: data.order
        };
        
        console.log('[CREATE] Artwork créé dans Supabase:', artwork.id);
        return res.status(201).json(artwork);
      } else {
        return res.status(500).json({ error: "Supabase not configured" });
      }
    } catch (error) {
      console.error('Erreur création artwork:', error);
      res.status(400).json({ error: "Invalid artwork data" });
    }
  });

  // Add additional images to artwork
  app.post("/api/artworks/:id/additional-images", requireAdmin, upload.array('images', 3), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images provided" });
      }
      
      if (files.length > 3) {
        return res.status(400).json({ error: "Maximum 3 additional images allowed" });
      }
      
      if (!supabase) {
        return res.status(500).json({ error: "Supabase not configured" });
      }
      
      // Vérifier que l'œuvre existe
      const { data: existingArtwork, error: fetchError } = await supabase
        .from('artworks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !existingArtwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      
      // Upload des nouvelles images
      const newImageUrls: string[] = [];
      for (const file of files) {
        try {
          const processedBuffer = await sharp(file.buffer)
            .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
          
          const imageUrl = await uploadBufferToSupabase(file.originalname, file.mimetype, processedBuffer);
          newImageUrls.push(imageUrl);
        } catch (e) {
          console.error('Erreur upload image supplémentaire:', e);
          return res.status(500).json({ error: "Failed to upload image" });
        }
      }
      
      // Mettre à jour l'œuvre avec les nouvelles images
      const currentAdditionalImages = existingArtwork.additional_images || [];
      const updatedAdditionalImages = [...currentAdditionalImages, ...newImageUrls];
      
      const { error: updateError } = await supabase
        .from('artworks')
        .update({ additional_images: updatedAdditionalImages })
        .eq('id', id);
      
      if (updateError) {
        console.error('Erreur mise à jour artwork:', updateError);
        return res.status(500).json({ error: "Failed to update artwork" });
      }
      
      res.json({ 
        success: true, 
        additionalImages: updatedAdditionalImages,
        newImages: newImageUrls
      });
      
    } catch (error) {
      console.error('Erreur ajout images supplémentaires:', error);
      res.status(500).json({ error: "Failed to add additional images" });
    }
  });

  // Get all exhibitions
  app.get("/api/exhibitions", async (req, res) => {
    try {
      // Lire uniquement depuis Supabase (100% Supabase)
      if (!supabase) {
        return res.status(500).json({ error: "Supabase not configured" });
      }
      
      const { data, error } = await supabase
        .from('exhibitions')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        console.error('[EXHIBITIONS] Erreur Supabase:', error);
        return res.status(500).json({ error: "Failed to fetch exhibitions from Supabase" });
      }
      
      const exhibitions = (data || []).map(exhibition => ({
        id: exhibition.id,
        title: exhibition.title,
        location: exhibition.location,
        year: exhibition.year,
        imageUrl: exhibition.image_url,
        description: exhibition.description,
        theme: exhibition.theme,
        galleryImages: exhibition.gallery_images || [],
        videoUrl: exhibition.video_url,
        order: exhibition.order
      }));
      
      console.log(`[EXHIBITIONS] Returning Supabase exhibitions: ${exhibitions.length}`);
      res.setHeader("Cache-Control", "no-store");
      res.json(exhibitions);
    } catch (error) {
      console.error('[EXHIBITIONS] Error:', error);
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
      let exhibition = await storage.getExhibition(id);
      
      // Essayer de lire depuis Supabase si pas trouvé localement
      if (!exhibition && supabase) {
        try {
          const { data, error } = await supabase
            .from('exhibitions')
            .select('*')
            .eq('id', id)
            .single();
          
          if (data && !error) {
            exhibition = {
              id: data.id,
              title: data.title,
              location: data.location,
              year: data.year,
              imageUrl: data.image_url,
              description: data.description,
              theme: data.theme,
              galleryImages: data.gallery_images || [],
              videoUrl: data.video_url,
              order: data.order
            };
          }
        } catch (e) {
          console.warn('Erreur lecture Supabase exhibition:', e);
        }
      }
      
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
      console.log("[CREATE] Tentative création exposition:", req.body);
      
      // Mapper les noms de propriétés du frontend vers le backend
      const mappedData = {
        ...req.body,
        image_url: req.body.imageUrl, // Frontend envoie imageUrl, backend attend image_url
      };
      
      console.log("[CREATE] Mapped data:", mappedData);
      const validatedData = insertExhibitionSchema.parse(mappedData);
      
      // Créer directement dans Supabase (100% Supabase)
      if (!supabase) {
        return res.status(500).json({ error: "Supabase not configured" });
      }
      
      const { data, error } = await supabase.from('exhibitions').insert({
        title: validatedData.title,
        location: validatedData.location,
        year: validatedData.year,
        image_url: validatedData.image_url,
        description: validatedData.description,
        gallery_images: validatedData.galleryImages || [],
        video_url: validatedData.videoUrl || null,
        order: 0 // Ordre par défaut
      }).select().single();
      
      if (error) {
        console.error("[CREATE] Erreur création exposition Supabase:", error);
        return res.status(500).json({ error: "Failed to create exhibition in Supabase" });
      }
      
      // Mapper la réponse Supabase vers le format frontend
      const exhibition = {
        id: data.id,
        title: data.title,
        location: data.location,
        year: data.year,
        imageUrl: data.image_url,
        description: data.description,
        theme: data.theme,
        galleryImages: data.gallery_images || [],
        videoUrl: data.video_url,
        order: data.order
      };
      
      console.log("[CREATE] Exposition créée dans Supabase avec ID:", exhibition.id);
      res.status(201).json(exhibition);
      
    } catch (error) {
      console.error('[CREATE] Erreur création exposition:', error);
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
  app.delete("/api/artworks/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(`[DELETE] Tentative suppression artwork ID: ${id}`);
      
      let existing = await storage.getArtwork(id);
      let foundInSupabase = false;
      
      // Vérifier d'abord dans Supabase si l'œuvre existe
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('artworks')
            .select('*')
            .eq('id', id)
            .single();
          
          if (data && !error) {
            foundInSupabase = true;
            console.log(`[DELETE] Artwork ${id} trouvé dans Supabase: ${data.title}`);
            
            // Supprimer de Supabase
            await supabase.from('artworks').delete().eq('id', id);
            
            // Supprimer l'image si elle est sur Supabase
            if (data.image_url && data.image_url.startsWith("http")) {
              try {
                await deleteSupabasePublicFile(data.image_url);
              } catch (e) {
                console.warn('Erreur suppression image Supabase:', e);
              }
            }
          }
        } catch (e) {
          console.warn('Erreur vérification Supabase:', e);
        }
      }
      
      // Supprimer du storage local si trouvé
      if (existing) {
        console.log(`[DELETE] Artwork trouvé localement: ${existing.title}`);
        const deleted = await storage.deleteArtwork(id);
        if (!deleted) {
          console.log(`[DELETE] Échec suppression artwork ${id} du storage local`);
        }
      }
      
      // Si ni Supabase ni local, erreur
      if (!foundInSupabase && !existing) {
        console.log(`[DELETE] Artwork ${id} non trouvé nulle part`);
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

      // Chemin 100% Supabase si configuré
      if (supabase) {
        try {
          const { data: existing, error: fetchError } = await supabase
            .from('exhibitions')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError || !existing) {
            return res.status(404).json({ error: "Exposition non trouvée" });
          }

          // Déterminer les URLs supprimées (pour nettoyer le bucket)
          const previousUrls = new Set((existing.gallery_images || []).map((g: any) => g.url).filter(Boolean));
          const nextUrls = new Set(galleryImages.map((g: any) => g.url).filter(Boolean));
          const removed: string[] = [];
          previousUrls.forEach((url: string) => { if (!nextUrls.has(url)) removed.push(url); });

          for (const url of removed) {
            try {
              if (typeof url === 'string' && url.startsWith("http")) {
                await deleteSupabasePublicFile(url);
              }
            } catch (e) {
              console.warn("[GALLERY_DELETE] Échec suppression fichier:", url, (e as any)?.message || e);
            }
          }

          const { error: updateError } = await supabase
            .from('exhibitions')
            .update({ gallery_images: galleryImages })
            .eq('id', id);
          if (updateError) {
            return res.status(500).json({ error: "Failed to update artwork" });
          }

          return res.json({ id, galleryImages });
        } catch (e) {
          console.warn('Erreur sauvegarde Supabase gallery:', e);
          return res.status(500).json({ error: "Erreur lors de la mise à jour de la galerie" });
        }
      }

      // Fallback local si Supabase non configuré
      let existingExpo = await storage.getExhibition(id);
      if (!existingExpo) {
        return res.status(404).json({ error: "Exposition non trouvée" });
      }
      const previousUrls = new Set((existingExpo?.galleryImages || []).map((g: any) => g.url).filter(Boolean));
      const nextUrls = new Set(galleryImages.map((g: any) => g.url).filter(Boolean));
      const removed: string[] = [];
      previousUrls.forEach((url: string) => { if (!nextUrls.has(url)) removed.push(url); });
      for (const url of removed) {
        try {
          if (url.startsWith("/images/")) {
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
      if (!expo) return res.status(404).json({ error: "Exposition non trouvée" });
      return res.json(expo);
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la mise à jour de la galerie" });
    }
  });

  // Supprimer une exposition
  app.delete("/api/exhibitions/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      let supabaseOk = false;
      let localOk = false;
      let existingCoverUrl: string | undefined = undefined;
      let existingGallery: { url: string; caption: string }[] | undefined = undefined;

      // Supprimer côté Supabase en priorité si configuré
      if (supabase) {
        try {
          const { data: rowToDelete } = await supabase
            .from('exhibitions')
            .select('image_url,gallery_images')
            .eq('id', id)
            .maybeSingle();
          existingCoverUrl = rowToDelete?.image_url as string | undefined;
          existingGallery = (rowToDelete?.gallery_images as any) as { url: string; caption: string }[] | undefined;

          const { error: delErr } = await supabase.from('exhibitions').delete().eq('id', id);
          if (!delErr) supabaseOk = true;
        } catch (e) {
          console.warn('Erreur suppression Supabase exhibition:', e);
        }

        // Nettoyer les fichiers du bucket si on a des URLs
        try {
          if (existingCoverUrl && existingCoverUrl.startsWith('http')) {
            await deleteSupabasePublicFile(existingCoverUrl);
          }
          if (Array.isArray(existingGallery)) {
            for (const gi of existingGallery) {
              if (gi?.url && gi.url.startsWith('http')) {
                try { await deleteSupabasePublicFile(gi.url); } catch {}
              }
            }
          }
        } catch {}
      }

      // Supprimer côté local en fallback
      try {
        const existing = await storage.getExhibition(id);
        const deleted = await storage.deleteExhibition(id);
        if (deleted) localOk = true;
        if (existing) {
          try {
            if (existing.imageUrl && existing.imageUrl.startsWith('/images/')) {
              const coverBasename = path.basename(existing.imageUrl);
              const coverLocal = path.join(__dirname, "../public/images/", coverBasename);
              if (fs.existsSync(coverLocal)) fs.unlinkSync(coverLocal);
            }
          } catch {}
          const gallery = (existing as any).galleryImages as { url: string; caption: string }[] | undefined;
          if (Array.isArray(gallery)) {
            for (const gi of gallery) {
              try {
                if (gi?.url && gi.url.startsWith('/images/')) {
                  const base = path.basename(gi.url);
                  const p = path.join(__dirname, "../public/images/", base);
                  if (fs.existsSync(p)) fs.unlinkSync(p);
                }
              } catch {}
            }
          }
        }
      } catch {}

      if (supabaseOk || localOk) return res.json({ success: true });
      return res.status(404).json({ error: "Exposition non trouvée" });
    } catch (error) {
      res.status(500).json({ error: "Erreur lors de la suppression de l'exposition" });
    }
  });

  // Authentification admin (login)
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body || {};
      // Mode "mot de passe seul" mais vérifié en BDD s'il y a un compte
      if (!username) {
        if (supabase) {
          const { data: userRow, error } = await supabase
            .from('users')
            .select('id,username,password')
            .order('id', { ascending: true })
            .limit(1)
            .maybeSingle();
          if (error) return res.status(500).json({ error: error.message });
          if (userRow && userRow.password) {
            const ok = await bcrypt.compare(String(password || ""), String((userRow as any).password || ""));
            if (!ok) return res.status(401).json({ error: "Mot de passe incorrect" });
            (req.session as any).isAdmin = true;
            (req.session as any).adminUser = { id: userRow.id, username: userRow.username };
            return res.json({ success: true });
          }
        }
        // Fallback env si aucun user en BDD
        if (password && password === (process.env.ADMIN_PASSWORD || "Guthier2024!")) {
          (req.session as any).isAdmin = true;
          return res.json({ success: true, legacy: true });
        }
        return res.status(401).json({ error: "Mot de passe incorrect" });
      }

      if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
      // Chercher l'utilisateur par username si fourni
      const { data: userRow, error } = await supabase
        .from('users')
        .select('id,username,password')
        .eq('username', String(username))
        .maybeSingle();
      if (error) return res.status(500).json({ error: error.message });
      if (!userRow) return res.status(401).json({ error: "Utilisateur introuvable" });
      const ok = await bcrypt.compare(String(password || ""), String((userRow as any).password || ""));
      if (!ok) return res.status(401).json({ error: "Mot de passe incorrect" });
      (req.session as any).isAdmin = true;
      (req.session as any).adminUser = { id: userRow.id, username: userRow.username };
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Erreur d'authentification" });
    }
  });

  // Déconnexion admin (logout)
  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // Statut de session (pour guard côté client)
  app.get('/api/me', (req, res) => {
    const isAdmin = (req.session as any)?.isAdmin === true;
    const adminUser = (req.session as any)?.adminUser || null;
    res.json({ isAdmin, adminUser });
  });

  // Endpoint pour créer un admin si aucun n'existe (à protéger par un secret setup)
  app.post('/api/admin/setup', async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ error: "Supabase not configured" });
      const setupSecret = process.env.ADMIN_SETUP_SECRET;
      if (!setupSecret || req.headers['x-setup-secret'] !== setupSecret) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const { username, password } = req.body || {};
      if (!username || !password) return res.status(400).json({ error: 'username et password requis' });
      const hash = await bcrypt.hash(String(password), 10);
      const { error } = await supabase.from('users').insert({ username, password: hash });
      if (error) return res.status(500).json({ error: error.message });
      return res.json({ success: true });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || 'Erreur setup' });
    }
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

  // Traduction via fournisseur externe (DeepL / LibreTranslate)
  const translateCache = new Map<string, string>();
  app.post("/api/translate", async (req, res) => {
    try {
      const text = String((req.body?.text ?? "")).slice(0, 5000);
      const target = String((req.body?.target ?? "en")).toLowerCase() as "fr" | "en";
      if (!text || !text.trim()) return res.json({ translated: text });

      const cacheKey = `${target}::${text}`;
      const cached = translateCache.get(cacheKey);
      if (cached) return res.json({ translated: cached, cached: true });

      const provider = (process.env.TRANSLATE_PROVIDER || "deepl").toLowerCase();
      let translated = text;

      if (provider === "deepl") {
        const apiKey = process.env.DEEPL_API_KEY;
        const endpoint = process.env.DEEPL_API_ENDPOINT || "https://api-free.deepl.com/v2/translate";
        if (!apiKey) return res.status(500).json({ error: "DEEPL_API_KEY manquant" });
        const params = new URLSearchParams();
        params.set("text", text);
        params.set("target_lang", target === "fr" ? "FR" : "EN");
        const r = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `DeepL-Auth-Key ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });
        if (!r.ok) {
          const msg = await r.text();
          return res.status(500).json({ error: `DeepL error: ${msg}` });
        }
        const data = await r.json() as any;
        translated = data?.translations?.[0]?.text || text;
      } else if (provider === "libre") {
        const baseUrl = (process.env.LIBRETRANSLATE_URL || "https://libretranslate.com").replace(/\/$/, "");
        const apiKey = process.env.LIBRETRANSLATE_API_KEY || undefined;
        const r = await fetch(`${baseUrl}/translate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: text, source: "auto", target, format: "text", api_key: apiKey }),
        });
        if (!r.ok) {
          const msg = await r.text();
          return res.status(500).json({ error: `LibreTranslate error: ${msg}` });
        }
        const data = await r.json() as any;
        translated = data?.translatedText || text;
      } else {
        return res.status(500).json({ error: "TRANSLATE_PROVIDER inconnu" });
      }

      translateCache.set(cacheKey, translated);
      if (translateCache.size > 2000) {
        // simple purge
        translateCache.clear();
      }
      return res.json({ translated });
    } catch (e: any) {
      return res.status(500).json({ error: e?.message || "Traduction échouée" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
