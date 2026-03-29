import { Hono } from "hono";
import { authMiddleware, AuthVariables } from "../middleware/auth.js";
import { db } from "../lib/db.js";
import { fetchYahooAPI } from "../lib/yahoo.js";

const app = new Hono<{ Variables: AuthVariables }>();

app.use("*", authMiddleware);

app.get("/:playerKey", async (c) => {
  const { playerKey } = c.req.param();
  const player = await db.player.findUnique({ where: { playerKey } });
  if (!player) return c.json({ error: "Player not found" }, 404);
  return c.json(player);
});

app.get("/:playerKey/stats", async (c) => {
  const { playerKey } = c.req.param();
  const { from, to } = c.req.query();

  const player = await db.player.findUnique({ where: { playerKey } });
  if (!player) return c.json({ error: "Player not found" }, 404);

  const stats = await db.statLine.findMany({
    where: {
      playerId: player.id,
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    orderBy: { date: "asc" },
  });

  return c.json(stats);
});

app.post("/:playerKey/sync", async (c) => {
  const userId = c.get("userId");
  const { playerKey } = c.req.param();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return c.json({ error: "User not found" }, 404);

  const player = await db.player.findUnique({ where: { playerKey } });
  if (!player) return c.json({ error: "Player not found" }, 404);

  const data = (await fetchYahooAPI(
    user.accessToken,
    `/player/${playerKey}/stats;type=date`
  )) as {
    fantasy_content: {
      player: [
        unknown,
        {
          player_stats: {
            stats: Array<{ stat: { stat_id: string; value: string } }>;
          };
          editorial_season_start_date?: string;
        }
      ];
    };
  };

  const statsArr = data.fantasy_content.player[1].player_stats.stats;

  const statMap: Record<string, number> = {};
  for (const { stat } of statsArr) {
    statMap[stat.stat_id] = parseFloat(stat.value) || 0;
  }

  // Yahoo stat IDs for NBA: 12=PTS, 15=REB, 13=AST, 16=STL, 17=BLK, 18=TOV, 3=3PM, 5=FG%, 8=FT%
  await db.statLine.upsert({
    where: { playerId_date: { playerId: player.id, date: new Date() } },
    update: {
      pts: statMap["12"],
      reb: statMap["15"],
      ast: statMap["13"],
      stl: statMap["16"],
      blk: statMap["17"],
      tov: statMap["18"],
      threepm: statMap["3"],
      fgPct: statMap["5"],
      ftPct: statMap["8"],
    },
    create: {
      playerId: player.id,
      date: new Date(),
      pts: statMap["12"],
      reb: statMap["15"],
      ast: statMap["13"],
      stl: statMap["16"],
      blk: statMap["17"],
      tov: statMap["18"],
      threepm: statMap["3"],
      fgPct: statMap["5"],
      ftPct: statMap["8"],
    },
  });

  return c.json({ ok: true });
});

export default app;