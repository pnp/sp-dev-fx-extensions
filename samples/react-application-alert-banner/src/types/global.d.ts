/**
 * Global type definitions for Alert Banner extension
 */

declare global {
  interface Window {
    // Application Insights (if using)
    appInsights?: {
      trackException: (exception: { exception: Error; properties?: Record<string, any> }) => void;
      trackEvent: (event: { name: string; properties?: Record<string, any> }) => void;
    };

    // SharePoint specific globals
    _spPageContextInfo?: {
      webAbsoluteUrl: string;
      siteAbsoluteUrl: string;
      userId: number;
      userDisplayName: string;
      userLoginName: string;
    };
  }
}

// SharePoint specific type augmentations
declare module "@microsoft/sp-http" {
  interface MSGraphClientV3 {
    api(path: string): MSGraphRequest;
  }

  interface MSGraphRequest {
    get(): Promise<any>;
    post(data: any): Promise<any>;
    patch(data: any): Promise<any>;
    delete(): Promise<any>;
    select(properties: string): MSGraphRequest;
    expand(properties: string): MSGraphRequest;
    filter(filter: string): MSGraphRequest;
    orderby(orderBy: string): MSGraphRequest;
    top(count: number): MSGraphRequest;
    skip(count: number): MSGraphRequest;
    header(name: string, value: string): MSGraphRequest;
  }
}

// Utility types for better type safety
export type NonEmptyString<T extends string> = T extends "" ? never : T;
export type SafeString = string & { __brand: 'SafeString' };
export type EmailAddress = string & { __brand: 'EmailAddress' };
export type Url = string & { __brand: 'Url' };
export type Guid = string & { __brand: 'Guid' };
export type ISODateString = string & { __brand: 'ISODateString' };

// Generic result types
export type Result<TSuccess, TError = Error> =
  | { success: true; data: TSuccess; error?: never }
  | { success: false; error: TError; data?: never };

export type AsyncResult<TSuccess, TError = Error> = Promise<Result<TSuccess, TError>>;

// API response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
}

// Performance monitoring types
export interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

export interface ErrorWithContext extends Error {
  context?: Record<string, any>;
  timestamp?: string;
  userId?: string;
  sessionId?: string;
}

// Form validation types
export type ValidationState = 'valid' | 'invalid' | 'pending' | 'unknown';

export interface ValidationResult<T = any> {
  state: ValidationState;
  errors: string[];
  warnings: string[];
  value?: T;
}

// Event handler types with proper typing
export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// Component prop helpers
export type ComponentWithChildren<TProps = {}> = TProps & {
  children?: React.ReactNode;
};

export type ComponentWithOptionalChildren<TProps = {}> = TProps & {
  children?: React.ReactNode | undefined;
};

// Strict object types
export type StrictObject<T> = T & { [K in keyof T]: T[K] };

// Export empty object to make this a module
export {};