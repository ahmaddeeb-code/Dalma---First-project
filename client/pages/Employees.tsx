import { useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getLocale, t } from "@/i18n";
import {
  User,
  Role,
  Privilege,
  loadACL,
  subscribeACL,
  listRoles,
  listPrivileges,
  effectivePrivileges,
  removeUser,
} from "@/store/acl";
import { getCurrentUser } from "@/store/auth";
import { toast } from "sonner";
import AddEditEmployeeDialog from "@/pages/employees/AddEditDialog";
import {
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Download,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { exportAll, type ColumnDef } from "@/lib/export";

function useACLUsers() {
  return useSyncExternalStore(
    (cb) => subscribeACL(cb),
    () => loadACL().users,
    () => loadACL().users,
  );
}

export default function Employees() {
  const users = useACLUsers();
  const roles = listRoles();
  const privileges = listPrivileges();
  const me = useMemo(() => getCurrentUser(), []);
  const ar = getLocale() === "ar";
  const canManage = useMemo(() => {
    if (!me) return false;
    const acl = loadACL();
    return effectivePrivileges(me, acl.roles, acl.privileges).some(
      (p) => p.id === "p_manage_users",
    );
  }, [me]);

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const s = searchText.trim().toLowerCase();
    return users
      .filter((u) => u.active !== false)
      .filter((u) =>
        roleFilter === "all" ? true : u.roleIds.includes(roleFilter),
      )
      .filter((u) => {
        if (!s) return true;
        const hay = [u.name, u.email, u.title, u.department]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, searchText, roleFilter]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const total = users.filter((u) => u.active !== false).length;
  const doctors = users.filter((u) => u.roleIds.includes("r_doctor")).length;
  const therapists = users.filter((u) =>
    u.roleIds.includes("r_therapist"),
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("pages.employees.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("pages.employees.desc")}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 ml-1" /> {t("pages.employees.addEmployee")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("common.total")}</CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("common.doctors")}</CardDescription>
            <CardTitle className="text-2xl">{doctors}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{t("common.therapists")}</CardDescription>
            <CardTitle className="text-2xl">{therapists}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> {t("common.filters")}
            </CardTitle>
            <CardDescription>{t("common.search")}</CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Label className="text-xs">{t("common.pageSize")}</Label>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 ml-1" /> {t("common.export")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("common.format")}</DropdownMenuLabel>
                {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                  <DropdownMenuItem
                    key={fmt}
                    onClick={() => {
                      const cols: ColumnDef<User>[] = [
                        {
                          header: t("common.name") as string,
                          accessor: (r) => r.name,
                        },
                        {
                          header: t("common.email") as string,
                          accessor: (r) => r.email || "",
                        },
                        {
                          header: t("common.departmentTitle") as string,
                          accessor: (r) =>
                            `${r.department || ""} ${r.title ? `• ${r.title}` : ""}`,
                        },
                      ];
                      exportAll(filtered, cols, fmt, `employees_${fmt}`);
                    }}
                  >
                    {t("common.filtered")} – {fmt.toUpperCase()}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                  <DropdownMenuItem
                    key={fmt}
                    onClick={() => {
                      const cols: ColumnDef<User>[] = [
                        {
                          header: t("common.name") as string,
                          accessor: (r) => r.name,
                        },
                        {
                          header: t("common.email") as string,
                          accessor: (r) => r.email || "",
                        },
                        {
                          header: t("common.departmentTitle") as string,
                          accessor: (r) =>
                            `${r.department || ""} ${r.title ? `• ${r.title}` : ""}`,
                        },
                      ];
                      exportAll(users, cols, fmt, `employees_${fmt}`);
                    }}
                  >
                    {t("common.fullDataset")} – {fmt.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {!canManage && (
              <Badge variant="secondary" className="text-xs">
                <ShieldCheck className="h-3 w-3 ml-1" />
                {t("common.readOnly")}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label>{t("common.search")}</Label>
            <div className="relative">
              <Search
                className="absolute top-2.5 text-muted-foreground"
                style={{ [ar ? "right" : "left"]: "0.5rem" }}
              />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className={ar ? "pr-8" : "pl-8"}
                placeholder={t("pages.employees.filters.searchPlaceholder")}
              />
            </div>
          </div>
          <div>
            <Label>{t("common.role")}</Label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">{t("common.all")}</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("pages.employees.table.title")}</CardTitle>
          <CardDescription>{t("pages.employees.table.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>{t("common.email")}</TableHead>
                  <TableHead>{t("common.departmentTitle")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("common.roles")}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("common.privileges")}
                  </TableHead>
                  {canManage && (
                    <TableHead className="text-center">
                      {t("common.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {(u.department || "").toString()}{" "}
                        {u.title ? `• ${u.title}` : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.roleIds.map((rid) => {
                          const r = roles.find((x) => x.id === rid);
                          return (
                            <Badge key={rid} variant="secondary">
                              {r ? r.name : rid}
                            </Badge>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {u.privilegeIds.map((pid) => {
                          const p = privileges.find((x) => x.id === pid);
                          return <Badge key={pid}>{p ? p.name : pid}</Badge>;
                        })}
                      </div>
                    </TableCell>
                    {canManage && (
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditing(u)}
                          >
                            {t("common.edit")}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("pages.employees.confirmDeleteTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("pages.employees.confirmDeleteMsg")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    removeUser(u.id);
                                    toast.success(t("pages.employees.deleted"));
                                  }}
                                >
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
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
                <PaginationItem>
                  <span className="px-3 py-2 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <AddEditEmployeeDialog open={addOpen} onOpenChange={setAddOpen} />
      <AddEditEmployeeDialog
        open={!!editing}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          else setEditing(editing);
        }}
        user={editing}
      />
    </div>
  );
}
