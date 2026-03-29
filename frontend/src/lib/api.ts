import axios from "axios";
import type { League, Team, RosterSnapshot, Player, StatLine } from "../types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    config.headers["x-user-id"] = userId;
  }
  return config;
});

export function getLeagues(): Promise<League[]> {
  return api.get<League[]>("/api/leagues").then((r) => r.data);
}

export function getTeam(teamKey: string): Promise<Team & { rosterSnapshots: RosterSnapshot[] }> {
  return api.get(`/api/teams/${teamKey}`).then((r) => r.data);
}

export function getTeamHistory(teamKey: string): Promise<RosterSnapshot[]> {
  return api.get(`/api/teams/${teamKey}/history`).then((r) => r.data);
}

export function syncTeam(teamKey: string): Promise<{ ok: boolean }> {
  return api.post(`/api/teams/${teamKey}/sync`).then((r) => r.data);
}

export function getPlayer(playerKey: string): Promise<Player> {
  return api.get(`/api/players/${playerKey}`).then((r) => r.data);
}

export function getPlayerStats(
  playerKey: string,
  from?: string,
  to?: string
): Promise<StatLine[]> {
  return api
    .get(`/api/players/${playerKey}/stats`, { params: { from, to } })
    .then((r) => r.data);
}

export function syncPlayerStats(playerKey: string): Promise<{ ok: boolean }> {
  return api.post(`/api/players/${playerKey}/sync`).then((r) => r.data);
}
