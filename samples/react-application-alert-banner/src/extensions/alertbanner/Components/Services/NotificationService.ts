import { ApplicationCustomizerContext } from '@microsoft/sp-application-base';
import { logger } from './LoggerService';

export enum NotificationType {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Info = 'info'
}

export interface INotificationAction {
  text: string;
  onClick: () => void;
}

export interface INotificationOptions {
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number; // in milliseconds, 0 for persistent
  actions?: INotificationAction[];
  dismissible?: boolean;
}

/**
 * Service for displaying user-friendly notifications instead of browser alerts
 */
export class NotificationService {
  private static instance: NotificationService;
  private context: ApplicationCustomizerContext;

  constructor(context: ApplicationCustomizerContext) {
    this.context = context;
  }

  public static getInstance(context?: ApplicationCustomizerContext): NotificationService {
    if (!NotificationService.instance && context) {
      NotificationService.instance = new NotificationService(context);
    }
    return NotificationService.instance;
  }

  /**
   * Show a success notification
   */
  public showSuccess(message: string, title?: string, actions?: INotificationAction[]): void {
    this.showNotification({
      type: NotificationType.Success,
      title: title || 'Success',
      message,
      duration: 5000,
      actions,
      dismissible: true
    });
  }

  /**
   * Show a warning notification
   */
  public showWarning(message: string, title?: string, actions?: INotificationAction[]): void {
    this.showNotification({
      type: NotificationType.Warning,
      title: title || 'Warning',
      message,
      duration: 8000,
      actions,
      dismissible: true
    });
  }

  /**
   * Show an error notification
   */
  public showError(message: string, title?: string, actions?: INotificationAction[]): void {
    this.showNotification({
      type: NotificationType.Error,
      title: title || 'Error',
      message,
      duration: 0, // Persistent
      actions,
      dismissible: true
    });
  }

  /**
   * Show an info notification
   */
  public showInfo(message: string, title?: string, actions?: INotificationAction[]): void {
    this.showNotification({
      type: NotificationType.Info,
      title: title || 'Information',
      message,
      duration: 6000,
      actions,
      dismissible: true
    });
  }

  /**
   * Show a notification with full options
   */
  private showNotification(options: INotificationOptions): void {
    try {
      // Use custom notification system for better control
      this.showCustomNotification(options);
    } catch (error) {
      logger.error('NotificationService', 'Failed to show notification, falling back to console', error);
      logger.info('NotificationService', `[${options.type.toUpperCase()}] ${options.title}: ${options.message}`);
      
      // Ultimate fallback to alert (only for critical errors)
      if (options.type === NotificationType.Error) {
        alert(`${options.title}: ${options.message}`);
      }
    }
  }

  /**
   * Show custom notification using DOM manipulation
   */
  private showCustomNotification(options: INotificationOptions): void {
    const container = this.getOrCreateNotificationContainer();
    const notification = this.createNotificationElement(options);
    
    container.appendChild(notification);

    // Auto-dismiss if duration is set
    if (options.duration && options.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, options.duration);
    }

    // Add click handlers for actions
    if (options.actions) {
      options.actions.forEach((action, index) => {
        const actionButton = notification.querySelector(`[data-action="${index}"]`);
        if (actionButton) {
          actionButton.addEventListener('click', () => {
            action.onClick();
            this.removeNotification(notification);
          });
        }
      });
    }

    // Add dismiss handler
    if (options.dismissible) {
      const dismissButton = notification.querySelector('[data-dismiss]');
      if (dismissButton) {
        dismissButton.addEventListener('click', () => {
          this.removeNotification(notification);
        });
      }
    }
  }

  /**
   * Get or create the notification container
   */
  private getOrCreateNotificationContainer(): HTMLElement {
    let container = document.getElementById('alert-banner-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'alert-banner-notifications';
      container.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
      `;
      document.body.appendChild(container);
    }
    return container;
  }

  /**
   * Create notification DOM element
   */
  private createNotificationElement(options: INotificationOptions): HTMLElement {
    const notification = document.createElement('div');
    notification.style.cssText = `
      background: ${this.getBackgroundColor(options.type)};
      color: ${this.getTextColor(options.type)};
      border-left: 4px solid ${this.getBorderColor(options.type)};
      border-radius: 6px;
      padding: 16px;
      margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      pointer-events: auto;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px;
      animation: slideInRight 0.3s ease-out;
    `;

    const icon = this.getIcon(options.type);
    const actionsHtml = options.actions 
      ? options.actions.map((action, index) => 
          `<button data-action="${index}" style="background: transparent; border: 1px solid currentColor; color: inherit; padding: 4px 12px; border-radius: 4px; margin-left: 8px; cursor: pointer; font-size: 12px;">${action.text}</button>`
        ).join('')
      : '';

    const dismissButton = options.dismissible 
      ? `<button data-dismiss style="position: absolute; top: 8px; right: 8px; background: transparent; border: none; color: inherit; cursor: pointer; font-size: 16px; opacity: 0.7;">&times;</button>`
      : '';

    notification.innerHTML = `
      <div style="position: relative;">
        ${dismissButton}
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span style="font-size: 16px; flex-shrink: 0;">${icon}</span>
          <div style="flex: 1;">
            ${options.title ? `<div style="font-weight: 600; margin-bottom: 4px;">${options.title}</div>` : ''}
            <div style="line-height: 1.4;">${options.message}</div>
            ${actionsHtml ? `<div style="margin-top: 8px;">${actionsHtml}</div>` : ''}
          </div>
        </div>
      </div>
    `;

    // Add animation styles to head if not already present
    this.addAnimationStyles();

    return notification;
  }

  /**
   * Remove notification element
   */
  private removeNotification(notification: HTMLElement): void {
    notification.style.animation = 'slideOutRight 0.3s ease-in';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Get background color for notification type
   */
  private getBackgroundColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success:
        return '#dff6dd';
      case NotificationType.Warning:
        return '#fff4ce';
      case NotificationType.Error:
        return '#fde7e9';
      case NotificationType.Info:
      default:
        return '#deecf9';
    }
  }

  /**
   * Get text color for notification type
   */
  private getTextColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success:
        return '#107c10';
      case NotificationType.Warning:
        return '#797673';
      case NotificationType.Error:
        return '#a4262c';
      case NotificationType.Info:
      default:
        return '#323130';
    }
  }

  /**
   * Get border color for notification type
   */
  private getBorderColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success:
        return '#107c10';
      case NotificationType.Warning:
        return '#ffb900';
      case NotificationType.Error:
        return '#d13438';
      case NotificationType.Info:
      default:
        return '#0078d4';
    }
  }

  /**
   * Get icon for notification type
   */
  private getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.Success:
        return '✅';
      case NotificationType.Warning:
        return '⚠️';
      case NotificationType.Error:
        return '❌';
      case NotificationType.Info:
      default:
        return 'ℹ️';
    }
  }

  /**
   * Add CSS animations to document head
   */
  private addAnimationStyles(): void {
    if (document.getElementById('alert-banner-notification-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'alert-banner-notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Clear all notifications
   */
  public clearAll(): void {
    const container = document.getElementById('alert-banner-notifications');
    if (container) {
      container.innerHTML = '';
    }
  }
}