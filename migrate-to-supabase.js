// Script de migration des données locales vers Supabase
// À exécuter une fois après avoir créé les tables dans Supabase

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Chemins des fichiers JSON
const artworksPath = path.join(__dirname, 'server', 'artworks.json');
const exhibitionsPath = path.join(__dirname, 'server', 'exhibitions.json');

async function migrateArtworks() {
  try {
    if (!fs.existsSync(artworksPath)) {
      console.log('📄 Aucun fichier artworks.json trouvé');
      return;
    }

    const artworks = JSON.parse(fs.readFileSync(artworksPath, 'utf-8'));
    console.log(`📦 Migration de ${artworks.length} artworks...`);

    for (const artwork of artworks) {
      const { error } = await supabase
        .from('artworks')
        .upsert({
          id: artwork.id,
          title: artwork.title,
          image_url: artwork.imageUrl,
          dimensions: artwork.dimensions,
          technique: artwork.technique,
          year: artwork.year,
          description: artwork.description,
          is_visible: artwork.isVisible ?? true,
          show_in_slider: artwork.showInSlider ?? true,
          order: artwork.order ?? 0
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Erreur artwork ${artwork.id}:`, error.message);
      } else {
        console.log(`✅ Artwork ${artwork.id} migré`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur migration artworks:', error.message);
  }
}

async function migrateExhibitions() {
  try {
    if (!fs.existsSync(exhibitionsPath)) {
      console.log('📄 Aucun fichier exhibitions.json trouvé');
      return;
    }

    const exhibitions = JSON.parse(fs.readFileSync(exhibitionsPath, 'utf-8'));
    console.log(`📦 Migration de ${exhibitions.length} exhibitions...`);

    for (const exhibition of exhibitions) {
      const { error } = await supabase
        .from('exhibitions')
        .upsert({
          id: exhibition.id,
          title: exhibition.title,
          location: exhibition.location,
          year: exhibition.year,
          image_url: exhibition.imageUrl,
          description: exhibition.description,
          gallery_images: exhibition.galleryImages || [],
          video_url: exhibition.videoUrl || null,
          order: exhibition.order ?? 0
        }, { onConflict: 'id' });

      if (error) {
        console.error(`❌ Erreur exhibition ${exhibition.id}:`, error.message);
      } else {
        console.log(`✅ Exhibition ${exhibition.id} migrée`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur migration exhibitions:', error.message);
  }
}

async function main() {
  console.log('🚀 Début de la migration vers Supabase...');
  
  await migrateArtworks();
  await migrateExhibitions();
  
  console.log('✅ Migration terminée !');
  console.log('💡 Tu peux maintenant supprimer les fichiers JSON locaux si tout fonctionne');
}

main().catch(console.error);







