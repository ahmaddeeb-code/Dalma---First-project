import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 hover:scale-105 active:scale-100",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 active:scale-100",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 hover:scale-105 active:scale-100",
        outline: 
          "text-foreground border-border hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-100",
        success:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105 active:scale-100",
        warning:
          "border-transparent bg-amber-500 text-white hover:bg-amber-600 hover:scale-105 active:scale-100",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-100",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-secondary text-white hover:from-primary-light hover:to-secondary-light hover:scale-105 active:scale-100 shadow-md hover:shadow-lg",
        glass:
          "bg-white/10 backdrop-blur-md border-white/20 text-foreground hover:bg-white/20 hover:scale-105 active:scale-100",
        modern:
          "border-transparent bg-gradient-to-r from-primary/90 to-secondary/90 text-white hover:from-primary hover:to-secondary hover:scale-105 active:scale-100 shadow-sm hover:shadow-md backdrop-blur-sm",
        pulse:
          "border-transparent bg-primary text-primary-foreground animate-pulse hover:animate-none hover:bg-primary/80 hover:scale-105 active:scale-100",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs rounded-md",
        lg: "px-3 py-1 text-sm rounded-lg",
        xl: "px-4 py-2 text-base rounded-xl font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
  animate?: boolean;
  glow?: boolean;
}

function Badge({ 
  className, 
  variant, 
  size, 
  icon, 
  animate = false, 
  glow = false,
  children,
  ...props 
}: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        animate && "animate-bounce",
        glow && "shadow-lg shadow-primary/25",
        className
      )} 
      {...props}
    >
      {icon && (
        <span className="mr-1 -ml-0.5">
          {icon}
        </span>
      )}
      {children}
      
      {/* Shimmer effect for gradient variants */}
      {(variant === "gradient" || variant === "modern") && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full transition-transform duration-700 group-hover:translate-x-full" />
      )}
    </div>
  );
}

// Specialized Badge Components
const StatusBadge = React.forwardRef<
  HTMLDivElement,
  BadgeProps & {
    status: "online" | "offline" | "away" | "busy";
  }
>(({ status, className, ...props }, ref) => {
  const statusConfig = {
    online: { variant: "success" as const, text: "Online", dot: "bg-emerald-500" },
    offline: { variant: "secondary" as const, text: "Offline", dot: "bg-gray-500" },
    away: { variant: "warning" as const, text: "Away", dot: "bg-amber-500" },
    busy: { variant: "destructive" as const, text: "Busy", dot: "bg-red-500" },
  };

  const config = statusConfig[status];

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      className={cn("gap-1.5", className)}
      {...props}
    >
      <div className={cn("w-2 h-2 rounded-full animate-pulse", config.dot)} />
      {config.text}
    </Badge>
  );
});
StatusBadge.displayName = "StatusBadge";

const CountBadge = React.forwardRef<
  HTMLDivElement,
  BadgeProps & {
    count: number;
    max?: number;
    showZero?: boolean;
  }
>(({ count, max = 99, showZero = false, className, ...props }, ref) => {
  if (count === 0 && !showZero) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge
      ref={ref}
      variant="destructive"
      size="sm"
      className={cn(
        "absolute -top-2 -right-2 min-w-[1.25rem] h-5 flex items-center justify-center p-0 rounded-full text-xs font-bold animate-pulse",
        className
      )}
      {...props}
    >
      {displayCount}
    </Badge>
  );
});
CountBadge.displayName = "CountBadge";

const TrendBadge = React.forwardRef<
  HTMLDivElement,
  BadgeProps & {
    trend: "up" | "down" | "neutral";
    value?: string | number;
  }
>(({ trend, value, className, ...props }, ref) => {
  const trendConfig = {
    up: { 
      variant: "success" as const, 
      icon: "↗", 
      className: "text-emerald-600 bg-emerald-50 border-emerald-200" 
    },
    down: { 
      variant: "destructive" as const, 
      icon: "↘", 
      className: "text-red-600 bg-red-50 border-red-200" 
    },
    neutral: { 
      variant: "secondary" as const, 
      icon: "→", 
      className: "text-gray-600 bg-gray-50 border-gray-200" 
    },
  };

  const config = trendConfig[trend];

  return (
    <Badge
      ref={ref}
      variant="outline"
      className={cn("gap-1", config.className, className)}
      {...props}
    >
      <span className="text-xs">{config.icon}</span>
      {value && <span>{value}</span>}
    </Badge>
  );
});
TrendBadge.displayName = "TrendBadge";

const PriorityBadge = React.forwardRef<
  HTMLDivElement,
  BadgeProps & {
    priority: "low" | "medium" | "high" | "urgent";
  }
>(({ priority, className, ...props }, ref) => {
  const priorityConfig = {
    low: { variant: "outline" as const, text: "Low", className: "text-gray-600 border-gray-300" },
    medium: { variant: "warning" as const, text: "Medium", className: "" },
    high: { variant: "destructive" as const, text: "High", className: "" },
    urgent: { variant: "gradient" as const, text: "Urgent", className: "animate-pulse" },
  };

  const config = priorityConfig[priority];

  return (
    <Badge
      ref={ref}
      variant={config.variant}
      className={cn(config.className, className)}
      glow={priority === "urgent"}
      {...props}
    >
      {config.text}
    </Badge>
  );
});
PriorityBadge.displayName = "PriorityBadge";

export { 
  Badge, 
  StatusBadge, 
  CountBadge, 
  TrendBadge, 
  PriorityBadge, 
  badgeVariants 
};
