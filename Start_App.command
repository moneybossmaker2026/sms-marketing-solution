#!/bin/bash
cd "$(dirname "$0")"

echo "=========================================="
echo "Starting SMS Marketing Engine..."
echo "=========================================="

if[ ! -d "node_modules" ]; then
  npm install
  npx prisma db push
  npm run seed
fi

npm run dev &
SERVER_PID=$!

sleep 5

if which xdg-open > /dev/null
then
  xdg-open http://localhost:3000
elif which gnome-open > /dev/null
then
  gnome-open http://localhost:3000
elif which open > /dev/null
then
  open http://localhost:3000
fi

wait $SERVER_PID