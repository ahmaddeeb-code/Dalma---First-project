import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  isVisible: boolean;
  message?: string;
  type?: 'default' | 'page' | 'form' | 'api';
}

interface LoadingContextType {
  loading: LoadingState;
  showLoading: (message?: string, type?: LoadingState['type'], delay?: number) => void;
  hideLoading: () => void;
  setLoading: (state: LoadingState) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loading, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    isVisible: false,
    message: undefined,
    type: 'default'
  });

  const delayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showLoading = useCallback((message?: string, type: LoadingState['type'] = 'default', delay: number = 400) => {
    // Clear any existing timers
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
    }
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    // Set loading state immediately but don't show spinner yet
    setLoadingState({
      isLoading: true,
      isVisible: false,
      message,
      type
    });

    // Start delay timer to show spinner only if operation takes longer than threshold
    delayTimerRef.current = setTimeout(() => {
      setLoadingState(prev => ({
        ...prev,
        isVisible: prev.isLoading // Only show if still loading
      }));
    }, delay);
  }, []);

  const hideLoading = useCallback(() => {
    // Clear delay timer if still pending
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }

    // Set loading to false immediately
    setLoadingState(prev => ({
      ...prev,
      isLoading: false
    }));

    // If spinner is visible, hide it with a small delay for smooth transition
    setLoadingState(prev => {
      if (prev.isVisible) {
        // Clear any existing hide timer
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
        }

        // Hide after a brief moment to ensure smooth fade-out
        hideTimerRef.current = setTimeout(() => {
          setLoadingState(current => ({
            isLoading: false,
            isVisible: false,
            message: undefined,
            type: 'default'
          }));
        }, 100);

        return prev;
      } else {
        // If not visible, hide immediately
        return {
          isLoading: false,
          isVisible: false,
          message: undefined,
          type: 'default'
        };
      }
    });
  }, []);

  const setLoading = useCallback((state: LoadingState) => {
    setLoadingState(state);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading, showLoading, hideLoading, setLoading }}>
      {children}
      <LoadingOverlay />
    </LoadingContext.Provider>
  );
}

// Loading Spinner Component
export function LoadingSpinner({ size = 'default', className = '' }: { size?: 'small' | 'default' | 'large', className?: string }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <div className="relative w-full h-full">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-pulse"></div>
        {/* Spinning ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-purple-600 animate-spin"></div>
        {/* Inner dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

// Loading Overlay Component
function LoadingOverlay() {
  const { loading } = useLoading();

  if (!loading.isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/50 flex flex-col items-center space-y-4 animate-in zoom-in-95 duration-300">
        <LoadingSpinner size="large" />
        
        {loading.message && (
          <div className="text-center">
            <p className="text-lg font-medium text-slate-800">{loading.message}</p>
            <p className="text-sm text-slate-600 mt-1">Please wait...</p>
          </div>
        )}
        
        {!loading.message && (
          <div className="text-center">
            <p className="text-lg font-medium text-slate-800">Loading</p>
            <p className="text-sm text-slate-600 mt-1">Please wait...</p>
          </div>
        )}

        {/* Animated dots */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-cyan-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Utility hook for API calls
export function useLoadingApi() {
  const { showLoading, hideLoading } = useLoading();

  const withLoading = async <T,>(
    apiCall: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      showLoading(message || 'Processing...', 'api');
      const result = await apiCall();
      return result;
    } finally {
      hideLoading();
    }
  };

  return { withLoading };
}

// Utility hook for form submissions
export function useLoadingForm() {
  const { showLoading, hideLoading } = useLoading();

  const withFormLoading = async <T,>(
    formSubmit: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      showLoading(message || 'Saving...', 'form');
      const result = await formSubmit();
      return result;
    } finally {
      hideLoading();
    }
  };

  return { withFormLoading };
}

export default LoadingProvider;
