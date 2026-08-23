import { access, cp, mkdir, readFile, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const dist = resolve(root, "dist");
const workerOutput = resolve(dist, "heart_islands");
const workerEntry = resolve(workerOutput, "index.js");
const serverDirectory = resolve(dist, "server");

await access(workerEntry);
await rm(serverDirectory, { recursive: true, force: true });
await mkdir(serverDirectory, { recursive: true });
await cp(workerEntry, resolve(serverDirectory, "index.js"));

// The Cloudflare Vite plugin emits a duplicate root copy for its own deploy flow.
// Sites consumes dist/client plus dist/server, so remove the duplicate payload and
// all local-preview metadata before packaging.
await rm(resolve(dist, "assets"), { recursive: true, force: true });
await rm(resolve(dist, "index.html"), { force: true });
await rm(workerOutput, { recursive: true, force: true });

const localEnvPath = resolve(root, ".env.local");
let secretValues = [];
try {
  const localEnv = await readFile(localEnvPath, "utf8");
  secretValues = localEnv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .filter((line) => /(?:KEY|SECRET|TOKEN|PASSWORD)\s*=/.test(line.toUpperCase()))
    .map((line) => line.slice(line.indexOf("=") + 1).trim().replace(/^['"]|['"]$/g, ""))
    .filter((value) => value.length >= 8);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

async function assertNoSecrets(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      await assertNoSecrets(path);
      continue;
    }
    if (!entry.isFile() || secretValues.length === 0) continue;
    const contents = await readFile(path);
    for (const value of secretValues) {
      if (contents.includes(Buffer.from(value))) {
        throw new Error(`Build contains a local secret in ${path}`);
      }
    }
  }
}

await assertNoSecrets(dist);
