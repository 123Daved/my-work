#!/usr/bin/env bash
# Run after update-cloud.sh succeeds. Leaves API and unrelated routes untouched.
set -euo pipefail
sudo -n true
release=$(systemctl show heart-islands --property=WorkingDirectory --value)
[[ "$release" =~ ^/home/ubuntu/apps/heart-islands-release\.[[:alnum:]]+$ ]] || exit 1
test -f "$release/dist/client/assets/welcome-sky-islands-CkImFmZ7.webp"
test -f "$release/dist/client/assets/chapter-1-to-2-kvhQKnA7.mp4"
config=/etc/nginx/sites-available/heart-islands
snippet=/etc/nginx/snippets/heart-islands-static.conf
backup=$(mktemp -d /home/ubuntu/apps/heart-islands-nginx-backup.XXXXXX)
sudo cp -p "$config" "$backup/site.conf"
had_snippet=false
if sudo test -f "$snippet"; then
  sudo cp -p "$snippet" "$backup/static.conf"
  had_snippet=true
fi
rollback() {
  sudo cp -p "$backup/site.conf" "$config"
  if "$had_snippet"; then sudo cp -p "$backup/static.conf" "$snippet"; else sudo unlink "$snippet" || true; fi
  sudo nginx -t && sudo systemctl reload nginx
  echo "Nginx configuration restored from $backup"
}
trap rollback ERR

# Only public build assets are copied; runtime secrets are outside this directory.
# Keep old content-hashed assets so visitors with cached HTML are not interrupted.
sudo install -d -m 755 /var/www/heart-islands-public/assets
if test -f "$release/previous-release.conf"; then
  previous=$(sed -n 's/^WorkingDirectory=//p' "$release/previous-release.conf")
  if [[ "$previous" =~ ^/home/ubuntu/apps/heart-islands(-release\.[[:alnum:]]+)?$ ]] && test -d "$previous/dist/client/assets"; then
    sudo cp -a "$previous/dist/client/assets/." /var/www/heart-islands-public/assets/
  fi
fi
sudo cp -a "$release/dist/client/assets/." /var/www/heart-islands-public/assets/
sudo chmod -R a+rX /var/www/heart-islands-public/assets

HEART_ISLANDS_NGINX_BACKUP="$backup" node --input-type=module <<'JS'
import { readFileSync, writeFileSync } from 'node:fs';
const dir = process.env.HEART_ISLANDS_NGINX_BACKUP;
const original = readFileSync(`${dir}/site.conf`, 'utf8');
if (!original.includes('server_name 101.35.231.127;')) throw new Error('Unexpected server configuration');
const include = 'include /etc/nginx/snippets/heart-islands-static.conf;';
if (!original.includes(include) && /location\s+(?:\^~\s+)?\/assets\//.test(original)) throw new Error('Existing assets route needs manual review');
const updated = original.includes(include) ? original : original.replace(/server\s*\{/, `server {\n    ${include}`);
writeFileSync(`${dir}/new-site.conf`, updated);
writeFileSync(`${dir}/new-static.conf`, `# Content-hashed game assets: local delivery, Range requests, and browser caching.
location ^~ /assets/ {
    root /var/www/heart-islands-public;
    try_files $uri =404;
    sendfile on;
    tcp_nopush on;
    expires 365d;
    add_header Cache-Control "public, immutable";
    add_header X-Content-Type-Options nosniff;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
`);
JS
sudo install -m 644 "$backup/new-static.conf" "$snippet"
sudo install -m 644 "$backup/new-site.conf" "$config"
sudo nginx -t
sudo systemctl reload nginx
status=$(curl -sS --max-time 5 -o /dev/null -w '%{http_code}' -H 'Range: bytes=0-1023' http://127.0.0.1/assets/chapter-1-to-2-kvhQKnA7.mp4)
[[ "$status" == 206 ]]
curl -fsS --max-time 5 http://127.0.0.1/api/health
trap - ERR
printf '\nSTATIC_OPTIMIZATION_READY\nNGINX_BACKUP %s\n' "$backup"
