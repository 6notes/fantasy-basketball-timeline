# Fantasy Hoops — Claude Code Instructions

## Project Overview
A fantasy basketball app that connects to the Yahoo Fantasy Sports API. The project is partially scaffolded. Your job is to complete it.

**Tech Stack:**
- Frontend: React 19, Vite, TypeScript, Chakra UI v3, React Query, React Router v7, Recharts
- Backend: Hono, TypeScript, Prisma, Arctic (Yahoo OAuth)
- Database: PostgreSQL
- Infrastructure: Docker + docker-compose

---

## What Already Exists

```
fantasy-hoops/
├── docker-compose.yml         ✅ done
├── .env.example               ✅ done
├── prisma/
│   └── schema.prisma          ✅ done
├── backend/
│   ├── package.json           ✅ done
│   ├── tsconfig.json          ✅ done
│   ├── Dockerfile             ✅ done
│   └── src/
│       ├── index.ts           ✅ done
│       ├── lib/
│       │   ├── db.ts          ✅ done
│       │   └── yahoo.ts       ✅ done
│       ├── middleware/
│       │   └── auth.ts        ✅ done
│       └── routes/
│           ├── auth.ts        ✅ done
│           ├── leagues.ts     ✅ done
│           ├── teams.ts       ✅ done
│           └── players.ts     ✅ done
└── frontend/
    ├── package.json           ✅ done
    ├── tsconfig.json          ✅ done
    └── vite.config.ts         ✅ done
```

---

## What Needs To Be Built

### 1. Frontend Dockerfile
Create `frontend/Dockerfile`:
- Use `node:22-alpine`
- Working dir `/app`
- Install deps, expose port 5173
- Run `npm run dev`

---

### 2. Frontend entry files

**`frontend/index.html`** — standard Vite HTML entry pointing to `/src/main.tsx`

**`frontend/src/main.tsx`** — app entry:
- Wrap app in `ChakraProvider` (use `defaultSystem` from `@chakra-ui/react`)
- Wrap in `QueryClientProvider` (from `@tanstack/react-query`)
- Wrap in `BrowserRouter` (from `react-router-dom`)
- Mount `<App />`

**`frontend/src/App.tsx`** — define routes:
- `/` → `TeamListPage`
- `/team/:teamKey` → `TeamPage`
- `/player/:playerKey` → `PlayerPage`
- `/login` → `LoginPage`
- Wrap routes in a `<Layout>` component

---

### 3. API client

**`frontend/src/lib/api.ts`**
- Create an axios instance with `baseURL` from `import.meta.env.VITE_API_URL`
- Add a request interceptor that attaches `x-user-id` header from `localStorage.getItem("userId")`
- Export typed helper functions:
  - `getLeagues()`
  - `getTeam(teamKey: string)`
  - `getTeamHistory(teamKey: string)`
  - `syncTeam(teamKey: string)`
  - `getPlayer(playerKey: string)`
  - `getPlayerStats(playerKey: string, from?: string, to?: string)`
  - `syncPlayerStats(playerKey: string)`

---

### 4. TypeScript types

**`frontend/src/types/index.ts`** — define interfaces matching the Prisma schema:
- `User`
- `League`
- `Team` (with optional `league: League`)
- `Player`
- `RosterEntry` (with `player: Player`, `rosterSlot: string`)
- `RosterSnapshot` (with `entries: RosterEntry[]`, `snapshotDate: string`)
- `StatLine`

---

### 5. React Query hooks

**`frontend/src/hooks/useTeams.ts`**
- `useTeams()` — fetches `/api/teams`
- `useSyncTeam(teamKey)` — mutation for POST `/api/teams/:teamKey/sync`

**`frontend/src/hooks/useTeam.ts`**
- `useTeam(teamKey)` — fetches `/api/teams/:teamKey`
- `useTeamHistory(teamKey)` — fetches `/api/teams/:teamKey/history`

