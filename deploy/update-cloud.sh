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
curl --fail --location --retry 2 --connect-timeout 15 --max-time 300 \
  "https://codeload.github.com/123Daved/my-work/tar.gz/$commit" -o "$release/source.tar.gz"
tar -xzf "$release/source.tar.gz" --strip-components=1 -C "$release"
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
writeFileSync('dist/heart_islands/.dev.vars', `DEEPSEEK_API_KEY=${process.env.HEART_ISLANDS_KEY}\n`, { mode: 0o600 });
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
sudo systemctl daemon-reload
sudo systemctl restart heart-islands
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

echo 'New release failed readiness checks; restoring the previous service configuration.'
if "$had_override"; then
  sudo cp -p "$release/previous-release.conf" "$override"
else
  sudo unlink "$override"
fi
sudo systemctl daemon-reload
sudo systemctl restart heart-islands
exit 1
