# Fantasy Hoops 🏀

A fantasy basketball app that connects to the Yahoo Fantasy Sports API.

---

<details>
<summary>

## Local Dev Setup

</summary>

### Prerequisites

- [Docker](https://www.docker.com/) installed and running
- A Yahoo Developer account with a Fantasy Sports app
  ([developer.yahoo.com](https://developer.yahoo.com))

### 1. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and fill in your Yahoo credentials:

```
YAHOO_CLIENT_ID=your_client_id_here
YAHOO_CLIENT_SECRET=your_client_secret_here
```

Everything else can stay as the defaults for local dev.

### 2. Start Docker

Open Docker Desktop and make sure it's running before proceeding.

### 3. Start the app

```bash
npm run dev
```

This runs `docker compose up --build`. On first run it will build the containers
and pull dependencies.

### 4. Run database migrations (first time only)

```bash
npm run migrate
```

### 5. Open the app

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

</details>

---

<details>
<summary>

## E2E Testing

</summary>

Playwright is used for end-to-end testing. The test suite spins up the full
Docker environment automatically, runs migrations, waits for both services to be
healthy, then runs the tests and tears everything down.

### Prerequisites

Install dependencies from the root:

```bash
npm install
npx playwright install
```

### Run the tests

```bash
npm run test:e2e
```

This will:

1. Tear down any existing containers and volumes (clean state)
2. Build and start all Docker services
3. Wait for the backend (`/health`) and frontend to be ready
4. Run Prisma migrations
5. Run the Playwright test suite
6. Tear down containers on completion

> Note: First run will take longer due to Docker image builds.

</details>

---

<details>
<summary>

## Other Scripts

</summary>

| Command            | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `npm run dev`      | Start all services via Docker                         |
| `npm run migrate`  | Run Prisma DB migrations inside the backend container |
| `npm run down`     | Stop and remove containers                            |
| `npm run logs`     | Tail logs from all containers                         |
| `npm run test:e2e` | Run Playwright e2e tests against a fresh environment  |

</details>
