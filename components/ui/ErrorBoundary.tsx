"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-10 border-2 border-dashed border-red-200 rounded-3xl bg-red-50/50 text-center space-y-4">
          <span className="text-4xl">🛠️</span>
          <h3 className="font-black text-red-600">خطا در بارگذاری این بخش</h3>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="text-xs font-bold text-red-500 underline"
          >
            تلاش مجدد
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
