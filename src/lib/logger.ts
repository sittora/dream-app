import pino from 'pino';

// Central application logger with redaction & standard serializers.
// Additive hardening: sensitive fields are removed, not masked, and can be reversed by editing this file only.
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
	},
});
