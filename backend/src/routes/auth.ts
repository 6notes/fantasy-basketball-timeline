import { Hono } from "hono";
import {
  generateCodeVerifier,
  generateState,
  OAuth2RequestError,
} from "arctic";
import { yahoo } from "../lib/yahoo.js";
import { db } from "../lib/db.js";

const app = new Hono();

app.get("/login", async (c) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = yahoo.createAuthorizationURL(state, codeVerifier, [
    "fspt-r",
    "fspt-w",
  ]);

  return c.json({ url: url.toString(), state, codeVerifier });
});

app.get("/callback", async (c) => {
  const { code, state, stored_state, code_verifier } = c.req.query();

  if (!code || !state || !stored_state || !code_verifier) {
    return c.json({ error: "Missing parameters" }, 400);
  }

  if (state !== stored_state) {
    return c.json({ error: "State mismatch" }, 400);
  }

  try {
    const tokens = await yahoo.validateAuthorizationCode(code, code_verifier);

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
    const yahooUserId =
      profile.fantasy_content.users["0"].user[0].guid ?? "unknown";

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