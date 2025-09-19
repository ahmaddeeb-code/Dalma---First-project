import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type TableToolbarProps = {
  className?: string;
  onAdd?: () => void;
  addLabel?: string;
  onExport?: (type: "csv" | "xlsx" | "pdf") => void;
  pageSize?: number;
  onPageSizeChange?: (n: number) => void;
  pageSizeOptions?: number[];
  children?: React.ReactNode;
  rightChildren?: React.ReactNode;
};

export default function TableToolbar({
  className,
  onAdd,
  addLabel = "Add",
  onExport,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  children,
  rightChildren,
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-3 flex-wrap mb-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {onExport ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              <DropdownMenuLabel className="text-xs">Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {["csv", "xlsx", "pdf"].map((format) => (
                <DropdownMenuItem
                  key={format}
                  onClick={() => onExport(format as "csv" | "xlsx" | "pdf")}
                  className="text-xs"
                >
                  <Download className="h-3 w-3 mr-2" />
                  {format.toUpperCase()}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}

        {children}
      </div>

      <div className="flex items-center gap-2">
        {onPageSizeChange ? (
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Page size</div>
            <select
              className="h-9 rounded-md border bg-background px-2 text-sm"
              value={String(pageSize || pageSizeOptions[0])}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {rightChildren}
        {onAdd ? (
          <Button onClick={onAdd} className="flex items-center" variant={"default"}>
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
