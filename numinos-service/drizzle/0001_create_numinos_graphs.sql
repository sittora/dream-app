-- 0001_create_numinos_graphs.sql
CREATE TABLE IF NOT EXISTS numinos_graphs (
  org_id text NOT NULL,
  user_id text NOT NULL,
  req_hash text NOT NULL,
  result jsonb,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (org_id, user_id, req_hash)
);

-- enable RLS if possible
ALTER TABLE IF EXISTS numinos_graphs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'tenant_policy' AND tablename = 'numinos_graphs'
  ) THEN
    CREATE POLICY tenant_policy ON numinos_graphs
      USING (org_id = current_setting('request.org_id'))
      WITH CHECK (org_id = current_setting('request.org_id'));
  END IF;
END$$;
