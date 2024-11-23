import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4 space-y-4">
          <p className="text-red-400">Something went wrong:</p>
          <pre className="text-sm text-red-300">{this.state.error?.message}</pre>
          <Button 
            onClick={() => this.setState({ hasError: false, error: null })}
            variant="outline"
            className="border-[#2a2a2a] hover:bg-[#222222]"
          >
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
