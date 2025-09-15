import { useQuery } from "@tanstack/react-query";
import type { Exhibition } from "@shared/schema";

export function useExhibitions() {
  return useQuery<Exhibition[]>({
    queryKey: ["/api/exhibitions"],
  });
}

export function useExhibition(id: number) {
  return useQuery<Exhibition>({
    queryKey: ["/api/exhibitions", id],
    enabled: !!id,
  });
}
