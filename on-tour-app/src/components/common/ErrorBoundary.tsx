import React from 'react';

type Props = {
  fallback?: React.ReactNode | ((error: Error) => React.ReactNode);
  onReset?: () => void;
  children: React.ReactNode;
};

type State = { hasError: boolean; error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return (fallback as any)(this.state.error);
      return (
        <div role="alert" className="p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-xs">
          {fallback || <span>Something went wrong.</span>}
          <div className="mt-2">
            <button className="px-2 py-1 text-[11px] rounded bg-white/10 hover:bg-white/20" onClick={this.reset}>Retry</button>
          </div>
        </div>
      );
    }
    return this.props.children as any;
  }
}

export default ErrorBoundary;
