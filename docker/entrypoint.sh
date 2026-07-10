#!/bin/sh
set -e

if [ -n "${PUBLIC_SITE_URL:-}" ]; then
  ORIGIN="${PUBLIC_SITE_URL}"
elif [ -n "${FRONTEND_DOMAIN:-}" ]; then
  ORIGIN="https://${FRONTEND_DOMAIN}"
else
  ORIGIN="https://mercantec.tech"
fi

ORIGIN="${ORIGIN%/}"
case "$ORIGIN" in
  *mercantec.tech*)
    ORIGIN="https://mercantec.tech"
    ;;
esac

printf 'window.__MERCANTEC_SITE_ORIGIN__="%s";\n' "$ORIGIN" > /usr/share/nginx/html/site-origin.js

exec nginx -g "daemon off;"
