GDPR export & deletion

This document describes the export and deletion endpoints provided by the numinos sidecar and recommendations for operators.

Endpoints
- GET /export?orgId=<org>&userId=<user> — Exports persisted analysis results for the given org and user. This endpoint requires the `NUMINOS_HOST_API_KEY` to be supplied in the `X-Host-Api-Key` header. The response is newline-delimited JSON objects where each line is a persisted record.
- DELETE /data?orgId=<org>&userId=<user> — Deletes persisted analysis data for the org/user. Requires `NUMINOS_HOST_API_KEY`.

Operational notes
- The default file-based storage persists records under the `numinos-data/` folder. Files are named using a safe hashed key and do not contain raw PII; PII is redacted prior to storage. Nonetheless, treat the folder as sensitive and ensure backups are encrypted and access is restricted.
- When running in production with Postgres, enable RLS policies as described in `docs/postgres-rls.md`. Use `SET LOCAL request.org_id = '<org>'` within transactions for per-request tenant scoping.

Retention and TTL
- The sidecar supports `NUMINOS_NO_RETENTION` (boolean) to disable automatic deletion and `NUMINOS_TTL_DAYS` (integer) to set retention in days. A background cleanup job runs once per 24 hours and deletes records older than the TTL unless `NUMINOS_NO_RETENTION` is set.
- Operators should set conservative TTLs and provide an admin UI or integration for auditors to trigger exports before deletion if required by policy.

Security
- Only trusted host applications should hold `NUMINOS_HOST_API_KEY`. Rotate this secret periodically and store it in a secrets manager.
- For stronger authentication of the host, consider using mTLS or a signed assertion protocol instead of a static API key.
