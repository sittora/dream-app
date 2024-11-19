import { env } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private isDevelopment = env.ENV === 'development';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const logEntry = this.formatLog(level, message, context);

    // In development, log to console with colors
    if (this.isDevelopment) {
      const colors = {
        debug: '\x1b[34m', // blue
        info: '\x1b[32m',  // green
        warn: '\x1b[33m',  // yellow
        error: '\x1b[31m', // red
      };

      console.log(
        `${colors[level]}[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}\x1b[0m`,
        context || ''
      );
      return;
    }

    // In production, we would typically send logs to a service
    // This is where you'd integrate with services like DataDog, New Relic, etc.
    if (env.ENV === 'production') {
      // TODO: Implement production logging service integration
      console.log(JSON.stringify(logEntry));
    }
  }

  debug(message: string, context?: Record<string, unknown>) {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context);
  }
}

export const logger = Logger.getInstance();
