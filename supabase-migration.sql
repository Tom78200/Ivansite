-- Migration Supabase pour persister les données artworks et exhibitions
-- À exécuter dans l'éditeur SQL de Supabase

-- Table artworks
CREATE TABLE IF NOT EXISTS artworks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  technique TEXT NOT NULL,
  year TEXT NOT NULL,
  description TEXT NOT NULL,
  is_visible BOOLEAN DEFAULT true,
  show_in_slider BOOLEAN DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table exhibitions
CREATE TABLE IF NOT EXISTS exhibitions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  year TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  gallery_images JSONB DEFAULT '[]'::jsonb,
  video_url TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_artworks_visible_order ON artworks(is_visible, "order");
CREATE INDEX IF NOT EXISTS idx_exhibitions_order ON exhibitions("order");

-- RLS (Row Level Security) - désactivé pour l'admin
ALTER TABLE artworks DISABLE ROW LEVEL SECURITY;
ALTER TABLE exhibitions DISABLE ROW LEVEL SECURITY;
