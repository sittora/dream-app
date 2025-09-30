# NuminOS Sidecar Security

This document outlines security controls, threat model, and operational checklists for the NuminOS sidecar.

Threat model (brief)
- Attacker may attempt to call /analyze to exfiltrate data or perform model abuse.
- Cross-tenant access: malicious client trying to read other org/user data.
- Token theft: short-lived tokens reduce blast radius.

Controls
- Authentication: RS256 JWTs minted by the host app `/token`; all protected endpoints require Authorization: Bearer <token>.
- Tenant isolation: every persisted/read operation is keyed by {orgId,userId}. Server enforces orgId from token.
- Rate limiting: per-org/user/ip sliding window.
- CORS: only allow host app origins via `NUMINOS_ALLOWED_ORIGINS`.
- PII redaction applied before LLM calls; logs never include raw text.
- Key management: store private keys in a KMS or secure secrets manager. Local private keys are for development only.

Key rotation
- Generate a new keypair, deploy the public key to sidecars, deploy private key to the token-minting authority (host app), and perform a rolling switch. Keep an overlap period for validation of both new and old keys.

Operational checklist
- Ensure `NUMINOS_ALLOWED_ORIGINS` only contains your host app origin.
- Monitor rate limit metrics and increase limits for known tenants if needed.
- Regularly review logs for 401/403 spikes.

Token issuance
- The `/token` endpoint requires the `NUMINOS_HOST_API_KEY` header to be set (X-Host-Api-Key) for minting tokens in production. The host app should hold this key and obtain short-lived tokens for the widget.

