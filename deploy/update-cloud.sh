#!/usr/bin/env bash
set -euo pipefail

# Run as ubuntu. Pass --reuse-key for content-only updates: the current service's
# runtime secret stays on the server and is never echoed or sent to GitHub.
commit=${1:?Usage: bash update-cloud.sh FULL_GITHUB_COMMIT_SHA}
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] || { echo 'Expected a full commit SHA'; exit 1; }
secret_mode=${2:---replace-key}
[[ "$secret_mode" == --reuse-key || "$secret_mode" == --replace-key ]] || exit 1
previous=$(systemctl show heart-islands --property=WorkingDirectory --value)
[[ "$previous" =~ ^/home/ubuntu/apps/heart-islands(-release\.[[:alnum:]]+)?$ ]] || { echo 'Unexpected active release directory'; exit 1; }
test -d "$previous"
if [[ "$secret_mode" == --reuse-key ]]; then
  test -s "$previous/dist/heart_islands/.dev.vars"
fi
sudo -n true
resume_release=${3:-}
if [[ -n "$resume_release" ]]; then
  [[ "$resume_release" =~ ^/home/ubuntu/apps/heart-islands-release\.[[:alnum:]]+$ ]] || exit 1
  test -d "$resume_release"
  release=$resume_release
else
release=$(mktemp -d /home/ubuntu/apps/heart-islands-release.XXXXXX)
echo "Preparing release: $release"
# Reuse unchanged original media, then fetch the smaller optimized variants below.
tar -C "$previous" --exclude='./node_modules' --exclude='./dist' --exclude='./.git' -cf - . | tar -xf - -C "$release"
files=(
  .env.example .gitignore .openai/hosting.json README.md
  package.json package-lock.json vite.config.js wrangler.jsonc index.html
  scripts/prepare-sites-build.mjs scripts/empty-env/.gitkeep
  scripts/media.test.js scripts/optimize-media.mjs src/assets/optimized/manifest.json
  server/deepseek-config.js server/api.test.js server/deepseek.js
  server/lovera-chat.js server/worker.js server/profile-skill.js
  src/App.jsx src/main.jsx src/screens.jsx src/index.css src/storm.css
  src/data/story.js src/engine/interpreter.js src/engine/islandAudio.js src/ui/Mascot.jsx
)
for file in "${files[@]}"; do
  curl --fail --silent --show-error --location --retry 2 --connect-timeout 15 --max-time 60 \
    "https://raw.githubusercontent.com/123Daved/my-work/$commit/$file" --create-dirs -o "$release/$file"
done
fi
cd "$release"
HEART_ISLANDS_COMMIT="$commit" node --input-type=module <<'JS'
import { readFile, mkdir, rename } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
const { entries } = JSON.parse(await readFile('src/assets/optimized/manifest.json', 'utf8'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < entries.length) {
    const entry = entries[next++];
    if (!/^optimized\/(?:audio\/|video\/)?[a-z0-9-]+\.(webp|m4a|mp4)$/.test(entry.output)) throw new Error('Invalid media path');
    const path = `src/assets/${entry.output}`;
    try { if (hash(await readFile(path)) === entry.outputSha256) continue; } catch {}
    await mkdir(dirname(path), { recursive: true });
    // Keep partial bytes across interrupted transfers. Retrying a curl response
    // through stdout can concatenate partial and complete responses, corrupting it.
    const partial = `${path}.part`;
    let verified = false;
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        await run('curl', ['--fail', '--silent', '--show-error', '--location', '--continue-at', '-', '--connect-timeout', '10', '--max-time', '30', '--output', partial, `https://raw.githubusercontent.com/123Daved/my-work/${process.env.HEART_ISLANDS_COMMIT}/${path}`]);
      } catch { /* A later request resumes from the bytes already received. */ }
      let bytes;
      try { bytes = await readFile(partial); } catch { continue; }
      if (hash(bytes) === entry.outputSha256) {
        await rename(partial, path);
        verified = true;
        break;
      }
      if (bytes.length >= entry.bytes) throw new Error(`Media checksum mismatch: ${path}`);
      console.log(`Partial ${path}: ${bytes.length}/${entry.bytes} bytes`);
    }
    if (!verified) throw new Error(`Media transfer incomplete; safe to resume: ${path}`);
    console.log(`Verified ${path}`);
  }
}));
console.log('Optimized media verified.');
JS
if cmp -s package-lock.json "$previous/package-lock.json" && test -d "$previous/node_modules"; then
  ln -s "$previous/node_modules" node_modules
else
  npm ci --no-audit --no-fund
fi
npm test
npm run build:cloud

if [[ "$secret_mode" == --reuse-key ]]; then
  install -m 600 "$previous/dist/heart_islands/.dev.vars" dist/heart_islands/.dev.vars
  install -m 600 "$previous/dist/heart_islands/.dev.vars" .env.local
else
IFS= read -r -s -p 'New DeepSeek API key (hidden): ' HEART_ISLANDS_KEY </dev/tty
printf '\n'
[[ "$HEART_ISLANDS_KEY" == sk-* ]] || { echo 'Invalid key format; current service was not changed.'; exit 1; }
export HEART_ISLANDS_KEY
node --input-type=module <<'JS'
import { chmodSync, writeFileSync } from 'node:fs';
const content = `DEEPSEEK_API_KEY=${process.env.HEART_ISLANDS_KEY}\n`;
writeFileSync('dist/heart_islands/.dev.vars', content, { mode: 0o600 });
writeFileSync('.env.local', content, { mode: 0o600 });
chmodSync('dist/heart_islands/.dev.vars', 0o600);
chmodSync('.env.local', 0o600);
JS
unset HEART_ISLANDS_KEY
fi

override=/etc/systemd/system/heart-islands.service.d/20-release.conf
sudo install -d -m 755 /etc/systemd/system/heart-islands.service.d
had_override=false
if sudo test -f "$override"; then
  sudo cp -p "$override" "$release/previous-release.conf"
  had_override=true
fi
printf '[Service]\nWorkingDirectory=%s\nExecStart=\nExecStart=%s/node_modules/.bin/wrangler dev --config dist/heart_islands/wrangler.json --ip 127.0.0.1 --port 4173\n' \
  "$release" "$release" > "$release/release.conf"
sudo install -m 644 "$release/release.conf" "$override"
if sudo systemctl daemon-reload && sudo systemctl restart heart-islands; then
for attempt in {1..20}; do
  if curl -fsS --max-time 3 http://127.0.0.1:4173/api/health | node --input-type=module -e '
    let text=""; for await (const part of process.stdin) text+=part;
    const health=JSON.parse(text);
    if (!health.ok || !health.deepseekConfigured || health.model!=="deepseek-flash") process.exit(1);
    console.log(JSON.stringify(health));' 2>/dev/null; then
    echo "DEPLOYED $commit"
    echo "RELEASE $release"
    exit 0
  fi
  sleep 1
done
fi

echo 'New release failed readiness checks; restoring the previous service configuration.'
if "$had_override"; then
  sudo cp -p "$release/previous-release.conf" "$override"
else
  sudo unlink "$override"
fi
sudo systemctl daemon-reload
sudo systemctl restart heart-islands
exit 1
