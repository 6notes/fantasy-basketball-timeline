import { Yahoo } from "arctic";

const clientId = process.env.YAHOO_CLIENT_ID!;
const clientSecret = process.env.YAHOO_CLIENT_SECRET!;
const redirectUri = process.env.REDIRECT_URI!;

export const yahoo = new Yahoo(clientId, clientSecret, redirectUri);

export async function fetchYahooAPI(
  accessToken: string,
  path: string
): Promise<unknown> {
  const url = `https://fantasysports.yahooapis.com/fantasy/v2${path}?format=json`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}