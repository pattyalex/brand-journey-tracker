
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.log("Error caught by ErrorBoundary:", error);
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error);
    console.error("Error info:", errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="mb-2 text-gray-700">
              The application encountered an error. Please try one of the following options:
            </p>
            <div className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40 mb-4">
              <strong>Error:</strong> {this.state.error?.message || "Unknown error"}
              {this.state.error?.stack && (
                <pre className="mt-2 text-xs overflow-x-auto">
                  {this.state.error.stack}
                </pre>
              )}
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Reload Page
              </Button>
              <Button 
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/landing';
                }}
                className="w-full bg-gray-600 hover:bg-gray-700"
              >
                Reset & Go to Landing
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
