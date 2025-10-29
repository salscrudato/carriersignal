/**
 * Structured Logging Utility
 * Provides consistent logging across the application with severity levels
 */

const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

interface LogEntry {
  timestamp: string;
  level: LogLevelType;
  module: string;
  message: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  private formatEntry(entry: LogEntry): string {
    const { timestamp, level, module, message, data } = entry;
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] [${module}] ${message}${dataStr}`;
  }

  private log(level: LogLevelType, module: string, message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      data,
    };

    const formatted = this.formatEntry(entry);

    switch (level) {
      case 'DEBUG':
        if (this.isDevelopment) console.debug(formatted);
        break;
      case 'INFO':
        console.info(formatted);
        break;
      case 'WARN':
        console.warn(formatted);
        break;
      case 'ERROR':
        console.error(formatted);
        break;
    }

    // TODO: Send to Sentry or other error tracking service
  }

  debug(module: string, message: string, data?: unknown) {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  info(module: string, message: string, data?: unknown) {
    this.log(LogLevel.INFO, module, message, data);
  }

  warn(module: string, message: string, data?: unknown) {
    this.log(LogLevel.WARN, module, message, data);
  }

  error(module: string, message: string, data?: unknown) {
    this.log(LogLevel.ERROR, module, message, data);
  }
}

export const logger = new Logger();

