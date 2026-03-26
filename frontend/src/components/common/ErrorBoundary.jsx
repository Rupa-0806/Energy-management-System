import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log to error tracking service (e.g., Sentry)
    if (window.errorTracker) {
      window.errorTracker.captureException(error, {
        contexts: { react: errorInfo },
      });
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-sm text-red-700 dark:text-red-200 mb-4">
                    An unexpected error occurred. The error has been logged and our team will look into it.
                  </p>

                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <details className="mt-4 bg-red-100 dark:bg-red-900/30 rounded p-3 text-xs text-red-800 dark:text-red-200">
                      <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                      <pre className="overflow-auto max-h-40 whitespace-pre-wrap break-words">
                        {this.state.error.toString()}
                        {'\n\n'}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={this.resetError}
                      className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = '/';
                      }}
                      className="flex-1 px-4 py-2 bg-red-200 dark:bg-red-800 hover:bg-red-300 dark:hover:bg-red-700 text-red-900 dark:text-red-100 rounded-lg text-sm font-medium transition"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