**`frontend/src/hooks/usePlayer.ts`**
- `usePlayer(playerKey)` — fetches `/api/players/:playerKey`
- `usePlayerStats(playerKey, from?, to?)` — fetches `/api/players/:playerKey/stats`
- `useSyncPlayerStats(playerKey)` — mutation for POST

---

### 6. Layout component

**`frontend/src/components/layout/Layout.tsx`**
- Chakra `Box` as page wrapper
- `Flex` navbar at top with:
  - App name "Fantasy Hoops 🏀" on the left
  - Link to `/` (My Teams) on the right
  - Color mode toggle button
- `Container` wrapping `<Outlet />` from react-router-dom

---

### 7. Pages

**`frontend/src/pages/LoginPage.tsx`**
- Centered Chakra `Card` with app title and a "Login with Yahoo" button
- On click: call `GET /auth/login`, get back `{ url, state, codeVerifier }`, store `state` and `codeVerifier` in `localStorage`, then redirect to `url`
- Handle the OAuth callback by reading `?code=&state=` from the URL, verify state matches localStorage, call `GET /auth/callback?code=...&state=...&stored_state=...&code_verifier=...`, store returned `userId` in localStorage, redirect to `/`

**`frontend/src/pages/TeamListPage.tsx`**
- Use `useTeams()` hook
- Show a Chakra `SimpleGrid` of team cards
- Each card: team name, league name, a "View Roster" link to `/team/:teamKey`, a "Sync" button that calls `useSyncTeam`
- Show a loading skeleton while fetching

**`frontend/src/pages/TeamPage.tsx`**
- Use `useTeam(teamKey)` from route params
- Show team name and league at the top
- Roster table with columns: Player, Position, NBA Team, Injury Status, Slot
- Each player name links to `/player/:playerKey`
- Injury status shown as a Chakra `Badge` (green=Active, yellow=Questionable, red=Out/IL)
- "Sync Roster" button at top right

**`frontend/src/pages/PlayerPage.tsx`**
- Use `usePlayer(playerKey)` and `usePlayerStats(playerKey)`
- Show player name, position, NBA team, injury status badge, player image
- Stat history table: Date, PTS, REB, AST, STL, BLK, TOV, 3PM, FG%, FT%
- Recharts `LineChart` showing points over time
- "Sync Stats" button

---

### 8. Player components (optional but nice)

**`frontend/src/components/players/PlayerCard.tsx`** — compact card showing player name, position, NBA team, injury badge. Used in roster table rows.

**`frontend/src/components/players/StatChart.tsx`** — Recharts `LineChart` wrapper taking `statLines: StatLine[]` and `statKey: keyof StatLine` as props.

---

### 9. Root `.gitignore`

Create a root `.gitignore` covering:
- `node_modules`
- `.env` (but not `.env.example`)
- `dist`
- `prisma/migrations` (optional, remove if you want to track migrations)

---

## Running the Project

After completing the scaffold, running the project should be:

```bash
cp .env.example .env
# Fill in YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET from developer.yahoo.com

docker compose up --build
```

Then:
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- DB: localhost:5432

To run DB migrations:
```bash
docker compose exec backend npx prisma migrate dev --name init
```

---

## Notes & Gotchas

- **Yahoo OAuth scopes**: `fspt-r` = read, `fspt-w` = write. You need both for roster sync.
- **Yahoo API response shape**: The Yahoo Fantasy API returns deeply nested XML-converted JSON. The routes already handle this parsing — don't change the response parsing logic without testing against the real API.
- **Auth header**: The current auth middleware uses `x-user-id` header. This is fine for local dev. For production/AWS, replace with a signed JWT in an httpOnly cookie.
- **Prisma + Docker**: The backend container runs `prisma generate` at build time. Always rebuild the backend container after changing `schema.prisma`.
- **Arctic version**: Uses Arctic v2. The API changed significantly from v1 — do not use v1 docs.
- **Chakra UI v3**: Uses the new slot recipe system. Do NOT use the Chakra v2 docs. The provider is `<ChakraProvider value={defaultSystem}>`, not `<ChakraProvider theme={...}>`.