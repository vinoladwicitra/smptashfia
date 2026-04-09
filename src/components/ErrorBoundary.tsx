import { Component, type ReactNode } from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-background flex items-center justify-center px-5">
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <IconAlertTriangle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-text mb-3">Terjadi Kesalahan</h1>
            <p className="text-text-light mb-6">
              Maaf, terjadi kesalahan pada halaman ini. Silakan muat ulang atau kembali ke beranda.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
              >
                Muat Ulang
              </button>
              <a
                href="/"
                className="px-5 py-2.5 bg-white text-text font-semibold border border-border rounded-xl hover:border-primary hover:text-primary transition-colors"
              >
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
