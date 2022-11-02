import winston from 'winston';

class Logger {
  private logger: winston.Logger;

  public constructor() {
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp, stack }) => {
          return `[${timestamp}] ${level.toUpperCase()}: ${stack ?? message}`;
        }),
        winston.format.colorize({ all: true }),
      ),
      transports: [new winston.transports.Console()],
      rejectionHandlers: [new winston.transports.Console()],
      exceptionHandlers: [new winston.transports.Console()],
    });
  }

  public error(e: unknown): void {
    this.logger.error(e);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public info(message: string): void {
    this.logger.info(message);
  }
}

export { Logger };
