import * as React from "react";
import { cn } from "@/lib/utils";

// Ripple Effect Hook
export function useRipple() {
  const createRipple = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      z-index: 1000;
    `;

    // Add CSS animation if not already added
    if (!document.querySelector('#ripple-styles')) {
      const style = document.createElement('style');
      style.id = 'ripple-styles';
      style.textContent = `
        @keyframes ripple-animation {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  }, []);

  return createRipple;
}

// Interactive Container with Ripple Effect
interface RippleContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  disabled?: boolean;
}

export const RippleContainer = React.forwardRef<HTMLDivElement, RippleContainerProps>(
  ({ children, disabled = false, className, onClick, ...props }, ref) => {
    const createRipple = useRipple();

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (!disabled) {
        createRipple(event);
        onClick?.(event);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  },
);
RippleContainer.displayName = "RippleContainer";

// Floating Action Button with Animations
interface FloatingActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label?: string;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "sm" | "default" | "lg";
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ icon, label, position = "bottom-right", size = "default", className, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const positionClasses = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "top-right": "top-6 right-6",
      "top-left": "top-6 left-6",
    };

    const sizeClasses = {
      sm: "h-12 w-12",
      default: "h-14 w-14",
      lg: "h-16 w-16",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "fixed z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300",
          "bg-gradient-to-r from-primary to-secondary text-white",
          "hover:scale-110 active:scale-95",
          "focus:outline-none focus:ring-4 focus:ring-primary/30",
          positionClasses[position],
          sizeClasses[size],
          className,
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <span className="flex items-center justify-center">
          {icon}
        </span>
        
        {label && (
          <span
            className={cn(
              "absolute right-full mr-3 whitespace-nowrap",
              "bg-gray-900 text-white text-sm px-3 py-1 rounded-lg",
              "transition-all duration-200 pointer-events-none",
              "before:absolute before:left-full before:top-1/2 before:-translate-y-1/2",
              "before:border-4 before:border-transparent before:border-l-gray-900",
              isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2",
            )}
          >
            {label}
          </span>
        )}
      </button>
    );
  },
);
FloatingActionButton.displayName = "FloatingActionButton";

// Magnetic Effect Component
interface MagneticProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  strength?: number;
}

export const Magnetic = React.forwardRef<HTMLDivElement, MagneticProps>(
  ({ children, strength = 0.3, className, ...props }, ref) => {
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => elementRef.current!);

    const handleMouseMove = (e: React.MouseEvent) => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleMouseLeave = () => {
      const element = elementRef.current;
      if (!element) return;

      element.style.transform = 'translate(0px, 0px)';
    };

    return (
      <div
        ref={elementRef}
        className={cn("transition-transform duration-200 ease-out", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Magnetic.displayName = "Magnetic";

// Tilt Effect Component
interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  tiltMaxAngle?: number;
  perspective?: number;
}

export const Tilt = React.forwardRef<HTMLDivElement, TiltProps>(
  ({ children, tiltMaxAngle = 15, perspective = 1000, className, ...props }, ref) => {
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => elementRef.current!);

    const handleMouseMove = (e: React.MouseEvent) => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * tiltMaxAngle;
      const rotateY = ((centerX - x) / centerX) * tiltMaxAngle;

      element.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleMouseLeave = () => {
      const element = elementRef.current;
      if (!element) return;

      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    };

    return (
      <div
        ref={elementRef}
        className={cn("transition-transform duration-300 ease-out", className)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Tilt.displayName = "Tilt";

// Parallax Scroll Effect
interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  speed?: number;
  offset?: number;
}

export const Parallax = React.forwardRef<HTMLDivElement, ParallaxProps>(
  ({ children, speed = 0.5, offset = 0, className, ...props }, ref) => {
    const elementRef = React.useRef<HTMLDivElement>(null);

    React.useImperativeHandle(ref, () => elementRef.current!);

    React.useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleScroll = () => {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * speed;
        element.style.transform = `translateY(${parallax + offset}px)`;
      };

      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, [speed, offset]);

    return (
      <div
        ref={elementRef}
        className={cn("transition-transform duration-100 ease-out", className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Parallax.displayName = "Parallax";

// Intersection Observer Animation
interface AnimateOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: "fade-in" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "scale-in" | "rotate-in";
  delay?: number;
  threshold?: number;
}

export const AnimateOnScroll = React.forwardRef<HTMLDivElement, AnimateOnScrollProps>(
  ({ children, animation = "fade-in", delay = 0, threshold = 0.1, className, ...props }, ref) => {
    const elementRef = React.useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = React.useState(false);

    React.useImperativeHandle(ref, () => elementRef.current!);

    React.useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => setIsVisible(true), delay);
          }
        },
        { threshold }
      );

      observer.observe(element);
      return () => observer.disconnect();
    }, [delay, threshold]);

    const animationClasses = {
      "fade-in": isVisible ? "opacity-100" : "opacity-0",
      "slide-up": isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      "slide-down": isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0",
      "slide-left": isVisible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0",
      "slide-right": isVisible ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0",
      "scale-in": isVisible ? "scale-100 opacity-100" : "scale-75 opacity-0",
      "rotate-in": isVisible ? "rotate-0 opacity-100" : "rotate-12 opacity-0",
    };

    return (
      <div
        ref={elementRef}
        className={cn(
          "transition-all duration-700 ease-out",
          animationClasses[animation],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AnimateOnScroll.displayName = "AnimateOnScroll";

// Stagger Animation Container
interface StaggerContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  staggerDelay?: number;
}

export const StaggerContainer = React.forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, staggerDelay = 100, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);

    return (
      <div ref={ref} className={cn(className)} {...props}>
        {childrenArray.map((child, index) => (
          <div
            key={index}
            className="animate-fade-in-scale"
            style={{
              animationDelay: `${index * staggerDelay}ms`,
              animationFillMode: 'both',
            }}
          >
            {child}
          </div>
        ))}
      </div>
    );
  },
);
StaggerContainer.displayName = "StaggerContainer";

export {
  useRipple,
};
