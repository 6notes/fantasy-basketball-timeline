export interface User {
  id: string;
  yahooUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface League {
  id: string;
  leagueKey: string;
  name: string;
  season: string;
  userId: string;
}

export interface Team {
  id: string;
  teamKey: string;
  name: string;
  leagueId: string;
  league?: League;
  createdAt: string;
  updatedAt: string;
}

export interface Player {
  id: string;
  playerKey: string;
  name: string;
  position: string;
  nbaTeam: string;
  injuryStatus?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RosterEntry {
  id: string;
  playerId: string;
  player: Player;
  rosterSlot: string;
}

export interface RosterSnapshot {
  id: string;
  teamId: string;
  snapshotDate: string;
  entries: RosterEntry[];
}

export interface StatLine {
  id: string;
  playerId: string;
  date: string;
  pts?: number | null;
  reb?: number | null;
  ast?: number | null;
  stl?: number | null;
  blk?: number | null;
  tov?: number | null;
  threepm?: number | null;
  fgPct?: number | null;
  ftPct?: number | null;
}
