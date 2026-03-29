import { execSync } from "child_process";

export default async function globalTeardown() {
  console.log("Tearing down containers...");
  execSync("docker compose down -v", { stdio: "inherit" });
}
