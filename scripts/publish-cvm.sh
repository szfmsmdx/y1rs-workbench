#!/usr/bin/env bash
# Run as root from an uploaded staging directory containing site/ and nginx-y1rs.conf.
set -euo pipefail
cd -- "$(dirname -- "${BASH_SOURCE[0]}")"
base=/var/www/y1rs
release="$base/releases/$(date -u +%Y%m%dT%H%M%SZ)"
snippet=/etc/nginx/snippets/y1rs-location.conf
vhost=/etc/nginx/sites-available/cloudbench
backup=/var/backups/y1rs/cloudbench.original
previous=''
if [[ -L "$base/current" ]]; then
    previous=$(readlink "$base/current")
fi

files=(index.html style.css app.js catalog.js bike.js mark.svg yubc-mask.png)
media=(media/bike-{yswc,ysbc,sdm5,ysww,ysbo,ysyl,yubc}.jpg media/swatch-{yswc,ysbc,sdm5,ysww,ysbo,yubc}.png)
for file in "${files[@]}" "${media[@]}"; do
    test -s "site/$file"
done
install -d -m 0755 "$base/releases"
mkdir -m 0755 "$release" "$release/media"
install -m 0644 "${files[@]/#/site/}" "$release/"
install -m 0644 "${media[@]/#/site/}" "$release/media/"
switch_release() {
    ln -s -- "$1" "$base/.current-$$"
    mv -Tf -- "$base/.current-$$" "$base/current"
}

# First publication: wire this static path into the existing HTTP and HTTPS vhosts.
# CloudBench retains its original HTTP redirect and Basic Auth outside /y1rs/.
if [[ ! -f "$snippet" ]]; then
    install -d -m 0700 /var/backups/y1rs
    test ! -e "$backup"
    cp -a -- "$vhost" "$backup"
    install -m 0644 nginx-y1rs.conf "$snippet"
    if ! python3 - "$vhost" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
data = path.read_text()
http = "    return 301 https://43.143.110.42$request_uri;\n"
https = "    client_max_body_size 2m;\n"
include = "    include /etc/nginx/snippets/y1rs-location.conf;\n"

if data.count(http) != 1 or data.count(https) != 1:
    raise SystemExit("Unexpected CloudBench vhost; no changes written")
updated = data.replace(http, include + "    location / {\n    " + http + "    }\n", 1)
updated = updated.replace(https, https + "\n" + include, 1)
with path.open("w") as out:
    out.write(updated)
PY
    then
        rm -- "$snippet" "$backup"
        exit 1
    fi
    switch_release "$release"
    if ! nginx -t || ! systemctl reload nginx; then
        mv -f -- "$backup" "$vhost"
        rm -- "$snippet"
        nginx -t && systemctl reload nginx
        exit 1
    fi
else
    switch_release "$release"
fi
printf 'Published: %s\nPrevious: %s\n' "$release" "${previous:-none}"
