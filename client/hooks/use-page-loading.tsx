import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/components/ui/loading';

export function usePageLoading(enabled: boolean = true) {
  const location = useLocation();
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Show loading when route starts changing (with 500ms delay for page transitions)
    showLoading('Loading page...', 'page', 500);

    // Hide loading after a short delay to allow page to render
    const timer = setTimeout(() => {
      hideLoading();
    }, 800);

    return () => {
      clearTimeout(timer);
      hideLoading();
    };
  }, [location.pathname, enabled, showLoading, hideLoading]);

  return null;
}

// Higher-order component to wrap routes with page loading
export function withPageLoading<P extends object>(Component: React.ComponentType<P>) {
  return function PageLoadingWrapper(props: P) {
    usePageLoading();
    return <Component {...props} />;
  };
}
