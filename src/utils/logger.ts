type LogLevel = "info" | "warn" | "error" | "debug";

const styles = {
  info: "color: #3b82f6; font-weight: bold;",
  warn: "color: #f59e0b; font-weight: bold;",
  error: "color: #ef4444; font-weight: bold;",
  debug: "color: #8b5cf6; font-weight: bold;",
  reset: "color: inherit;",
};

class Logger {
  private log(
    level: LogLevel,
    context: string,
    message: string,
    data?: unknown
  ) {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `%c[TasksTimeline][${timestamp}][${context}]`;

    switch (level) {
      case "info":
        console.log(`${prefix} ${message}`, styles.info, data || "");
        break;
      case "warn":
        console.warn(`${prefix} ${message}`, styles.warn, data || "");
        break;
      case "error":
        console.error(`${prefix} ${message}`, styles.error, data || "");
        break;
      case "debug":
        console.debug(`${prefix} ${message}`, styles.debug, data || "");
        break;
    }
  }

  info(context: string, message: string, data?: unknown) {
    this.log("info", context, message, data);
  }

  warn(context: string, message: string, data?: unknown) {
    this.log("warn", context, message, data);
  }

  error(context: string, message: string, data?: unknown) {
    this.log("error", context, message, data);
  }

  debug(context: string, message: string, data?: unknown) {
    this.log("debug", context, message, data);
  }
}

export const logger = new Logger();
