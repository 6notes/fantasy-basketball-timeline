import { Hono } from "hono";
import { authMiddleware, AuthVariables } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { fetchYahooAPI } from "../lib/yahoo.js";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

app.get("/", async (c) => {
  const userId = c.get("userId");

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return c.json({ error: "User not found" }, 404);

  type LeagueEntry = { league: [{ league_key: string; name: string; season: string }] };
  type GameEntry = { game: [unknown, { leagues: { [key: string]: LeagueEntry } }] };
  type YahooLeaguesResponse = {
    fantasy_content: {
      users: {
        "0": {
          user: [unknown, { games: { [key: string]: GameEntry } }];
        };
      };
    };
  };

  const data = (await fetchYahooAPI(
    user.accessToken,
    "/users;use_login=1/games;game_codes=nba/leagues"
  )) as YahooLeaguesResponse;

  const gamesObj =
    data.fantasy_content.users["0"].user[1].games;

  const leagues: { leagueKey: string; name: string; season: string }[] = [];

  for (const gameKey of Object.keys(gamesObj).filter((k) => k !== "count")) {
    const game = gamesObj[gameKey].game[1];
    for (const leagueKey of Object.keys(game.leagues).filter(
      (k) => k !== "count"
    )) {
      const league = game.leagues[leagueKey].league[0];
      leagues.push({
        leagueKey: league.league_key,
        name: league.name,
        season: league.season,
      });
    }
  }

  for (const l of leagues) {
    await db.league.upsert({
      where: { leagueKey: l.leagueKey },
      update: { name: l.name, season: l.season },
      create: { ...l, userId },
    });
  }

  return c.json(leagues);
});

export default app;