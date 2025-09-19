import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MoreHorizontal, Pencil, Trash2, Eye, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export type TableAction = {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
  confirmation?: {
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
  };
};

type TableActionsProps = {
  actions: TableAction[];
  className?: string;
  maxVisibleActions?: number;
};

export default function TableActions({
  actions,
  className,
  maxVisibleActions = 3,
}: TableActionsProps) {
  const visibleActions = actions.slice(0, maxVisibleActions);
  const hiddenActions = actions.slice(maxVisibleActions);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      {/* Show individual action buttons when <= maxVisibleActions */}
      {actions.length <= maxVisibleActions ? (
        actions.map((action, index) => (
          <ActionButton key={index} action={action} />
        ))
      ) : (
        <>
          {/* Show first few actions as individual buttons */}
          {visibleActions.map((action, index) => (
            <ActionButton key={index} action={action} />
          ))}
          
          {/* Show overflow actions in dropdown */}
          {hiddenActions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>More actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {hiddenActions.map((action, index) => (
                  <ActionMenuItem key={index} action={action} />
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </>
      )}
    </div>
  );
}

function ActionButton({ action }: { action: TableAction }) {
  const buttonContent = (
    <Button
      size="sm"
      variant="ghost"
      className="h-8 w-8 p-0 hover:bg-accent"
      onClick={action.onClick}
      disabled={action.disabled}
    >
      {action.icon || <Pencil className="h-4 w-4" />}
    </Button>
  );

  if (action.confirmation) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {buttonContent}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action.confirmation.title}</AlertDialogTitle>
            {action.confirmation.description && (
              <p className="text-sm text-muted-foreground">
                {action.confirmation.description}
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {action.confirmation.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={action.onClick}>
              {action.confirmation.confirmText || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return buttonContent;
}

function ActionMenuItem({ action }: { action: TableAction }) {
  const menuItem = (
    <DropdownMenuItem
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        action.variant === "destructive" && "text-destructive focus:text-destructive"
      )}
      onSelect={action.confirmation ? (e) => e.preventDefault() : undefined}
    >
      {action.icon && <span className="mr-2">{action.icon}</span>}
      {action.label}
    </DropdownMenuItem>
  );

  if (action.confirmation) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {menuItem}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action.confirmation.title}</AlertDialogTitle>
            {action.confirmation.description && (
              <p className="text-sm text-muted-foreground">
                {action.confirmation.description}
              </p>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {action.confirmation.cancelText || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={action.onClick}>
              {action.confirmation.confirmText || "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return menuItem;
}

// Common action creators for consistency
export const createEditAction = (onClick: () => void): TableAction => ({
  label: "Edit",
  icon: <Pencil className="h-4 w-4" />,
  onClick,
});

export const createDeleteAction = (
  onClick: () => void,
  confirmTitle = "Confirm delete",
  confirmDescription?: string
): TableAction => ({
  label: "Delete",
  icon: <Trash2 className="h-4 w-4" />,
  onClick,
  variant: "destructive",
  confirmation: {
    title: confirmTitle,
    description: confirmDescription,
    confirmText: "Delete",
  },
});

export const createViewAction = (onClick: () => void): TableAction => ({
  label: "View",
  icon: <Eye className="h-4 w-4" />,
  onClick,
});

export const createCopyAction = (onClick: () => void): TableAction => ({
  label: "Duplicate",
  icon: <Copy className="h-4 w-4" />,
  onClick,
});
