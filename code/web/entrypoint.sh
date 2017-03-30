#!/usr/bin/env bash
set -e;

# first use first program parameter, if not set use $PORT, if that is undefined use default 8000.
PORT=${PORT:-8000}
PORT=${1:-$PORT}
API_URL=${API_URL:-http://localhost}
JS_PATH=${JS_PATH:-/app/}

SECRET_FILE='src/config.js'
echo "'use strict';" > $SECRET_FILE;
echo "" >> $SECRET_FILE;
echo "var _API_URL = \"$API_URL\";" >> $SECRET_FILE;

echo "Starting server on port $PORT (\$PORT), serving path \"$JS_PATH\" (\$JS_PATH)."
echo "The browser will connect to the API at \"$API_URL\" (\$API_URL)."

COMMAND="http-server -p $PORT -c-1 $JS_PATH"
echo "\$ $COMMAND"

$COMMAND