import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeams, syncTeam, syncAllTeams } from "../lib/api";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });
}

export function useSyncAllTeams() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: syncAllTeams,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useSyncTeam(teamKey: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => syncTeam(teamKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team", teamKey] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
    },
  });
}
