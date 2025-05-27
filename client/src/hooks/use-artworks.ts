import { useQuery } from "@tanstack/react-query";
import type { Artwork } from "@shared/schema";

export function useArtworks() {
  return useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
  });
}

export function useArtwork(id: number) {
  return useQuery<Artwork>({
    queryKey: ["/api/artworks", id],
    enabled: !!id,
  });
}
