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
}: TableToolbarProps) {
  return (
    <div
      className={cn(
        "w-full flex items-center justify-between gap-3 flex-wrap mb-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 flex-wrap">
        {onAdd ? (
          <Button onClick={onAdd} className="flex items-center" variant={"default"}>
            <Plus className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        ) : null}

        {onExport ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onExport("csv")}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button
              onClick={() => onExport("xlsx")}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> XLSX
            </Button>
            <Button
              onClick={() => onExport("pdf")}
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> PDF
            </Button>
          </div>
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
      </div>
    </div>
  );
}
