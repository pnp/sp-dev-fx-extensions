import { Log } from '@microsoft/sp-core-library';
import { emitNavigationDiagnostic } from './navigationTelemetry';

const LOG_SOURCE = 'header';

export interface IErrorReportOptions {
  action: string;
  level?: 'desktop' | 'mobile' | 'service';
  
  severity?: 'error' | 'warning';
  reason?: string;
  itemId?: string;
  itemLabel?: string;
  termSetName?: string;
  metadata?: Record<string, string | number | boolean | undefined>;
  rethrow?: boolean;
}

export function reportError(error: unknown, options: IErrorReportOptions): void {
  const reason = error instanceof Error
    ? error.message
    : typeof error === 'string'
      ? error
      : String(error);

  const action = options.action;
  const level = options.level ?? 'service';
  const logMessage = new Error(`[${action}] ${reason}`);

  if (options.severity === 'warning') {
    Log.warn(LOG_SOURCE, logMessage.message);
  } else {
    Log.error(LOG_SOURCE, logMessage);
  }

  emitNavigationDiagnostic({
    action,
    level,
    reason,
    itemId: options.itemId,
    itemLabel: options.itemLabel,
    termSetName: options.termSetName,
    metadata: {
      ...options.metadata,
      stack: error instanceof Error ? error.stack?.slice(0, 500) : undefined
    }
  });

  if (options.rethrow) {
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withErrorReporting<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: IErrorReportOptions
): T {
  const wrapped = (...args: Parameters<T>): ReturnType<T> => {
    return fn(...args).catch((error: unknown) => {
      reportError(error, options);
    }) as ReturnType<T>;
  };
  return wrapped as unknown as T;
}