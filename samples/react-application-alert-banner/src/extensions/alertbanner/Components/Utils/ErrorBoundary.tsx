import * as React from 'react';
import { logger } from '../Services/LoggerService';
import { Text, Button, MessageBar } from '@fluentui/react-components';
import { ErrorCircle24Regular, ArrowClockwise24Regular } from '@fluentui/react-icons';
import styles from './ErrorBoundary.module.scss';

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorId?: string;
}

interface IErrorBoundaryProps {
  children: React.ReactNode;
  componentName?: string;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * Production-ready Error Boundary component
 * Catches JavaScript errors anywhere in the child component tree
 */
export class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const componentName = this.props.componentName || 'Unknown Component';
    
    // Log the error with full context
    logger.error(componentName, 'React component error boundary caught an error', error, {
      errorInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: componentName,
        retryCount: this.retryCount,
        timestamp: new Date().toISOString()
      },
      props: this.sanitizeProps(this.props),
      state: this.state
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        logger.error(componentName, 'Error in custom error handler', handlerError);
      }
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    });
  }

  /**
   * Sanitize props to remove sensitive data before logging
   */
  private sanitizeProps(props: IErrorBoundaryProps): any {
    const { children, onError, ...safeProps } = props;
    return {
      ...safeProps,
      hasChildren: !!children,
      hasOnError: !!onError
    };
  }

  /**
   * Reset error state and retry rendering
   */
  private handleRetry = (): void => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const componentName = this.props.componentName || 'Unknown Component';
      
      logger.info(componentName, `Retrying component render (attempt ${this.retryCount}/${this.maxRetries})`);
      
      this.setState({
        hasError: false
      });
    } else {
      logger.warn(this.props.componentName || 'Unknown Component', 'Maximum retry attempts reached');
    }
  };

  /**
   * Reset retry count (called when component successfully renders)
   */
  private resetRetryCount(): void {
    if (this.retryCount > 0) {
      this.retryCount = 0;
    }
  }

  /**
   * Copy error details to clipboard for support
   */
  private handleCopyErrorDetails = async (): Promise<void> => {
    try {
      const errorDetails = {
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        component: this.props.componentName || 'Unknown Component',
        message: this.state.error?.message,
        stack: this.state.error?.stack,
        componentStack: this.state.errorInfo?.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      logger.info('ErrorBoundary', 'Error details copied to clipboard');
    } catch (clipboardError) {
      logger.warn('ErrorBoundary', 'Failed to copy error details to clipboard', clipboardError);
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent 
            error={this.state.error!} 
            reset={this.handleRetry} 
          />
        );
      }

      // Default error UI
      const canRetry = this.retryCount < this.maxRetries;
      const componentName = this.props.componentName || 'Component';

      return (
        <div className={styles.errorContainer}>
          <MessageBar intent="error">
            <div className={styles.errorHeader}>
              <ErrorCircle24Regular />
              <Text weight="semibold">
                Something went wrong in {componentName}
              </Text>
            </div>
          </MessageBar>

          <div className={styles.errorMessage}>
            <Text size={300} className={styles.errorMessageText}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
          </div>

          {/* Error ID for support */}
          <div className={styles.errorId}>
            <Text size={200} className={styles.errorIdText}>
              Error ID: {this.state.errorId}
            </Text>
          </div>

          {/* Action buttons */}
          <div className={styles.errorActions}>
            {canRetry && (
              <Button 
                appearance="primary"
                icon={<ArrowClockwise24Regular />}
                onClick={this.handleRetry}
              >
                Try Again ({this.maxRetries - this.retryCount} attempts left)
              </Button>
            )}

            <Button 
              appearance="secondary"
              onClick={this.handleCopyErrorDetails}
            >
              Copy Error Details
            </Button>

            <Button 
              appearance="secondary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>

          {/* Development-only error details */}
          {process.env.NODE_ENV === 'development' && (
            <details className={styles.errorDetails}>
              <summary className={styles.errorDetailsSummary}>
                Development Error Details
              </summary>
              <pre className={styles.errorDetailsCode}>
                {this.state.error?.stack}
              </pre>
              {this.state.errorInfo?.componentStack && (
                <pre className={styles.errorDetailsCode}>
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </details>
          )}
        </div>
      );
    }

    // Reset retry count on successful render
    this.resetRetryCount();

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<IErrorBoundaryProps, 'children'>
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;