import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants> & {
    requiredMark?: boolean;
  };

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, children, requiredMark, ...props }, ref) => {
  const [detected, setDetected] = React.useState<boolean | undefined>(
    requiredMark,
  );

  React.useEffect(() => {
    // If requiredMark explicitly provided, respect it
    if (typeof requiredMark === "boolean") {
      setDetected(requiredMark);
      return;
    }

    // Try to detect requiredness from the associated control
    // 1. If htmlFor is provided, look for element with that id
    const htmlFor = (props as any).htmlFor as string | undefined;

    let isRequired = false;

    if (htmlFor) {
      try {
        const el = document.getElementById(htmlFor);
        if (el) {
          if ((el as HTMLInputElement).required) isRequired = true;
          if (el.getAttribute("aria-required") === "true") isRequired = true;
          if (el.hasAttribute("data-required")) isRequired = true;
        }
      } catch (e) {
        // ignore
      }
    }

    // 2. If not found, try to inspect next sibling input/select/textarea
    if (!isRequired && ref && typeof ref !== "function") {
      try {
        const root = (ref as React.RefObject<HTMLElement>).current;
        if (root && root.parentElement) {
          const next = root.nextElementSibling as HTMLElement | null;
          if (next) {
            const candidate =
              next.querySelector(
                "input[required],select[required],textarea[required]",
              ) ||
              ((next as HTMLInputElement).matches &&
                (next as HTMLInputElement).hasAttribute &&
                (next as HTMLInputElement).hasAttribute("required"))
                ? next
                : null;
            if (candidate) isRequired = true;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    setDetected(isRequired || false);
  }, [requiredMark, props]);

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {detected ? (
          <span aria-hidden className="text-red-600">
            *
          </span>
        ) : null}
      </span>
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
