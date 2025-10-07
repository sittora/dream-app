// Lightweight browser logger shim (no process/env/crypto node usage)
// Mirrors API of pino logger minimally for .info/.warn/.error/.debug
type Level = 'info' | 'warn' | 'error' | 'debug';
function log(level: Level, args: any[]) {
  const ts = new Date().toISOString();
  // Map to console method
  const fn = (console as any)[level] || console.log;
  fn(`[${ts}] [${level}]`, ...args);
}

export const logger = {
  info: (...args: any[]) => log('info', args),
  warn: (...args: any[]) => log('warn', args),
  error: (...args: any[]) => log('error', args),
  debug: (...args: any[]) => log('debug', args)
};

export default logger;