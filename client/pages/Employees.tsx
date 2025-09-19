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
import { getCurrentUser, setUserPassword } from "@/store/auth";
import { updateUser } from "@/store/acl";
import { toast } from "sonner";
import AddEditEmployeeDialog from "@/pages/employees/AddEditDialog";
import ManagePrivilegesDialog from "@/pages/employees/ManagePrivilegesDialog";
import {
  Filter,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Download,
  Edit3,
  Eye,
  Key,
  UserCheck,
  UserX,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Users,
  Stethoscope,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { exportAll, type ColumnDef } from "@/lib/export";
import TableToolbar from "@/components/ui/table-toolbar";
import { listDepartments } from "@/store/departments";

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
  const departments = listDepartments();
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
  const [privUserId, setPrivUserId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | "all">("all");
  const [departmentFilter, setDepartmentFilter] = useState<string | "all">("all");
  const [loginFilter, setLoginFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [privilegeFilter, setPrivilegeFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"name" | "department" | "joinedAt">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function handleSort(column: "name" | "department" | "joinedAt") {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  }

  function getSortIcon(column: "name" | "department" | "joinedAt") {
    if (sortBy !== column) return <ChevronsUpDown className="h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  const filtered = useMemo(() => {
    const s = searchText.trim().toLowerCase();
    const acl = loadACL();
    const withFilters = users
      .filter((u) => (roleFilter === "all" ? true : u.roleIds.includes(roleFilter)))
      .filter((u) => (departmentFilter === "all" ? true : (u.department || "") === departmentFilter))
      .filter((u) =>
        loginFilter === "all"
          ? true
          : loginFilter === "enabled"
            ? u.loginEnabled !== false
            : u.loginEnabled === false,
      )
      .filter((u) =>
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? u.active !== false
            : u.active === false,
      )
      .filter((u) => {
        if (privilegeFilter === "all") return true;
        const eff = effectivePrivileges(u, acl.roles, acl.privileges);
        return eff.some((p) => p.id === privilegeFilter);
      })
      .filter((u) => {
        if (!s) return true;
        const statusText = u.active === false ? "inactive" : "active";
        const loginText = u.loginEnabled === false ? "disabled" : "enabled";
        const arName = (u.nameArParts || []).join(" ");
        const enName = (u.nameEnParts || []).join(" ");
        const hay = [
          u.name,
          enName,
          arName,
          u.email,
          u.title,
          u.titleAbbrev,
          u.department,
          statusText,
          loginText,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      });

    const cmp = (a: User, b: User) => {
      let res = 0;
      if (sortBy === "name") {
        res = (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "department") {
        res = (a.department || "").localeCompare(b.department || "");
      } else if (sortBy === "joinedAt") {
        const da = a.joinedAt ? +new Date(a.joinedAt) : 0;
        const db = b.joinedAt ? +new Date(b.joinedAt) : 0;
        res = da - db;
      }
      return sortDir === "asc" ? res : -res;
    };

    return withFilters.sort(cmp);
  }, [users, searchText, roleFilter, departmentFilter, loginFilter, privilegeFilter, statusFilter, sortBy, sortDir]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const total = users.filter((u) => u.active !== false).length;
  const doctors = users.filter((u) => u.roleIds.includes("r_doctor")).length;
  const therapists = users.filter((u) => u.roleIds.includes("r_therapist")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("pages.employees.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("pages.employees.desc")}</p>
        </div>
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-3">
        <Card className="relative overflow-hidden border-0 text-white bg-gradient-to-r from-blue-500 to-indigo-500">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-white/90">{t("common.total")}</CardDescription>
                <CardTitle className="text-xl">{total}</CardTitle>
              </div>
              <div className="bg-white/20 rounded-full p-2">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="relative overflow-hidden border-0 text-white bg-gradient-to-r from-emerald-500 to-teal-500">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-white/90">{t("common.doctors")}</CardDescription>
                <CardTitle className="text-xl">{doctors}</CardTitle>
              </div>
              <div className="bg-white/20 rounded-full p-2">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>
          </CardHeader>
        </Card>
        <Card className="relative overflow-hidden border-0 text-white bg-gradient-to-r from-purple-500 to-pink-500">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div>
                <CardDescription className="text-white/90">{t("common.therapists")}</CardDescription>
                <CardTitle className="text-xl">{therapists}</CardTitle>
              </div>
              <div className="bg-white/20 rounded-full p-2">
                <Activity className="h-5 w-5" />
              </div>
            </div>
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
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label>{t("common.search")}</Label>
            <div className="relative">
              <Search className="absolute top-2.5 text-muted-foreground" style={{ [ar ? "right" : "left"]: "0.5rem" }} />
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
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>{ar ? "القسم" : "Department"}</Label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">{t("common.all")}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>{ar ? "تسجيل الدخول" : "Login"}</Label>
            <select
              value={loginFilter}
              onChange={(e) => setLoginFilter(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">{t("common.all")}</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div>
            <Label>{ar ? "الصلاحية" : "Privilege"}</Label>
            <select
              value={privilegeFilter}
              onChange={(e) => setPrivilegeFilter(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">{t("common.all")}</option>
              {privileges.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>{ar ? "الحالة" : "Status"}</Label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">{t("common.all")}</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <Label>{ar ? "ترتيب حسب" : "Sort by"}</Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="name">{t("common.name")}</option>
              <option value="department">{ar ? "القسم" : "Department"}</option>
              <option value="joinedAt">{ar ? "تاريخ الالتحاق" : "Date of Joining"}</option>
            </select>
          </div>
          <div>
            <Label>{ar ? "الاتجاه" : "Direction"}</Label>
            <select
              value={sortDir}
              onChange={(e) => setSortDir(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{t("pages.employees.table.title")}</CardTitle>
          <CardDescription className="text-muted-foreground">{t("pages.employees.table.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="w-full">
              <div className="mb-3">
                <TableToolbar
                  onAdd={() => setAddOpen(true)}
                  addLabel={t("pages.employees.addEmployee")}
                  onExport={async (type) => {
                    const cols = [
                      { header: "Name", accessor: (r: any) => r.name },
                      { header: "Email", accessor: (r: any) => r.email },
                      { header: "Department", accessor: (r: any) => r.department },
                      { header: "Roles", accessor: (r: any) => (r.roleIds || []).join(", ") },
                    ];
                    await import("@/lib/export").then((m) => m.exportAll(pageItems, cols, type, "employees"));
                  }}
                  pageSize={pageSize}
                  onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
                />
              </div>
            </div>
            <div className="w-full overflow-x-auto">
              <div className="rounded-lg border border-border/50 bg-background/30">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/50">
                      <TableHead
                        className="cursor-pointer select-none hover:bg-accent/30 transition-colors font-semibold"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          {t("common.name")}
                          {getSortIcon("name")}
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold">{t("common.email")}</TableHead>
                      <TableHead
                        className="cursor-pointer select-none hover:bg-accent/30 transition-colors font-semibold"
                        onClick={() => handleSort("department")}
                      >
                        <div className="flex items-center gap-2">
                          {ar ? "القسم" : "Department"}
                          {getSortIcon("department")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="hidden md:table-cell cursor-pointer select-none hover:bg-accent/30 transition-colors font-semibold"
                        onClick={() => handleSort("joinedAt")}
                      >
                        <div className="flex items-center gap-2">
                          {ar ? "تاريخ الالتحاق" : "Joined"}
                          {getSortIcon("joinedAt")}
                        </div>
                      </TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">{t("common.roles")}</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">Login</TableHead>
                      <TableHead className="hidden md:table-cell font-semibold">Default Password</TableHead>
                      {canManage && (
                        <TableHead className="text-center font-semibold w-[140px]">{t("common.actions")}</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageItems.map((u, index) => (
                      <TableRow
                        key={u.id}
                        className={`hover:bg-accent/50 transition-colors border-border/40 ${
                          index % 2 === 0 ? 'bg-background/50' : 'bg-muted/20'
                        }`}
                      >
                        <TableCell className="font-medium py-3">
                          <div className="flex items-center gap-2">
                            {u.title ? <Badge variant="secondary" className="text-xs">{u.title}</Badge> : null}
                            <span>{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">{u.email}</TableCell>
                        <TableCell className="py-3">
                          <div className="text-sm">{(u.department || "").toString()}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3">
                          {u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell className="py-3">
                          <div className="flex flex-wrap gap-1">
                            {u.roleIds.map((rid) => {
                              const r = roles.find((x) => x.id === rid);
                              return (
                                <Badge key={rid} variant="secondary" className="text-xs">{r ? r.name : rid}</Badge>
                              );
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3">
                          <Badge variant={u.loginEnabled === false ? "destructive" : "default"} className="text-xs">
                            {u.loginEnabled === false ? "Disabled" : "Enabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell py-3">
                          <span className="font-mono text-xs bg-muted px-2 py-1 rounded">{u.defaultPassword || "-"}</span>
                        </TableCell>
                        {canManage && (
                          <TableCell className="text-center py-3">
                            <div className="flex items-center justify-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-accent"
                                    onClick={() => setEditing(u)}
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit Employee</TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 hover:bg-accent"
                                    onClick={() => setPrivUserId(u.id)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Manage Privileges</TooltipContent>
                              </Tooltip>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={async () => {
                                      const pwd = Math.random().toString(36).slice(2, 10);
                                      setUserPassword(u.id, pwd);
                                      updateUser(u.id, { defaultPassword: pwd, loginEnabled: true, mustChangePassword: true });
                                      try {
                                        const r = await fetch("/api/auth/admin/set-password", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ identifier: u.email, password: pwd, mustChangePassword: true }),
                                        });
                                        const d = await r.json();
                                        if (!d.ok) throw new Error(d.error || "Server error");
                                        toast.success("Account generated / password set");
                                      } catch (e: any) {
                                        toast.error("Server password update failed");
                                      }
                                    }}
                                  >
                                    <Key className="mr-2 h-4 w-4" />
                                    {u.password ? "Reset Password" : "Generate Account"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      const next = !(u.loginEnabled === false);
                                      updateUser(u.id, { loginEnabled: !next });
                                    }}
                                  >
                                    {u.loginEnabled === false ? (
                                      <>
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Enable Login
                                      </>
                                    ) : (
                                      <>
                                        <UserX className="mr-2 h-4 w-4" />
                                        Disable Login
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem
                                        className="text-destructive focus:text-destructive"
                                        onSelect={(e) => e.preventDefault()}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Employee
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>{t("pages.employees.confirmDeleteTitle")}</AlertDialogTitle>
                                        <AlertDialogDescription>{t("pages.employees.confirmDeleteMsg")}</AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
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
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TooltipProvider>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 py-2 text-sm text-muted-foreground">{page} / {totalPages}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }} />
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
      <ManagePrivilegesDialog userId={privUserId} open={!!privUserId} onOpenChange={(v) => !v && setPrivUserId(null)} />
    </div>
  );
}
