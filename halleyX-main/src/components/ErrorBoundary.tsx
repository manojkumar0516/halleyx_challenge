import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="flex justify-center mb-4">
              <div className="bg-rose-100 p-4 rounded-full">
                <AlertCircle className="w-8 h-8 text-rose-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Oops! Something went wrong</h1>
            <p className="text-slate-600 text-center mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="mb-6 text-sm text-slate-500 bg-slate-50 p-3 rounded">
              <summary className="cursor-pointer font-medium">Error details</summary>
              <pre className="mt-2 overflow-auto text-xs whitespace-pre-wrap break-words">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
