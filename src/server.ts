// New lean server lifecycle file (routes & logic extracted to app.ts)
import { logger as baseLogger } from './lib/logger.server.js';
import { app } from './server/app.js';
const port = Number(process.env.PORT || 3001);

// Log full git SHA (if present) once at startup (not truncated)
const fullSha = process.env.GIT_SHA || 'unknown';
baseLogger.info({ event: 'version_metadata', gitShaFull: fullSha }, 'Service version metadata');
baseLogger.info({ event: 'server_starting', port }, 'Starting HTTP server…');
app.listen(port, () => {
  baseLogger.info({ event: 'server_listen', port }, 'Server is ready and listening');
});

export default app;