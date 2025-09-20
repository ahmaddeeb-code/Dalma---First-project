import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import SortableTableHead, { useTableSort } from "@/components/ui/sortable-table-head";
import { cn } from "@/lib/utils";

export type TableV2Column = {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  render?: (row: Record<string, any>) => React.ReactNode;
};

export type TableV2QueryParams = {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
};

export type QueryParamMapping = {
  page?: string;
  perPage?: string;
  sortBy?: string;
  sortDir?: string;
  search?: string;
};

export type TableV2Props = {
  title?: string;
  columns: TableV2Column[];
  rows?: Record<string, any>[];
  rowKey?: (row: Record<string, any>, index: number) => string | number;
  paginationEnabled?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  sortable?: boolean;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  serverSide?: boolean;
  queryParamMapping?: QueryParamMapping;
  onRowClick?: (row: Record<string, any>) => void;
  onAction?: (action: string, row: Record<string, any>) => void;
  fetcher?: (params: Required<TableV2QueryParams>) => Promise<{ rows: Record<string, any>[]; total: number }>;
  searchable?: boolean;
  className?: string;
};

const defaultMapping: Required<QueryParamMapping> = {
  page: "page",
  perPage: "per_page",
  sortBy: "sort_by",
  sortDir: "sort_dir",
  search: "search",
};

export default function TableV2({
  title,
  columns,
  rows: initialRows = [],
  rowKey = (r, i) => (r && (r.id ?? r.key)) ?? i,
  paginationEnabled = true,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  sortable = true,
  defaultSort,
  serverSide = false,
  queryParamMapping = defaultMapping,
  onRowClick,
  fetcher,
  searchable = true,
  className,
}: TableV2Props) {
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(pageSize);
  const [total, setTotal] = React.useState(initialRows.length);
  const { sortBy, sortDir, handleSort, sortData, setSortBy, setSortDir } = useTableSort<string>(defaultSort?.key, defaultSort?.dir ?? "asc");

  // debounce search
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // server-side fetch
  const [serverRows, setServerRows] = React.useState<Record<string, any>[]>(initialRows);
  React.useEffect(() => {
    if (!serverSide) return;
    const params: Required<TableV2QueryParams> = {
      page,
      perPage,
      sortBy: sortBy || "",
      sortDir: (sortDir as any) || "asc",
      search: debounced,
    } as any;
    if (!fetcher) return;
    fetcher(params).then((res) => {
      setServerRows(res.rows);
      setTotal(res.total);
    });
  }, [serverSide, page, perPage, sortBy, sortDir, debounced, fetcher]);

  // client-side plumbing
  const filtered = React.useMemo(() => {
    const base = serverSide ? serverRows : initialRows;
    if (!debounced) return base;
    const q = debounced.toLowerCase();
    return base.filter((r) => Object.values(r).some((v) => String(v ?? "").toLowerCase().includes(q)));
  }, [debounced, initialRows, serverRows, serverSide]);

  const sorted = React.useMemo(() => {
    if (!sortable || !sortBy || serverSide) return filtered;
    return sortData(filtered, sortBy as any, sortDir);
  }, [filtered, sortable, sortBy, sortDir, serverSide, sortData]);

  const paged = React.useMemo(() => {
    if (!paginationEnabled || serverSide) return sorted;
    const start = (page - 1) * perPage;
    return sorted.slice(start, start + perPage);
  }, [sorted, paginationEnabled, serverSide, page, perPage]);

  React.useEffect(() => {
    if (serverSide) return;
    setTotal(filtered.length);
  }, [filtered, serverSide]);

  React.useEffect(() => {
    // reset page when page size or query changes
    setPage(1);
  }, [perPage, debounced, sortBy, sortDir]);

  React.useEffect(() => {
    if (defaultSort?.key) {
      setSortBy(defaultSort.key as any);
      setSortDir(defaultSort.dir);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / perPage));

  return (
    <Card className={cn("w-full", className)}>
      {title ? (
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="text-lg font-semibold">{title}</div>
            {searchable && (
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="max-w-xs"
              />
            )}
          </div>
        </CardHeader>
      ) : null}
      <CardContent>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              <TableRow className="border-b">
                {columns.map((c) => (
                  <SortableTableHead
                    key={c.key}
                    sortKey={c.sortable ? c.key : undefined}
                    currentSortBy={sortBy}
                    currentSortDir={sortDir as any}
                    onSort={sortable ? handleSort : undefined}
                    className={cn("text-foreground", c.width ? undefined : undefined)}
                  >
                    {c.label}
                  </SortableTableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((row, idx) => (
                <TableRow key={rowKey(row, idx)} className="md:hover:bg-accent/40" onClick={onRowClick ? () => onRowClick(row) : undefined}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      {c.render ? c.render(row) : (row as any)[c.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center text-muted-foreground">
                    No data
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {paginationEnabled && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {total === 0 ? (
                <span>0–0 of 0 items</span>
              ) : (
                <span>
                  {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} of {total} items
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Page size</span>
                <select
                  className="h-9 rounded-md border bg-background px-2 text-sm"
                  value={String(perPage)}
                  onChange={(e) => setPerPage(Number(e.target.value))}
                >
                  {pageSizeOptions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.max(1, p - 1));
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={page === i + 1}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(i + 1);
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage((p) => Math.min(pageCount, p + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
