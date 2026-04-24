import { Hono } from "hono";
import { authMiddleware, AuthVariables } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { fetchYahooAPI } from "../lib/yahoo.js";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

app.get("/", async (c) => {
  const userId = c.get("userId");
  const teams = await db.team.findMany({
    where: { league: { userId } },
    include: { league: true },
  });
  return c.json(teams);
});

app.post("/sync-all", async (c) => {
  const userId = c.get("userId");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return c.json({ error: "User not found" }, 404);

  type TeamEntry = {
    team: [{ team_key: string; name: string; league_key: string }];
  };
  type GameEntry = {
    game: [unknown, { teams: { [key: string]: TeamEntry } }];
  };
  type YahooTeamsResponse = {
    fantasy_content: {
      users: {
        "0": { user: [unknown, { games: { [key: string]: GameEntry } }] };
      };
    };
  };

  const data = (await fetchYahooAPI(
    user.accessToken,
    "/users;use_login=1/games;game_codes=nba/teams"
  )) as YahooTeamsResponse;

  const gamesObj = data.fantasy_content.users["0"].user[1].games;
  const upserted = [];

  for (const gameKey of Object.keys(gamesObj).filter((k) => k !== "count")) {
    const teamsObj = gamesObj[gameKey].game[1].teams;
    for (const teamKey of Object.keys(teamsObj).filter((k) => k !== "count")) {
      const rawTeam = teamsObj[teamKey].team[0];
      const t = Array.isArray(rawTeam)
        ? (Object.assign({}, ...rawTeam.filter((x: unknown) => x && typeof x === "object" && !Array.isArray(x))) as { team_key: string; name: string })
        : rawTeam as { team_key: string; name: string };
      const leagueKey = t.team_key.replace(/\.t\.\d+$/, "");
      const league = await db.league.findUnique({
        where: { leagueKey },
      });
      if (!league) continue;
      const team = await db.team.upsert({
        where: { teamKey: t.team_key },
        update: { name: t.name },
        create: { teamKey: t.team_key, name: t.name, leagueId: league.id },
      });
      upserted.push(team);
    }
  }

  return c.json(upserted);
});

app.get("/:teamKey", async (c) => {
  const { teamKey } = c.req.param();
  const team = await db.team.findUnique({
    where: { teamKey },
    include: {
      league: true,
      rosterSnapshots: {
        orderBy: { snapshotDate: "desc" },
        take: 1,
        include: { entries: { include: { player: true } } },
      },
    },
  });
  if (!team) return c.json({ error: "Team not found" }, 404);
  return c.json(team);
});

app.get("/:teamKey/history", async (c) => {
  const { teamKey } = c.req.param();
  const team = await db.team.findUnique({ where: { teamKey } });
  if (!team) return c.json({ error: "Team not found" }, 404);

  const snapshots = await db.rosterSnapshot.findMany({
    where: { teamId: team.id },
    orderBy: { snapshotDate: "desc" },
    include: { entries: { include: { player: true } } },
  });
  return c.json(snapshots);
});

app.post("/:teamKey/sync", async (c) => {
  const userId = c.get("userId");
  const { teamKey } = c.req.param();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return c.json({ error: "User not found" }, 404);

  type PlayerInfo = {
    player_key: string;
    full_name: string;
    display_position: string;
    editorial_team_abbr: string;
    status?: string;
    image_url?: string;
  };
  type YahooTeamResponse = {
    fantasy_content: {
      team: [
        [{ team_key: string; name: string; league_key: string }],
        { roster: { "0": { players: { [key: string]: { player: [PlayerInfo] } } } } }
      ];
    };
  };

  const data = (await fetchYahooAPI(
    user.accessToken,
    `/team/${teamKey}/roster/players`
  )) as YahooTeamResponse;

  const [teamInfo, rosterWrapper] = data.fantasy_content.team;
  const teamInfoFlat = Object.assign(
    {},
    ...teamInfo.filter((x: unknown) => x && typeof x === "object" && !Array.isArray(x))
  ) as { name: string };
  const teamName = teamInfoFlat.name;
  const leagueKey = teamKey.replace(/\.t\.\d+$/, "");

  const league = await db.league.findUnique({ where: { leagueKey } });
  if (!league) return c.json({ error: "League not found" }, 404);

  const team = await db.team.upsert({
    where: { teamKey },
    update: { name: teamName },
    create: { teamKey, name: teamName, leagueId: league.id },
  });

  const playersObj = rosterWrapper.roster["0"].players;
  const snapshot = await db.rosterSnapshot.create({
    data: { teamId: team.id },
  });

  for (const pKey of Object.keys(playersObj).filter((k) => k !== "count")) {
    const rawPlayer = playersObj[pKey].player[0];
    const p = Array.isArray(rawPlayer)
      ? (Object.assign({}, ...rawPlayer.filter((x: unknown) => x && typeof x === "object" && !Array.isArray(x))) as { player_key: string; name: { full: string } | string; display_position: string; editorial_team_abbr: string; status?: string; image_url?: string })
      : rawPlayer;
    const playerName = typeof p.name === "object" ? p.name.full : p.name;
    const player = await db.player.upsert({
      where: { playerKey: p.player_key },
      update: {
        name: playerName,
        position: p.display_position,
        nbaTeam: p.editorial_team_abbr,
        injuryStatus: p.status ?? null,
        imageUrl: p.image_url ?? null,
      },
      create: {
        playerKey: p.player_key,
        name: playerName,
        position: p.display_position,
        nbaTeam: p.editorial_team_abbr,
        injuryStatus: p.status ?? null,
        imageUrl: p.image_url ?? null,
      },
    });

    await db.rosterEntry.create({
      data: {
        rosterSnapshotId: snapshot.id,
        playerId: player.id,
        rosterSlot: p.display_position,
      },
    });
  }

  return c.json({ ok: true, snapshotId: snapshot.id });
});

export default app;