'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 rounded-3xl border border-rose-500/20 p-6">
            <div className="p-8 lg:p-12 flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center">
                <ShieldAlert className="w-10 h-10 text-rose-500" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-white mb-2">
                  System Failure Detected
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                  An unexpected error occurred in the safety assessment engine.
                  The application has been isolated to prevent further issues.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
                      Error Details (Dev Only)
                    </span>
                  </div>
                  <p className="text-xs font-mono text-rose-400 break-all mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="text-[10px] font-mono text-slate-500 overflow-x-auto whitespace-pre-wrap">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                  aria-label="Retry and reset the application"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry System
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-sm font-bold transition-all border border-slate-700"
                  aria-label="Return to home page"
                >
                  <Home className="w-4 h-4" />
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
