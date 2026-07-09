#!/bin/sh
set -e

ORIGIN="${PUBLIC_SITE_URL:-https://mercantec.tech}"
ORIGIN="${ORIGIN%/}"

printf 'window.__MERCANTEC_SITE_ORIGIN__="%s";\n' "$ORIGIN" > /usr/share/nginx/html/site-origin.js

exec nginx -g "daemon off;"
