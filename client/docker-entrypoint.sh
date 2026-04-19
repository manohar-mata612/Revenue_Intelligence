#!/bin/sh
set -e

: "${PORT:=8080}"
: "${BACKEND_URL:=http://localhost:8000}"
export PORT BACKEND_URL

envsubst '${PORT} ${BACKEND_URL}' \
    < /etc/nginx/default.conf.template \
    > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
