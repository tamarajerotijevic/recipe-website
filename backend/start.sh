#!/usr/bin/env sh
set -e
echo "Running migrations..."
npx sequelize-cli db:migrate --env production
echo "Running seeders (if any)..."
npx sequelize-cli db:seed:all --env production || true
echo "Starting API..."
node index.js