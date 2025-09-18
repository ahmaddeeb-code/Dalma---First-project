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
import { getLocale } from "@/i18n";
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
import { Filter, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";

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

  const total = users.filter((u) => u.active !== false).length;
  const doctors = users.filter((u) => u.roleIds.includes("r_doctor")).length;
  const therapists = users.filter((u) => u.roleIds.includes("r_therapist")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {ar ? "إدارة الموظفين" : "Employee Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {ar
              ? "إضافة الموظفين وتعيين الأدوار والصلاحيات (مثل الأطباء والمعالجين)"
              : "Add employees and assign roles & privileges (e.g., Doctors, Therapists)"}
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 ml-1" /> {ar ? "إضافة موظف" : "Add Employee"}
          </Button>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "إجمالي" : "Total"}</CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "الأطباء" : "Doctors"}</CardDescription>
            <CardTitle className="text-2xl">{doctors}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "المعالجون" : "Therapists"}</CardDescription>
            <CardTitle className="text-2xl">{therapists}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> {ar ? "الفلاتر" : "Filters"}
            </CardTitle>
            <CardDescription>
              {ar ? "بحث وتصنيف حسب الدور" : "Search and filter by role"}
            </CardDescription>
          </div>
          {!canManage && (
            <Badge variant="secondary" className="text-xs">
              <ShieldCheck className="h-3 w-3 ml-1" />
              {ar ? "صلاحية القراءة فقط" : "Read-only access"}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Label>{ar ? "بحث" : "Search"}</Label>
            <div className="relative">
              <Search
                className="absolute top-2.5 text-muted-foreground"
                style={{ [ar ? "right" : "left"]: "0.5rem" }}
              />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className={ar ? "pr-8" : "pl-8"}
                placeholder={ar ? "اسم، بريد، قسم..." : "Name, email, department..."}
              />
            </div>
          </div>
          <div>
            <Label>{ar ? "الدور" : "Role"}</Label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="all">{ar ? "الكل" : "All"}</option>
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
          <CardTitle>{ar ? "الموظفون" : "Employees"}</CardTitle>
          <CardDescription>
            {ar ? "انقر تعديل لتحديث الأدوار والصلاحيات" : "Click edit to update roles and privileges"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ar ? "الاسم" : "Name"}</TableHead>
                <TableHead>{ar ? "البريد" : "Email"}</TableHead>
                <TableHead>{ar ? "القسم/المسمى" : "Department/Title"}</TableHead>
                <TableHead>{ar ? "الأدوار" : "Roles"}</TableHead>
                <TableHead>{ar ? "الصلاحيات" : "Privileges"}</TableHead>
                {canManage && <TableHead className="text-center">{ar ? "إجراءات" : "Actions"}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {(u.department || "").toString()} {u.title ? `• ${u.title}` : ""}
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
                        <Button size="sm" variant="secondary" onClick={() => setEditing(u)}>
                          {ar ? "تعديل" : "Edit"}
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
                                {ar ? "حذف الموظف؟" : "Delete employee?"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {ar
                                  ? "سيتم حذف هذا المستخدم من النظام."
                                  : "This user will be removed from the system."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{ar ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => {
                                  removeUser(u.id);
                                  toast.success(ar ? "تم الحذف" : "Deleted");
                                }}
                              >
                                {ar ? "حذف" : "Delete"}
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
