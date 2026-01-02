import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell flex min-h-screen items-center justify-center bg-slate-950 text-center text-slate-100">
          <div className="panel max-w-lg border border-rose-500/30 bg-rose-950/30 px-6 py-8">
            <h2 className="text-2xl font-semibold text-rose-200">Something went wrong.</h2>
            <p className="mt-2 text-sm text-slate-200">
              Please refresh the page to reload the arena. If this keeps happening, capture the
              console output in development mode.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
