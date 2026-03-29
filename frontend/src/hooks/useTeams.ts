import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeagues, syncTeam } from "../lib/api";

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: getLeagues,
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
