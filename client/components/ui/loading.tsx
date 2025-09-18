import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current border-r-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-3",
        xl: "h-12 w-12 border-4",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
        white: "text-white",
        gradient: "bg-gradient-to-r from-primary to-secondary rounded-full",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, variant, ...props }, ref) => {
    if (variant === "gradient") {
      return (
        <div
          ref={ref}
          className={cn(
            "animate-spin rounded-full",
            size === "sm" && "h-4 w-4",
            size === "default" && "h-6 w-6",
            size === "lg" && "h-8 w-8",
            size === "xl" && "h-12 w-12",
            className,
          )}
          {...props}
        >
          <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant }), className)}
        {...props}
      />
    );
  },
);
Spinner.displayName = "Spinner";

// Dots Loading Animation
interface DotsSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

const DotsSpinner = React.forwardRef<HTMLDivElement, DotsSpinnerProps>(
  ({ size = "default", className }, ref) => {
    const sizeClasses = {
      sm: "h-1 w-1",
      default: "h-2 w-2",
      lg: "h-3 w-3",
    };

    return (
      <div ref={ref} className={cn("flex items-center gap-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-current animate-pulse",
              sizeClasses[size],
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    );
  },
);
DotsSpinner.displayName = "DotsSpinner";

// Pulse Loading Animation
interface PulseSpinnerProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

const PulseSpinner = React.forwardRef<HTMLDivElement, PulseSpinnerProps>(
  ({ size = "default", className }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
    };

    return (
      <div ref={ref} className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-0 rounded-full bg-primary/40 animate-ping animation-delay-200" />
        <div className="absolute inset-0 rounded-full bg-primary" />
      </div>
    );
  },
);
PulseSpinner.displayName = "PulseSpinner";

// Loading Skeleton Component
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "modern";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-md",
          variant === "default" && "animate-pulse bg-muted",
          variant === "modern" && "skeleton-modern bg-gradient-to-r from-muted via-muted/50 to-muted",
          className,
        )}
        {...props}
      />
    );
  },
);
Skeleton.displayName = "Skeleton";

// Full Page Loading Component
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  variant?: "default" | "gradient" | "pulse";
  className?: string;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  ({ visible, message, variant = "default", className }, ref) => {
    if (!visible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-background/80 backdrop-blur-sm",
          "animate-fade-in-scale",
          className,
        )}
      >
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl border border-border/50">
          {variant === "default" && <Spinner size="xl" />}
          {variant === "gradient" && <Spinner size="xl" variant="gradient" />}
          {variant === "pulse" && <PulseSpinner size="lg" />}
          
          {message && (
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  },
);
LoadingOverlay.displayName = "LoadingOverlay";

// Loading Button State
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ loading = false, loadingText, children, disabled, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          loading && "cursor-not-allowed opacity-70",
          className,
        )}
        {...props}
      >
        <span className={cn("flex items-center gap-2", loading && "opacity-0")}>
          {children}
        </span>
        
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center gap-2">
            <Spinner size="sm" variant="white" />
            {loadingText && (
              <span className="text-sm">{loadingText}</span>
            )}
          </span>
        )}
      </button>
    );
  },
);
LoadingButton.displayName = "LoadingButton";

// Progress Bar Component
interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: "default" | "gradient" | "animated";
  size?: "sm" | "default" | "lg";
  showValue?: boolean;
  className?: string;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, variant = "default", size = "default", showValue = false, className }, ref) => {
    const percentage = Math.min(Math.max(value, 0), max);
    const widthPercentage = (percentage / max) * 100;

    const sizeClasses = {
      sm: "h-1",
      default: "h-2",
      lg: "h-3",
    };

    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className={cn(
          "w-full rounded-full bg-muted overflow-hidden",
          sizeClasses[size],
        )}>
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              variant === "default" && "bg-primary",
              variant === "gradient" && "bg-gradient-to-r from-primary to-secondary",
              variant === "animated" && "bg-gradient-to-r from-primary to-secondary animate-pulse",
            )}
            style={{ width: `${widthPercentage}%` }}
          />
        </div>
        {showValue && (
          <div className="mt-1 text-xs text-muted-foreground text-center">
            {percentage}%
          </div>
        )}
      </div>
    );
  },
);
ProgressBar.displayName = "ProgressBar";

export {
  Spinner,
  DotsSpinner,
  PulseSpinner,
  Skeleton,
  LoadingOverlay,
  LoadingButton,
  ProgressBar,
  spinnerVariants,
};
