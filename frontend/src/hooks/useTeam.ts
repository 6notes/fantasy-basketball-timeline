import { useQuery } from "@tanstack/react-query";
import { getTeam, getTeamHistory } from "../lib/api";

export function useTeam(teamKey: string) {
  return useQuery({
    queryKey: ["team", teamKey],
    queryFn: () => getTeam(teamKey),
    enabled: !!teamKey,
  });
}

export function useTeamHistory(teamKey: string) {
  return useQuery({
    queryKey: ["teamHistory", teamKey],
    queryFn: () => getTeamHistory(teamKey),
    enabled: !!teamKey,
  });
}
