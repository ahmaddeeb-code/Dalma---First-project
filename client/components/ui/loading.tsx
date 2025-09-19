import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
  type?: 'default' | 'page' | 'form' | 'api';
}

interface LoadingContextType {
  loading: LoadingState;
  showLoading: (message?: string, type?: LoadingState['type']) => void;
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
    message: undefined,
    type: 'default'
  });

  const showLoading = (message?: string, type: LoadingState['type'] = 'default') => {
    setLoadingState({
      isLoading: true,
      message,
      type
    });
  };

  const hideLoading = () => {
    setLoadingState({
      isLoading: false,
      message: undefined,
      type: 'default'
    });
  };

  const setLoading = (state: LoadingState) => {
    setLoadingState(state);
  };

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
