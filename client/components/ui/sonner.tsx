import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background/95 group-[.toaster]:backdrop-blur-lg group-[.toaster]:text-foreground group-[.toaster]:border-border/50 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-xl group-[.toaster]:animate-fade-in-scale",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:hover:bg-primary/90 group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:hover:scale-105",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:hover:bg-muted/80 group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:hover:scale-105",
          closeButton:
            "group-[.toast]:bg-muted/50 group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-muted group-[.toast]:rounded-full group-[.toast]:transition-all group-[.toast]:duration-200 group-[.toast]:hover:scale-110",
          success:
            "group-[.toast]:bg-emerald-50 group-[.toast]:text-emerald-900 group-[.toast]:border-emerald-200/50 dark:group-[.toast]:bg-emerald-950/50 dark:group-[.toast]:text-emerald-100 dark:group-[.toast]:border-emerald-800/50",
          error:
            "group-[.toast]:bg-red-50 group-[.toast]:text-red-900 group-[.toast]:border-red-200/50 dark:group-[.toast]:bg-red-950/50 dark:group-[.toast]:text-red-100 dark:group-[.toast]:border-red-800/50",
          warning:
            "group-[.toast]:bg-amber-50 group-[.toast]:text-amber-900 group-[.toast]:border-amber-200/50 dark:group-[.toast]:bg-amber-950/50 dark:group-[.toast]:text-amber-100 dark:group-[.toast]:border-amber-800/50",
          info:
            "group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 group-[.toast]:border-blue-200/50 dark:group-[.toast]:bg-blue-950/50 dark:group-[.toast]:text-blue-100 dark:group-[.toast]:border-blue-800/50",
        },
        style: {
          backdropFilter: 'blur(12px)',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
