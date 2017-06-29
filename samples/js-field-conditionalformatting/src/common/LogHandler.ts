import ILogHandler from '@microsoft/sp-core-library/lib/log/ILogHandler';
import { ServiceScope } from '@microsoft/sp-core-library';

export enum LogLevel {
  Verbose = 1,
  Info,
  Warning,
  Error
}

export class LogHandler implements ILogHandler {
    constructor(private logLevel: LogLevel) {
    }

    public verbose(source: string, message: string, scope: ServiceScope | undefined): void {
      this.log(source, message, LogLevel.Verbose, scope);
    }

    public info(source: string, message: string, scope: ServiceScope | undefined): void {
      this.log(source, message, LogLevel.Info, scope);
    }

    public warn(source: string, message: string, scope: ServiceScope | undefined): void {
      this.log(source, message, LogLevel.Warning, scope);      
    }

    public error(source: string, error: Error, scope: ServiceScope | undefined): void {
      this.log(source, error.message, LogLevel.Error, scope);
    }

    private log(source: string, message: string, logLevel: LogLevel, scope: ServiceScope | undefined): void {
      if (this.logLevel > logLevel) {
        return;
      }

      const msg: string = `***${source}: ${LogLevel[logLevel].toUpperCase()} ${message}"`;

      switch (logLevel) {
        case LogLevel.Verbose:
          console.log(msg);
          break;
        case LogLevel.Info:
          console.info(msg);
          break;
        case LogLevel.Warning:
          console.warn(msg);
          break;
        case LogLevel.Error:
          console.error(msg);
          break;
      }
    }
}