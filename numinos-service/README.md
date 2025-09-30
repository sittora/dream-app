Numinos sidecar - Postgres integration

This folder contains the numinos sidecar service. By default it uses file-based storage under `numinos-data/`. To enable Postgres-backed storage and Row Level Security (RLS), follow these steps.

1) Set DATABASE_URL
   - Export `DATABASE_URL` in your environment to point to a Postgres instance the service can reach.

2) Create the table and RLS policy (optional - the service will attempt to create the table automatically):

```sql
CREATE TABLE numinos_graphs (
  org_id text NOT NULL,
  user_id text NOT NULL,
  req_hash text NOT NULL,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id, req_hash)
);
ALTER TABLE numinos_graphs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_policy ON numinos_graphs USING (org_id = current_setting('request.org_id')) WITH CHECK (org_id = current_setting('request.org_id'));
```

3) Install dependencies and build

```bash
cd numinos-service
npm install
npm run build
```

4) Migrate existing file records into Postgres (optional)

```bash
export DATABASE_URL=postgres://user:pass@host:5432/db
npm run migrate
```

5) Start the service

```bash
npm start
```

Notes:
- The migration script reads `numinos-data/*.json` and writes them to Postgres. It will attempt to create the table if missing.
- For production, prefer managing schema migrations with a tool (Flyway, Liquibase, or SQL migrations in your deploy pipeline) and having DB-admin create RLS policies.
# NuminOS Sidecar (scaffold)

This folder contains a scaffold for the NuminOS sidecar service. It's intentionally minimal and not wired into the main app by default.

Goals:
- Provide an Express + TypeScript sidecar that the widget can call for analysis and persistence.
- Serve an `embed.js` for production usage (in dev we load `public/numinos-widget/embed.js`).

Suggested next steps:
- Initialize a package.json and install dependencies: express, cors, jsonwebtoken, dotenv, pg (or sqlite), etc.
- Implement endpoints: POST /analyze, GET /graph, GET /metrics, POST /feedback, GET /journal-export
- Implement short-lived JWT issuance for widget auth and secure CORS allowlist.

This README is a starting point. The full implementation should live under this folder and be run as a separate process in dev via `npm run start:numinos`.
