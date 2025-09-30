Host authentication for /token

This sidecar supports stronger host authentication using signed assertions (RS256) from your host application.

How it works
- The host holds an RSA private key (PEM).
- The host signs a short-lived JWT (assertion) with payload including: iss (host id), aud=numinos-sidecar, iat, exp (short), jti (random id).
- The host sends the assertion in Authorization: Bearer <assertion> when POSTing to /token.
- The sidecar verifies the assertion using the host public key (set NUMINOS_HOST_PUBLIC_KEY or NUMINOS_HOST_PUBLIC_KEY_PATH) and rejects replays.

Configuration
- Set NUMINOS_HOST_PUBLIC_KEY or NUMINOS_HOST_PUBLIC_KEY_PATH to point to the host public key PEM.
- Optionally set NUMINOS_HOST_ID and NUMINOS_HOST_AUD to validate iss and aud claims.

Example
- Generate keys (dev):
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out host_private.pem
  openssl rsa -pubout -in host_private.pem -out host_public.pem
- Put host_public.pem path in NUMINOS_HOST_PUBLIC_KEY_PATH or copy PEM into NUMINOS_HOST_PUBLIC_KEY.
- Use the example host script to request a token:
  NODE_OPTIONS=--experimental-loader=ts-node/esm SIDECAR_URL=http://localhost:5789 node scripts/host-request-token.js user123 org1

Compatibility
- If the sidecar is not configured with a host public key, it falls back to the legacy NUMINOS_HOST_API_KEY header (X-Host-Api-Key). It's recommended to migrate to signed assertions.

Security notes
- Keep the host private key in a secure store (KMS, HSM) in production.
- Assertions are short-lived (default 60s in example) and use jti to avoid replay attacks.
