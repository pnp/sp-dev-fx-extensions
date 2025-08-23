import * as React from 'react';
import { Component, ReactNode } from 'react';
import { Log } from '@microsoft/sp-core-library';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { DefaultButton } from '@fluentui/react/lib/Button';

const LOG_SOURCE = 'ErrorBoundary';

interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
  customMessage?: string;
}

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

/**
 * Enhanced error boundary with better error handling and recovery options
 */
export class ErrorBoundary extends Component<IErrorBoundaryProps, IErrorBoundaryState> {
  private readonly maxRetries = 3;

  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<IErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ error, errorInfo });

    // Log error details
    Log.error(LOG_SOURCE, error);
    
    // Log additional context information separately
    Log.info(LOG_SOURCE, `Error boundary caught error. Component stack: ${errorInfo.componentStack}. Retry count: ${this.state.retryCount}`);

    // Call custom error handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        Log.error(LOG_SOURCE, handlerError as Error);
      }
    }
  }

  private handleRetry = (): void => {
    if (this.state.retryCount < this.maxRetries) {
      Log.info(LOG_SOURCE, `Retrying component render (attempt ${this.state.retryCount + 1})`);
      this.setState({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: this.state.retryCount + 1
      });
    }
  };

  private renderErrorDetails = (): ReactNode => {
    const { error, errorInfo } = this.state;
    
    // Only show detailed error info in debug mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (!isDevelopment) {
      return null;
    }

    return (
      <details style={{ marginTop: '10px', fontSize: '12px', color: '#605e5c' }}>
        <summary style={{ cursor: 'pointer', marginBottom: '5px' }}>
          Technical Details (Development Mode)
        </summary>
        {error && (
          <div style={{ marginBottom: '10px' }}>
            <strong>Error:</strong>
            <pre style={{ background: '#f3f2f1', padding: '5px', borderRadius: '2px', overflow: 'auto' }}>
              {error.toString()}
            </pre>
          </div>
        )}
        {errorInfo?.componentStack && (
          <div>
            <strong>Component Stack:</strong>
            <pre style={{ background: '#f3f2f1', padding: '5px', borderRadius: '2px', overflow: 'auto' }}>
              {errorInfo.componentStack}
            </pre>
          </div>
        )}
      </details>
    );
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.props.showRetry !== false && this.state.retryCount < this.maxRetries;
      const message = this.props.customMessage || 
        'Something went wrong with this part of the collaboration footer. Please try refreshing the page.';

      return (
        <div style={{ margin: '10px', maxWidth: '100%' }}>
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={true}
            actions={
              canRetry ? (
                <DefaultButton
                  onClick={this.handleRetry}
                  text={`Retry (${this.maxRetries - this.state.retryCount} attempts left)`}
                  style={{ marginLeft: '10px' }}
                />
              ) : undefined
            }
          >
            {message}
          </MessageBar>
          {this.renderErrorDetails()}
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<IErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

export default ErrorBoundary;