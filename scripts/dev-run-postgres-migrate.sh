#!/usr/bin/env bash
set -euo pipefail

echo "Starting postgres via docker-compose..."
docker-compose up -d postgres

echo "Waiting for postgres to be ready..."
# Wait until pg_isready
for i in {1..30}; do
  docker exec $(docker-compose ps -q postgres) pg_isready -U numinos -d numinos && break || sleep 1
done

export DATABASE_URL="postgres://numinos:numinospass@localhost:5432/numinos"
echo "DATABASE_URL=$DATABASE_URL"

cd numinos-service
npm install --ignore-scripts
npm run build

echo "Running migration script..."
node ./dist/migrate-files-to-postgres.js || node ./src/migrate-files-to-postgres.js

echo "Migration finished"

# keep docker running and print a summary
docker-compose ps

echo "Done. Sidecar migration attempted. If you want the sidecar to use Postgres, export DATABASE_URL and start it:"
echo "  export DATABASE_URL=$DATABASE_URL"
echo "  export NUMINOS_HOST_API_KEY=\"your-host-key\""
echo "  cd numinos-service && npm start"
