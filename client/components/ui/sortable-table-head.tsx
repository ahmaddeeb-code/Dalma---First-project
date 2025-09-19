import React from "react";
import { TableHead } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SortDirection = "asc" | "desc" | null;

type SortableTableHeadProps = {
  children: React.ReactNode;
  sortKey?: string;
  currentSortBy?: string;
  currentSortDir?: SortDirection;
  onSort?: (key: string) => void;
  className?: string;
  sortable?: boolean;
  align?: "left" | "center" | "right";
} & Omit<React.ComponentProps<typeof TableHead>, "onClick" | "className">;

export default function SortableTableHead({
  children,
  sortKey,
  currentSortBy,
  currentSortDir,
  onSort,
  className,
  sortable = true,
  align = "left",
  ...props
}: SortableTableHeadProps) {
  const isSortable = sortable && sortKey && onSort;
  const isActive = currentSortBy === sortKey;

  const handleClick = () => {
    if (isSortable) {
      onSort(sortKey);
    }
  };

  const getSortIcon = () => {
    if (!isSortable) return null;

    if (!isActive) {
      return <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />;
    }

    return currentSortDir === "asc" ? (
      <ChevronUp className="h-3.5 w-3.5" />
    ) : (
      <ChevronDown className="h-3.5 w-3.5" />
    );
  };

  return (
    <TableHead
      className={cn(
        isSortable &&
          "cursor-pointer select-none hover:bg-accent/30 transition-colors",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
      onClick={handleClick}
      {...props}
    >
      <div
        className={cn(
          "flex items-center gap-2",
          align === "center" && "justify-center",
          align === "right" && "justify-end",
        )}
      >
        <span className="font-semibold">{children}</span>
        {getSortIcon()}
      </div>
    </TableHead>
  );
}

// Hook for managing table sorting state
export function useTableSort<T extends string>(
  defaultSortBy?: T,
  defaultSortDir: SortDirection = "asc",
) {
  const [sortBy, setSortBy] = React.useState<T | undefined>(defaultSortBy);
  const [sortDir, setSortDir] = React.useState<SortDirection>(defaultSortDir);

  const handleSort = React.useCallback(
    (key: string) => {
      if (sortBy === key) {
        // Toggle direction or clear sort
        if (sortDir === "asc") {
          setSortDir("desc");
        } else if (sortDir === "desc") {
          setSortBy(undefined);
          setSortDir(null);
        } else {
          setSortDir("asc");
        }
      } else {
        // Set new sort column
        setSortBy(key as T);
        setSortDir("asc");
      }
    },
    [sortBy, sortDir],
  );

  const sortData = React.useCallback(
    <TData extends Record<string, any>>(
      data: TData[],
      sortKey: keyof TData,
      direction: SortDirection,
      customSorter?: (a: TData, b: TData) => number,
    ): TData[] => {
      if (!direction || !sortKey) return data;

      const sorted = [...data].sort((a, b) => {
        if (customSorter) {
          return customSorter(a, b);
        }

        const aVal = a[sortKey];
        const bVal = b[sortKey];

        // Handle null/undefined values
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        // Handle different data types
        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return aVal - bVal;
        }

        if (aVal instanceof Date && bVal instanceof Date) {
          return aVal.getTime() - bVal.getTime();
        }

        // Fallback to string comparison
        return String(aVal).localeCompare(String(bVal));
      });

      return direction === "desc" ? sorted.reverse() : sorted;
    },
    [],
  );

  return {
    sortBy,
    sortDir,
    handleSort,
    sortData,
    setSortBy,
    setSortDir,
  };
}
