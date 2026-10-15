#!/usr/bin/env bash
set -euo pipefail

# Run as ubuntu on the existing Heart Islands server. The API key is entered
# without echo and never appears in command arguments or shell history.
commit=${1:?Usage: bash update-cloud.sh FULL_GITHUB_COMMIT_SHA}
[[ "$commit" =~ ^[0-9a-f]{40}$ ]] || { echo 'Expected a full commit SHA'; exit 1; }
previous=/home/ubuntu/apps/heart-islands
test -d "$previous"
sudo -n true
release=$(mktemp -d /home/ubuntu/apps/heart-islands-release.XXXXXX)
echo "Preparing release: $release"
# This update changes code only. Reuse the existing media library locally so
# a slow GitHub connection does not need to download 100 MB of unchanged media.
tar -C "$previous" --exclude='./node_modules' --exclude='./dist' --exclude='./.git' -cf - . | tar -xf - -C "$release"
files=(
  .env.example .gitignore .openai/hosting.json README.md
  package.json package-lock.json vite.config.js wrangler.jsonc index.html
  scripts/prepare-sites-build.mjs scripts/empty-env/.gitkeep
  server/deepseek-config.js server/api.test.js server/deepseek.js
  server/lovera-chat.js server/worker.js server/profile-skill.js
  src/App.jsx src/main.jsx src/screens.jsx src/index.css src/storm.css
  src/data/story.js src/engine/interpreter.js src/engine/islandAudio.js src/ui/Mascot.jsx
)
for file in "${files[@]}"; do
  curl --fail --silent --show-error --location --retry 2 --connect-timeout 15 --max-time 60 \
    "https://raw.githubusercontent.com/123Daved/my-work/$commit/$file" --create-dirs -o "$release/$file"
done
cd "$release"
if cmp -s package-lock.json "$previous/package-lock.json" && test -d "$previous/node_modules"; then
  ln -s "$previous/node_modules" node_modules
else
  npm ci --no-audit --no-fund
fi
npm test
npm run build:cloud

IFS= read -r -s -p 'New DeepSeek API key (hidden): ' HEART_ISLANDS_KEY </dev/tty
printf '\n'
[[ "$HEART_ISLANDS_KEY" == sk-* ]] || { echo 'Invalid key format; current service was not changed.'; exit 1; }
export HEART_ISLANDS_KEY
node --input-type=module <<'JS'
import { writeFileSync } from 'node:fs';
const content = `DEEPSEEK_API_KEY=${process.env.HEART_ISLANDS_KEY}\n`;
writeFileSync('dist/heart_islands/.dev.vars', content, { mode: 0o600 });
writeFileSync('.env.local', content, { mode: 0o600 });
JS
unset HEART_ISLANDS_KEY

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
