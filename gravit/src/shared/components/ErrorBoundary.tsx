import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <Card className="text-center py-8">
          <p className="text-danger font-medium mb-2">משהו השתבש</p>
          <p className="text-text-secondary text-sm mb-4">
            {this.state.error?.message || 'שגיאה לא צפויה'}
          </p>
          <Button
            variant="secondary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            נסה שוב
          </Button>
        </Card>
      );
    }
    return this.props.children;
  }
}
