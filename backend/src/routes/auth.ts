import { Hono } from "hono";
import { generateState, OAuth2RequestError } from "arctic";
import { yahoo } from "../lib/yahoo.js";
import { db } from "../lib/db.js";

const app = new Hono();

app.get("/login", async (c) => {
  // Creates CSRF token
  const state = generateState();
  const authUrl = yahoo.createAuthorizationURL(state, ["fspt-r"]);

  return c.json({ url: authUrl.toString(), state });
});

app.get("/callback", async (c) => {
  const { code, state, stored_state } = c.req.query();

  if (!code || !state || !stored_state) {
    return c.json({ error: "Missing parameters" }, 400);
  }

  if (state !== stored_state) {
    return c.json({ error: "State mismatch" }, 400);
  }

  try {
    const tokens = await yahoo.validateAuthorizationCode(code);

    const accessToken = tokens.accessToken();
    const refreshToken = tokens.refreshToken();
    const accessTokenExpiresAt = tokens.accessTokenExpiresAt();

    const profileRes = await fetch(
      "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games?format=json",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const profile = (await profileRes.json()) as {
      fantasy_content: { users: { "0": { user: [{ guid: string }] } } };
    };
    const yahooUserId = profile.fantasy_content.users["0"].user[0].guid ?? "unknown";

    const user = await db.user.upsert({
      where: { yahooUserId },
      update: {
        accessToken,
        refreshToken,
        tokenExpiry: accessTokenExpiresAt,
      },
      create: {
        yahooUserId,
        accessToken,
        refreshToken,
        tokenExpiry: accessTokenExpiresAt,
      },
    });

    return c.json({ userId: user.id });
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return c.json({ error: e.message }, 400);
    }
    throw e;
  }
});

export default app;
