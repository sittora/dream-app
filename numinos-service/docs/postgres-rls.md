# Postgres + Row Level Security (RLS) setup

This document shows a minimal approach to enable tenant isolation using Postgres RLS.

1) Create a table for graph results

```sql
CREATE TABLE numinos_graphs (
  org_id text NOT NULL,
  user_id text NOT NULL,
  req_hash text NOT NULL,
  payload jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (org_id, user_id, req_hash)
);
```

2) Enable RLS and policy

```sql
ALTER TABLE numinos_graphs ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_policy ON numinos_graphs USING (org_id = current_setting('request.org_id') ) WITH CHECK (org_id = current_setting('request.org_id'));
```

3) In your application per-request transaction, set the session variable before running queries:

```sql
BEGIN;
SET LOCAL request.org_id = 'the-org-id';
-- run selects/inserts
COMMIT;
```

4) Ensure all queries include user_id scoping as well for defense in depth.

Notes:
- Use a dedicated DB role and a connection pool. Never allow clients to set `request.org_id` directly.
- Consider building a small DB wrapper that sets `SET LOCAL` and runs the request in a single transaction to avoid leaks.
