#!/bin/bash

# Always run from this file's directory
cd "$(dirname "$0")"

PORT=5176

if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run only)..."
  npm install
fi

echo "Starting Infotainment Running Order dev server on port ${PORT} (strict)..."
npm run dev -- --port "${PORT}" --strictPort &
DEV_PID=$!

# Give Vite a moment to start
sleep 3

echo "Opening browser at http://localhost:${PORT}/ ..."
open "http://localhost:${PORT}/"

wait "${DEV_PID}"
