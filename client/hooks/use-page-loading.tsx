import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Route-change hook kept for potential future effects (analytics, focus restore)
// but intentionally does NOT trigger global overlays to avoid double loading.
export function usePageLoading(enabled: boolean = true) {
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;
    // No global overlay or spinner here. Pages should render their own
    // section-level skeletons if they fetch data.
  }, [location.pathname, enabled]);

  return null;
}

export function withPageLoading<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function PageLoadingWrapper(props: P) {
    usePageLoading();
    return <Component {...props} />;
  };
}
