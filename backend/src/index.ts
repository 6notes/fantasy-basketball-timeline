import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import authRoutes from "./routes/auth.js";
import leagueRoutes from "./routes/leagues.js";
import teamRoutes from "./routes/teams.js";
import playerRoutes from "./routes/players.js";

const app = new Hono();

app.use("*", logger());
const frontendOrigin = process.env.REDIRECT_URI
  ? new URL(process.env.REDIRECT_URI).origin
  : "http://localhost:5173";

app.use(
  "*",
  cors({
    origin: [frontendOrigin, "http://localhost:5173"],
    allowHeaders: ["x-user-id", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.route("/auth", authRoutes);
app.route("/api/leagues", leagueRoutes);
app.route("/api/teams", teamRoutes);
app.route("/api/players", playerRoutes);

app.get("/health", (c) => c.json({ status: "ok" }));

serve({ fetch: app.fetch, port: 3000 }, () => {
  console.log("Backend running on http://localhost:3000");
  console.log(`Frontend origin: ${frontendOrigin} — open this URL to log in`);
});