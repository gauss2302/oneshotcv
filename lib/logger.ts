/**
 * Structured logging utility for production
 * Supports JSON format for log aggregation services
 */

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private isProduction = process.env.NODE_ENV === "production";

  private formatLog(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (context) {
      entry.context = this.sanitizeContext(context);
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return entry;
  }

  private sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ["password", "secret", "token", "key", "authorization", "cookie"];

    for (const [key, value] of Object.entries(context)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = "[REDACTED]";
      } else if (value instanceof Error) {
        sanitized[key] = {
          name: value.name,
          message: value.message,
          stack: this.isDevelopment ? value.stack : undefined,
        };
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private output(entry: LogEntry): void {
    if (this.isProduction) {
      // JSON format for production (log aggregation)
      console.log(JSON.stringify(entry));
    } else {
      // Human-readable format for development
      const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
      console.log(prefix, entry.message);
      if (entry.context) {
        console.log("  Context:", entry.context);
      }
      if (entry.error) {
        console.error("  Error:", entry.error);
      }
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.output(this.formatLog("debug", message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.output(this.formatLog("info", message, context));
  }

  warn(message: string, context?: Record<string, unknown>, error?: Error): void {
    this.output(this.formatLog("warn", message, context, error));
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.output(this.formatLog("error", message, context, error));
  }

  // Convenience method for API request logging
  request(method: string, path: string, statusCode: number, duration?: number, requestId?: string): void {
    const context: Record<string, unknown> = {
      method,
      path,
      statusCode,
    };

    if (duration !== undefined) {
      context.duration = `${duration}ms`;
    }

    if (requestId) {
      context.requestId = requestId;
    }

    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    this.output(this.formatLog(level, `${method} ${path} - ${statusCode}`, context));
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other modules
export type { LogLevel, LogEntry };
