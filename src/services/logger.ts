import { format } from 'date-fns';

import { logger as rootLogger } from '../lib/logger.browser';

type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];

  private log(level: LogLevel, message: string, data?: Record<string, unknown>) {
    const entry: LogEntry = {
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      level,
      message,
      data,
    };

    this.logs.push(entry);
    
    // In production, send to logging service
  // Delegate to root logger to honor server logging policy
  (rootLogger as any)[level]({ data, msg: message });
  }

  info(message: string, data?: Record<string, unknown>) {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>) {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>) {
    this.log('error', message, data);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }
}

export const logger = new Logger();