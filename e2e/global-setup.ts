import { execSync } from "child_process";

function runCheck(label: string, command: string) {
  console.log(`Running ${label}...`);
  try {
    execSync(command, { stdio: "inherit" });
    console.log(`${label} passed.`);
  } catch {
    throw new Error(`${label} failed. Fix the issues above before running e2e tests.`);
  }
}

async function waitForUrl(url: string, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

export default async function globalSetup() {
  runCheck("ESLint", "npm run lint");
  runCheck("Prettier", "npm run format:check");

  console.log("Tearing down existing containers...");
  execSync("docker compose down -v", { stdio: "inherit" });

  console.log("Building and starting containers...");
  execSync("docker compose up --build -d", { stdio: "inherit" });

  console.log("Waiting for backend...");
  await waitForUrl("http://localhost:3000/health");

  console.log("Running migrations...");
  execSync("docker compose exec backend npx prisma migrate dev --name init", {
    stdio: "inherit",
  });

  console.log("Waiting for frontend...");
  await waitForUrl("http://localhost:5173");

  console.log("Setup complete.");
}
