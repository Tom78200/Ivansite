import { useQuery } from "@tanstack/react-query";
import type { Artwork } from "@shared/schema";

export function useArtworks() {
  return useQuery<Artwork[]>({
    queryKey: ["/api/artworks"],
    queryFn: async () => {
      const res = await fetch("/api/artworks", { cache: 'no-store' });
      if (!res.ok) return [] as Artwork[];
      return res.json();
    },
    refetchOnWindowFocus: true,
  });
}

export function useArtwork(id: number) {
  return useQuery<Artwork>({
    queryKey: ["/api/artworks", id],
    enabled: !!id,
  });
}
