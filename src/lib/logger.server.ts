import pino from 'pino';

// Node/server logger (pino) with redaction.
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: {
    paths: [
      'req.headers.authorization',
      'req.body.password',
      'req.body.token',
      'user.password',
      'config.secrets',
      'headers.cookie'
    ],
    remove: true
  }
});

export default logger;