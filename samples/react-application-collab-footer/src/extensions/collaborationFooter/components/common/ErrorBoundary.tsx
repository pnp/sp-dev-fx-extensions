import * as React from 'react';
import { Log } from '@microsoft/sp-core-library';
import { MessageBar, MessageBarType } from '@fluentui/react/lib/MessageBar';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';

const LOG_SOURCE: string = 'ErrorBoundary';

export interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactElement;
}

export interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export default class ErrorBoundary extends React.Component<IErrorBoundaryProps, IErrorBoundaryState> {
  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to SPFx logging system
    Log.error(LOG_SOURCE, error);
    Log.info(LOG_SOURCE, `Error component stack: ${errorInfo.componentStack}`);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render(): React.ReactElement {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default SharePoint-style error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{ padding: '16px', maxWidth: '600px' }}>
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={true}
          >
            <strong>Something went wrong with the collaboration footer</strong>
            <br />
            We're sorry, but there was an unexpected error. Please try refreshing the page or contact your administrator if the problem persists.
          </MessageBar>
          
          <Stack tokens={{ childrenGap: 8 }} style={{ marginTop: '12px' }}>
            <PrimaryButton
              text="Try Again"
              onClick={this.handleRetry}
              iconProps={{ iconName: 'Refresh' }}
            />
            
            {this.state.error && (
              <details style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                <summary>Technical Details (for administrators)</summary>
                <pre style={{ 
                  whiteSpace: 'pre-wrap', 
                  wordBreak: 'break-word',
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#f8f8f8',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </Stack>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}