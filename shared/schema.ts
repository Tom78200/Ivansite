import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const artworks = pgTable("artworks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  image_url: text("image_url").notNull(),
  dimensions: text("dimensions").notNull(),
  technique: text("technique").notNull(),
  year: text("year").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  additional_images: jsonb("additional_images").array(),
  is_visible: boolean("is_visible").default(true),
  show_in_slider: boolean("show_in_slider").default(true),
  order: integer("order").notNull().default(0),
});

export const exhibitions = pgTable("exhibitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  location: text("location").notNull(),
  year: text("year").notNull(),
  image_url: text("image_url").notNull(),
  description: text("description").notNull(),
  theme: text("theme"),
  gallery_images: jsonb("gallery_images").array(),
  video_url: text("video_url"),
  order: integer("order").notNull().default(0),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
});

export const insertExhibitionSchema = createInsertSchema(exhibitions).omit({
  id: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Artwork = {
  id: number;
  title: string;
  imageUrl: string;
  dimensions: string;
  technique: string;
  year: string;
  description: string;
  category: string | null;
  additionalImages: string[] | null;
  isVisible: boolean | null;
  showInSlider: boolean | null;
  order: number;
};
export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Exhibition = typeof exhibitions.$inferSelect;
export type InsertExhibition = z.infer<typeof insertExhibitionSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
