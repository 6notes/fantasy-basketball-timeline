import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlayer, getPlayerStats, syncPlayerStats } from "../lib/api";

export function usePlayer(playerKey: string) {
  return useQuery({
    queryKey: ["player", playerKey],
    queryFn: () => getPlayer(playerKey),
    enabled: !!playerKey,
  });
}

export function usePlayerStats(playerKey: string, from?: string, to?: string) {
  return useQuery({
    queryKey: ["playerStats", playerKey, from, to],
    queryFn: () => getPlayerStats(playerKey, from, to),
    enabled: !!playerKey,
  });
}

export function useSyncPlayerStats(playerKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncPlayerStats(playerKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playerStats", playerKey] });
    },
  });
}
