import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'An unexpected frontend error occurred.',
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AjayBot frontend error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen w-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
          <div className="text-lg font-semibold">AjayBot encountered a frontend error</div>
          <p className="mt-2 text-sm text-slate-400">
            The page can usually recover with a fresh reload.
          </p>
          <div className="mt-4 rounded-xl bg-red-950/40 border border-red-500/20 p-3 text-xs text-red-200 break-words">
            {this.state.message}
          </div>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white text-sm font-semibold"
          >
            Reload AjayBot
          </button>
        </div>
      </div>
    );
  }
}
