/**
 * Enhanced type definitions for Alert Banner components
 */

import { AlertPriority, NotificationType } from '../extensions/alertbanner/Components/Alerts/IAlerts';
import { SafeString, Url, Guid, ISODateString, ValidationResult } from './global';

// Enhanced alert types with strict typing
export interface IStrictAlertItem {
  readonly id: Guid;
  readonly title: SafeString;
  readonly description: SafeString;
  readonly alertType: SafeString;
  readonly priority: AlertPriority;
  readonly isPinned: boolean;
  readonly targetingRules?: readonly IStrictTargetingRule[];
  readonly notificationType: NotificationType;
  readonly richMedia?: IStrictRichMedia;
  readonly linkUrl?: Url;
  readonly linkDescription?: SafeString;
  readonly quickActions?: readonly IStrictQuickAction[];
  readonly targetSites: readonly string[];
  readonly status: 'Active' | 'Expired' | 'Scheduled';
  readonly createdDate: ISODateString;
  readonly modifiedDate: ISODateString;
  readonly scheduledStart?: Date;
  readonly scheduledEnd?: Date;
}

export interface IStrictTargetingRule {
  readonly field: SafeString;
  readonly operator: 'equals' | 'contains' | 'startsWith' | 'in' | 'notIn';
  readonly value: string | readonly string[];
  readonly conjunction?: 'and' | 'or';
}

export interface IStrictRichMedia {
  readonly type: 'image' | 'video' | 'document';
  readonly url: Url;
  readonly altText?: SafeString;
  readonly caption?: SafeString;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface IStrictQuickAction {
  readonly id: SafeString;
  readonly label: SafeString;
  readonly actionType: 'link' | 'dismiss' | 'acknowledge' | 'custom';
  readonly url?: Url;
  readonly icon?: SafeString;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface IStrictAlertType {
  readonly name: SafeString;
  readonly iconName: SafeString;
  readonly backgroundColor: SafeString;
  readonly textColor: SafeString;
  readonly additionalStyles?: SafeString;
  readonly priorityStyles: Readonly<Record<string, SafeString>>;
}

// Form state types
export interface IAlertFormData {
  title: string;
  description: string;
  alertType: string;
  priority: AlertPriority;
  isPinned: boolean;
  notificationType: NotificationType;
  linkUrl: string;
  linkDescription: string;
  targetSites: string[];
  scheduledStart?: Date;
  scheduledEnd?: Date;
  targetingRules?: IStrictTargetingRule[];
  richMedia?: IStrictRichMedia;
  quickActions?: IStrictQuickAction[];
}

export interface IAlertFormValidation {
  title: ValidationResult<SafeString>;
  description: ValidationResult<SafeString>;
  alertType: ValidationResult<SafeString>;
  priority: ValidationResult<AlertPriority>;
  linkUrl: ValidationResult<Url | undefined>;
  linkDescription: ValidationResult<SafeString | undefined>;
  targetSites: ValidationResult<readonly string[]>;
  dateRange: ValidationResult<{ start?: Date; end?: Date }>;
  isValid: boolean;
  errors: readonly string[];
  warnings: readonly string[];
}

// Service interfaces with strict typing
export interface IStrictAlertService {
  readonly getAlerts: () => Promise<readonly IStrictAlertItem[]>;
  readonly createAlert: (alert: IAlertFormData) => Promise<Result<IStrictAlertItem, Error>>;
  readonly updateAlert: (id: Guid, alert: Partial<IAlertFormData>) => Promise<Result<IStrictAlertItem, Error>>;
  readonly deleteAlert: (id: Guid) => Promise<Result<void, Error>>;
  readonly validateAlert: (alert: IAlertFormData) => IAlertFormValidation;
}

// Context types
export interface IStrictAlertsState {
  readonly alerts: readonly IStrictAlertItem[];
  readonly alertTypes: Readonly<Record<string, IStrictAlertType>>;
  readonly isLoading: boolean;
  readonly hasError: boolean;
  readonly errorMessage?: SafeString;
  readonly userDismissedAlerts: readonly Guid[];
  readonly userHiddenAlerts: readonly Guid[];
}

// Action types with strict payloads
export type StrictAlertsAction =
  | { readonly type: 'SET_ALERTS'; readonly payload: readonly IStrictAlertItem[] }
  | { readonly type: 'SET_ALERT_TYPES'; readonly payload: Readonly<Record<string, IStrictAlertType>> }
  | { readonly type: 'SET_LOADING'; readonly payload: boolean }
  | { readonly type: 'SET_ERROR'; readonly payload: { readonly hasError: boolean; readonly message?: SafeString } }
  | { readonly type: 'DISMISS_ALERT'; readonly payload: Guid }
  | { readonly type: 'HIDE_ALERT_FOREVER'; readonly payload: Guid }
  | { readonly type: 'SET_DISMISSED_ALERTS'; readonly payload: readonly Guid[] }
  | { readonly type: 'SET_HIDDEN_ALERTS'; readonly payload: readonly Guid[] }
  | { readonly type: 'BATCH_UPDATE'; readonly payload: Partial<IStrictAlertsState> };

// Component prop types with strict interfaces
export interface IStrictAlertItemProps {
  readonly item: IStrictAlertItem;
  readonly remove: (id: Guid) => void;
  readonly hideForever: (id: Guid) => void;
  readonly alertType: IStrictAlertType;
  readonly richMediaEnabled?: boolean;
  readonly isCarousel?: boolean;
  readonly currentIndex?: number;
  readonly totalAlerts?: number;
  readonly onNext?: () => void;
  readonly onPrevious?: () => void;
}

// Settings and configuration types
export interface IStrictSettingsData {
  readonly alertTypesJson: SafeString;
  readonly userTargetingEnabled: boolean;
  readonly notificationsEnabled: boolean;
  readonly richMediaEnabled: boolean;
}

export interface IStrictContextOptions {
  readonly graphClient: MSGraphClientV3;
  readonly siteIds: readonly Guid[];
  readonly alertTypesJson: SafeString;
  readonly userTargetingEnabled?: boolean;
  readonly notificationsEnabled?: boolean;
  readonly richMediaEnabled?: boolean;
}

// Utility type for component refs
export type ComponentRef<T> = React.RefObject<T> | ((instance: T | null) => void);

// Event types
export interface IAlertEvent {
  readonly type: string;
  readonly alertId: Guid;
  readonly timestamp: ISODateString;
  readonly userId?: SafeString;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface IUserActionEvent extends IAlertEvent {
  readonly action: 'view' | 'dismiss' | 'hide' | 'click_link' | 'quick_action';
  readonly actionData?: Readonly<Record<string, unknown>>;
}

// Performance and monitoring types
export interface IAlertPerformanceMetrics {
  readonly renderTime: number;
  readonly fetchTime: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
  readonly errorCount: number;
  readonly userInteractions: number;
  readonly timestamp: ISODateString;
}

// Export utility functions for type guards
export type AlertTypeGuard<T> = (value: unknown) => value is T;

export const isValidGuid: AlertTypeGuard<Guid> = (value): value is Guid => {
  return typeof value === 'string' &&
         /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

export const isValidUrl: AlertTypeGuard<Url> = (value): value is Url => {
  try {
    new URL(value as string);
    return true;
  } catch {
    return false;
  }
};

export const isValidEmail: AlertTypeGuard<string> = (value): value is string => {
  return typeof value === 'string' &&
         /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
};

export {};