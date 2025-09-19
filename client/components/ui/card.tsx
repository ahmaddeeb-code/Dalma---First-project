import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "hover:shadow-md",
        elevated: "shadow-lg hover:shadow-xl hover:-translate-y-1",
        interactive: "hover:shadow-xl hover:-translate-y-2 cursor-pointer active:translate-y-0 active:shadow-lg",
        glass: "bg-card/50 backdrop-blur-md border-border/50 hover:bg-card/70 hover:border-border/70",
        gradient: "bg-gradient-to-br from-card to-card/50 border-border/50 hover:from-card hover:to-card/70",
        modern: "bg-gradient-to-br from-card via-card/80 to-card/60 border-border/30 backdrop-blur-sm hover:shadow-2xl hover:-translate-y-1 hover:border-primary/20",
      },
      size: {
        default: "",
        sm: "p-3",
        lg: "p-8",
        xl: "p-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants> & {
    interactive?: boolean;
    hover?: boolean;
  }
>(({ className, variant, size, interactive, hover, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      cardVariants({ variant, size }),
      interactive && "cursor-pointer hover:shadow-xl hover:-translate-y-2 active:translate-y-0 active:shadow-lg",
      hover && "hover:shadow-lg hover:-translate-y-1",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
  }
>(({ className, gradient, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 transition-all duration-300",
      gradient && "bg-gradient-to-r from-primary/5 to-secondary/5 rounded-t-lg border-b border-border/50",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean;
    size?: "sm" | "default" | "lg" | "xl";
  }
>(({ className, gradient, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "text-lg",
    default: "text-2xl",
    lg: "text-3xl",
    xl: "text-4xl",
  };

  return (
    <h3
      ref={ref}
      className={cn(
        "font-semibold leading-none tracking-tight transition-all duration-300",
        sizeClasses[size],
        gradient && "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
        className,
      )}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    size?: "sm" | "default" | "lg";
  }
>(({ className, size = "default", ...props }, ref) => {
  const sizeClasses = {
    sm: "text-xs",
    default: "text-sm",
    lg: "text-base",
  };

  return (
    <p
      ref={ref}
      className={cn(
        "text-muted-foreground leading-relaxed",
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    noPadding?: boolean;
  }
>(({ className, noPadding, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "transition-all duration-300",
      !noPadding && "p-6 pt-0",
      className
    )} 
    {...props} 
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
  }
>(({ className, gradient, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0 transition-all duration-300",
      gradient && "bg-gradient-to-r from-accent/30 to-accent/10 rounded-b-lg border-t border-border/50 mt-4 pt-4",
      className,
    )}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Specialized Card Components
const StatsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: string | number;
    description?: string;
    icon?: React.ReactNode;
    trend?: {
      value: number;
      isPositive: boolean;
    };
    gradient?: string;
  }
>(({ className, title, value, description, icon, trend, gradient, ...props }, ref) => (
  <Card
    ref={ref}
    variant="modern"
    className={cn(
      "relative overflow-hidden group",
      gradient && `bg-gradient-to-br ${gradient}`,
      className,
    )}
    {...props}
  >
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <CardDescription className="text-xs font-medium uppercase tracking-wide">
          {title}
        </CardDescription>
        {icon && (
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
      <CardTitle className="text-3xl font-bold">
        {value}
      </CardTitle>
      {description && (
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      )}
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-medium",
          trend.isPositive ? "text-emerald-600" : "text-red-600"
        )}>
          <span>{trend.isPositive ? "↗" : "↘"}</span>
          <span>{trend.value}%</span>
        </div>
      )}
    </CardHeader>
    
    {/* Hover effect overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </Card>
));
StatsCard.displayName = "StatsCard";

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    gradient?: string;
  }
>(({ className, title, description, icon, action, gradient, ...props }, ref) => (
  <Card
    ref={ref}
    variant="modern"
    interactive
    className={cn(
      "h-full group relative overflow-hidden",
      gradient && `bg-gradient-to-br ${gradient}`,
      className,
    )}
    {...props}
  >
    <CardHeader>
      {icon && (
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 w-fit mb-4">
          <div className="text-primary">
            {icon}
          </div>
        </div>
      )}
      <CardTitle size="lg" className="mb-2">
        {title}
      </CardTitle>
      <CardDescription size="default" className="leading-relaxed">
        {description}
      </CardDescription>
    </CardHeader>
    {action && (
      <CardFooter>
        {action}
      </CardFooter>
    )}
    
    {/* Hover effect overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
  </Card>
));
FeatureCard.displayName = "FeatureCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
  FeatureCard,
  cardVariants,
};
