# NuminOS Widget (scaffold)

This folder is a scaffold for the embeddable NuminOS widget. For quick local dev we place a small standalone `embed.js` under `/public/numinos-widget/embed.js` which is loaded by the app when the feature flag `VITE_NUMINOS_ENABLED` is enabled.

Design goals:
- Render into a Shadow DOM so the host site's CSS and fonts are not affected.
- Minimal JS and no external CSS dependencies.
- Communicate with a sidecar service (`numinos-service`) for analysis and persisted graph storage.

Production note:
- In production, build the widget and host it from the sidecar (e.g., `https://numinos.example.com/embed.js`).
- Require a short-lived token from the sidecar for authenticated requests.
