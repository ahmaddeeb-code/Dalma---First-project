import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import TableToolbar from "@/components/ui/table-toolbar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  effectivePrivileges,
  loadACL,
  removeById,
  saveACL,
  uid,
  upsert,
  type ACLState,
  type Privilege,
  type Role,
  type User,
} from "@/store/acl";
import { Pencil, Plus, Trash2, MoreHorizontal, ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { t } from "@/i18n";

export default function AccessControl() {
  const ar = document.documentElement.getAttribute("dir") === "rtl";
  const [state, setState] = useState<ACLState>(() => loadACL());
  useEffect(() => saveACL(state), [state]);

  const usage = useMemo(() => computeUsage(state), [state]);

  // Sorting states and helpers
  const [userSortBy, setUserSortBy] = useState<"name" | "email" | "roles">("name");
  const [userSortDir, setUserSortDir] = useState<"asc" | "desc">("asc");
  const [roleSortBy, setRoleSortBy] = useState<"name" | "users" | "privs">("name");
  const [roleSortDir, setRoleSortDir] = useState<"asc" | "desc">("asc");
  const [privSortBy, setPrivSortBy] = useState<"name" | "category" | "usedInRoles" | "usedInUsers">("name");
  const [privSortDir, setPrivSortDir] = useState<"asc" | "desc">("asc");

  function sortToggle(currentBy: string, setBy: (v: any) => void, currentDir: "asc"|"desc", setDir: (v: any) => void, next: any) {
    if (currentBy === next) setDir(currentDir === "asc" ? "desc" : "asc");
    else { setBy(next); setDir("asc"); }
  }
  function getSortIcon(active: boolean, dir: "asc"|"desc") {
    if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-50" />;
    return dir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  }

  const usersSorted = useMemo(() => {
    const arr = [...state.users];
    arr.sort((a, b) => {
      let res = 0;
      if (userSortBy === "name") res = (a.name||"").localeCompare(b.name||"");
      else if (userSortBy === "email") res = (a.email||"").localeCompare(b.email||"");
      else if (userSortBy === "roles") res = (a.roleIds.length)-(b.roleIds.length);
      return userSortDir === "asc" ? res : -res;
    });
    return arr;
  }, [state.users, userSortBy, userSortDir]);

  const rolesSorted = useMemo(() => {
    const arr = [...state.roles];
    arr.sort((a, b) => {
      let res = 0;
      if (roleSortBy === "name") res = (a.name||"").localeCompare(b.name||"");
      else if (roleSortBy === "users") res = (usage.roleUsers[a.id]||0) - (usage.roleUsers[b.id]||0);
      else if (roleSortBy === "privs") res = a.privilegeIds.length - b.privilegeIds.length;
      return roleSortDir === "asc" ? res : -res;
    });
    return arr;
  }, [state.roles, roleSortBy, roleSortDir, usage.roleUsers]);

  const privsSorted = useMemo(() => {
    const arr = [...state.privileges];
    arr.sort((a, b) => {
      let res = 0;
      if (privSortBy === "name") res = (a.name||"").localeCompare(b.name||"");
      else if (privSortBy === "category") res = (a.category||"").localeCompare(b.category||"");
      else if (privSortBy === "usedInRoles") res = (usage.privRoles[a.id]||0) - (usage.privRoles[b.id]||0);
      else if (privSortBy === "usedInUsers") res = (usage.privUsers[a.id]||0) - (usage.privUsers[b.id]||0);
      return privSortDir === "asc" ? res : -res;
    });
    return arr;
  }, [state.privileges, privSortBy, privSortDir, usage.privRoles, usage.privUsers]);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("pages.accessControl.title")}
          </h1>
          <p className="text-muted-foreground">
            {t("pages.accessControl.subtitle")}
          </p>
        </div>
      </header>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">
            {t("pages.accessControl.tabs.users")}
          </TabsTrigger>
          <TabsTrigger value="roles">
            {t("pages.accessControl.tabs.roles")}
          </TabsTrigger>
          <TabsTrigger value="privileges">
            {t("pages.accessControl.tabs.privs")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("pages.accessControl.users.title")}</CardTitle>
                <CardDescription>
                  {t("pages.accessControl.users.desc")}
                </CardDescription>
              </div>
              </CardHeader>
            <CardContent>
              <div className="mb-3">
                <TableToolbar
                  onAdd={undefined}
                  onExport={(type) => {
                    const cols = [
                      { header: t("pages.accessControl.users.headers.name") as string, accessor: (r: any) => r.name },
                      { header: t("pages.accessControl.users.headers.email") as string, accessor: (r: any) => r.email },
                      { header: t("pages.accessControl.users.headers.roles") as string, accessor: (r: any) => r.roleIds.length },
                    ];
                    import("@/lib/export").then((m) => m.exportAll(state.users, cols, type, "users"));
                  }}
                  rightChildren={
                    <div className="flex items-center gap-2">
                      <UserDialog
                        onSubmit={(u) =>
                          setState((s) => ({ ...s, users: upsert(s.users, u) }))
                        }
                        roles={state.roles}
                        privileges={state.privileges}
                      />
                    </div>
                  }
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(userSortBy, setUserSortBy, userSortDir, setUserSortDir, "name")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.users.headers.name")}
                        {getSortIcon(userSortBy === "name", userSortDir)}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(userSortBy, setUserSortBy, userSortDir, setUserSortDir, "email")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.users.headers.email")}
                        {getSortIcon(userSortBy === "email", userSortDir)}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(userSortBy, setUserSortBy, userSortDir, setUserSortDir, "roles")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.users.headers.roles")}
                        {getSortIcon(userSortBy === "roles", userSortDir)}
                      </div>
                    </TableHead>
                    <TableHead>
                      {t("pages.accessControl.users.headers.effectivePrivs")}
                    </TableHead>
                    <TableHead className="w-[120px]">
                      {t("pages.accessControl.users.headers.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersSorted.map((u) => {
                    const eff = effectivePrivileges(
                      u,
                      state.roles,
                      state.privileges,
                    );
                    return (
                      <TableRow key={u.id}>
                        <TableCell>{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {u.email}
                        </TableCell>
                        <TableCell className="space-x-1">
                          {u.roleIds.map((rid) => {
                            const r = state.roles.find((r) => r.id === rid);
                            return r ? (
                              <Badge key={rid} variant="secondary">
                                {r.name}
                              </Badge>
                            ) : null;
                          })}
                        </TableCell>
                        <TableCell className="space-x-1">
                          {eff.slice(0, 3).map((p) => (
                            <Badge key={p.id}>{p.name}</Badge>
                          ))}
                          {eff.length > 3 ? (
                            <span className="text-xs text-muted-foreground">
                              {t("common.moreCount").replace(
                                "{{count}}",
                                String(eff.length - 3),
                              )}
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <UserDialog
                              existing={u}
                              onSubmit={(nu) =>
                                setState((s) => ({
                                  ...s,
                                  users: upsert(s.users, nu),
                                }))
                              }
                              roles={state.roles}
                              privileges={state.privileges}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                      <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>{t("common.confirmDelete") || "Confirm delete"}</AlertDialogTitle>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => setState((s) => ({ ...s, users: removeById(s.users, u.id) }))}>
                                        {t("common.delete")}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("pages.accessControl.roles.title")}</CardTitle>
                <CardDescription>
                  {t("pages.accessControl.roles.desc")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <TableToolbar
                  onExport={(type) => {
                    const cols = [
                      { header: t("pages.accessControl.roles.headers.name") as string, accessor: (r: any) => r.name },
                      { header: t("pages.accessControl.roles.headers.users") as string, accessor: (r: any) => (usage.roleUsers[r.id]||0) },
                      { header: t("pages.accessControl.roles.headers.privs") as string, accessor: (r: any) => r.privilegeIds.length },
                    ];
                    import("@/lib/export").then((m) => m.exportAll(state.roles, cols, type, "roles"));
                  }}
                  rightChildren={
                    <div className="flex items-center gap-2">
                      <RoleDialog
                        onSubmit={(r) =>
                          setState((s) => ({ ...s, roles: upsert(s.roles, r) }))
                        }
                        privileges={state.privileges}
                      />
                    </div>
                  }
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(roleSortBy, setRoleSortBy, roleSortDir, setRoleSortDir, "name")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.roles.headers.name")}
                        {getSortIcon(roleSortBy === "name", roleSortDir)}
                      </div>
                    </TableHead>
                    <TableHead>
                      {t("pages.accessControl.roles.headers.privs")}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(roleSortBy, setRoleSortBy, roleSortDir, setRoleSortDir, "users")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.roles.headers.users")}
                        {getSortIcon(roleSortBy === "users", roleSortDir)}
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      {t("pages.accessControl.roles.headers.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolesSorted.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="space-x-1">
                        {r.privilegeIds.map((pid) => {
                          const p = state.privileges.find((p) => p.id === pid);
                          return p ? (
                            <Badge key={pid} variant="secondary">
                              {p.name}
                            </Badge>
                          ) : null;
                        })}
                      </TableCell>
                      <TableCell>{usage.roleUsers[r.id] || 0}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <RoleDialog
                            existing={r}
                            onSubmit={(nr) =>
                              setState((s) => ({
                                ...s,
                                roles: upsert(s.roles, nr),
                              }))
                            }
                            privileges={state.privileges}
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("common.confirmDelete") || "Confirm delete"}</AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => setState((s) => ({
                                      ...s,
                                      roles: removeById(s.roles, r.id),
                                      users: s.users.map((u) => ({
                                        ...u,
                                        roleIds: u.roleIds.filter((id) => id !== r.id),
                                      })),
                                    }))}>
                                      {t("common.delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privileges" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {t("pages.accessControl.privileges.title")}
                </CardTitle>
                <CardDescription>
                  {t("pages.accessControl.privileges.desc")}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3">
                <TableToolbar
                  onExport={(type) => {
                    const cols = [
                      { header: t("pages.accessControl.privileges.headers.name") as string, accessor: (r: any) => r.name },
                      { header: t("pages.accessControl.privileges.headers.category") as string, accessor: (r: any) => r.category || "" },
                      { header: t("pages.accessControl.privileges.headers.usedInRoles") as string, accessor: (r: any) => (usage.privRoles[r.id]||0) },
                      { header: t("pages.accessControl.privileges.headers.usedInUsers") as string, accessor: (r: any) => (usage.privUsers[r.id]||0) },
                    ];
                    import("@/lib/export").then((m) => m.exportAll(state.privileges, cols, type, "privileges"));
                  }}
                  rightChildren={
                    <div className="flex items-center gap-2">
                      <PrivilegeDialog
                        onSubmit={(p) =>
                          setState((s) => ({
                            ...s,
                            privileges: upsert(s.privileges, p),
                          }))
                        }
                      />
                    </div>
                  }
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(privSortBy, setPrivSortBy, privSortDir, setPrivSortDir, "name")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.privileges.headers.name")}
                        {getSortIcon(privSortBy === "name", privSortDir)}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(privSortBy, setPrivSortBy, privSortDir, setPrivSortDir, "category")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.privileges.headers.category")}
                        {getSortIcon(privSortBy === "category", privSortDir)}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(privSortBy, setPrivSortBy, privSortDir, setPrivSortDir, "usedInRoles")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.privileges.headers.usedInRoles")}
                        {getSortIcon(privSortBy === "usedInRoles", privSortDir)}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none hover:bg-accent/30"
                      onClick={() => sortToggle(privSortBy, setPrivSortBy, privSortDir, setPrivSortDir, "usedInUsers")}
                    >
                      <div className="flex items-center gap-2">
                        {t("pages.accessControl.privileges.headers.usedInUsers")}
                        {getSortIcon(privSortBy === "usedInUsers", privSortDir)}
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      {t("pages.accessControl.privileges.headers.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {privsSorted.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.category || "—"}</Badge>
                      </TableCell>
                      <TableCell>{usage.privRoles[p.id] || 0}</TableCell>
                      <TableCell>{usage.privUsers[p.id] || 0}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <PrivilegeDialog
                            existing={p}
                            onSubmit={(np) =>
                              setState((s) => ({
                                ...s,
                                privileges: upsert(s.privileges, np),
                              }))
                            }
                          />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete")}
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t("common.confirmDelete") || "Confirm delete"}</AlertDialogTitle>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => setState((s) => ({
                                      ...s,
                                      privileges: removeById(s.privileges, p.id),
                                      roles: s.roles.map((r) => ({
                                        ...r,
                                        privilegeIds: r.privilegeIds.filter((id) => id !== p.id),
                                      })),
                                      users: s.users.map((u) => ({
                                        ...u,
                                        privilegeIds: u.privilegeIds.filter((id) => id !== p.id),
                                      })),
                                    }))}>
                                      {t("common.delete")}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function computeUsage(state: ACLState) {
  const roleUsers: Record<string, number> = {};
  state.users.forEach((u) =>
    u.roleIds.forEach((rid) => (roleUsers[rid] = (roleUsers[rid] || 0) + 1)),
  );

  const privRoles: Record<string, number> = {};
  state.roles.forEach((r) =>
    r.privilegeIds.forEach(
      (pid) => (privRoles[pid] = (privRoles[pid] || 0) + 1),
    ),
  );

  const privUsers: Record<string, number> = {};
  state.users.forEach((u) =>
    u.privilegeIds.forEach(
      (pid) => (privUsers[pid] = (privUsers[pid] || 0) + 1),
    ),
  );

  return { roleUsers, privRoles, privUsers };
}

function UserDialog({
  existing,
  onSubmit,
  roles,
  privileges,
}: {
  existing?: User;
  onSubmit: (u: User) => void;
  roles: Role[];
  privileges: Privilege[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.name || "");
  const [email, setEmail] = useState(existing?.email || "");
  const [roleIds, setRoleIds] = useState<string[]>(existing?.roleIds || []);
  const [privIds, setPrivIds] = useState<string[]>(
    existing?.privilegeIds || [],
  );

  const save = () => {
    const u: User = {
      id: existing?.id || uid("u"),
      name: name.trim(),
      email: email.trim(),
      roleIds,
      privilegeIds: privIds,
    };
    onSubmit(u);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing ? (
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="ml-1 h-4 w-4" />
            {t("pages.accessControl.users.new")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existing
              ? t("pages.accessControl.users.edit")
              : t("pages.accessControl.users.new")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name" requiredMark>
              {t("pages.accessControl.users.form.name")}
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" requiredMark>
              {t("pages.accessControl.users.form.email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>{t("pages.accessControl.users.form.roles")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={roleIds.includes(r.id)}
                    onCheckedChange={(v) =>
                      toggle(v, r.id, roleIds, setRoleIds)
                    }
                  />
                  {r.name}
                </label>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Label>{t("pages.accessControl.users.form.directPrivs")}</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto">
              {privileges.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={privIds.includes(p.id)}
                    onCheckedChange={(v) =>
                      toggle(v, p.id, privIds, setPrivIds)
                    }
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!name.trim() || !email.trim()}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RoleDialog({
  existing,
  onSubmit,
  privileges,
}: {
  existing?: Role;
  onSubmit: (r: Role) => void;
  privileges: Privilege[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.name || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [privIds, setPrivIds] = useState<string[]>(
    existing?.privilegeIds || [],
  );

  const save = () => {
    const r: Role = {
      id: existing?.id || uid("r"),
      name: name.trim(),
      description: description.trim(),
      privilegeIds: privIds,
    };
    onSubmit(r);
    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing ? (
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="ml-1 h-4 w-4" />
            {t("pages.accessControl.roles.new")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existing
              ? t("pages.accessControl.roles.edit")
              : t("pages.accessControl.roles.new")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="rname">
              {t("pages.accessControl.roles.form.name")}
            </Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rdesc">
              {t("pages.accessControl.roles.form.description")}
            </Label>
            <Input
              id="rdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>الصلاحيات</Label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
              {privileges.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={privIds.includes(p.id)}
                    onCheckedChange={(v) =>
                      toggle(v, p.id, privIds, setPrivIds)
                    }
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!name.trim()}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PrivilegeDialog({
  existing,
  onSubmit,
}: {
  existing?: Privilege;
  onSubmit: (p: Privilege) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existing?.name || "");
  const [description, setDescription] = useState(existing?.description || "");
  const [category, setCategory] = useState(existing?.category || "");

  const save = () => {
    const p: Privilege = {
      id: existing?.id || uid("p"),
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || undefined,
    };
    onSubmit(p);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {existing ? (
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="ml-1 h-4 w-4" />
            {t("pages.accessControl.privileges.new")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existing
              ? t("pages.accessControl.privileges.edit")
              : t("pages.accessControl.privileges.new")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="pname">
              {t("pages.accessControl.privileges.form.name")}
            </Label>
            <Input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pdesc">
              {t("pages.accessControl.privileges.form.description")}
            </Label>
            <Input
              id="pdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pcat">
              {t("pages.accessControl.privileges.form.category")}
            </Label>
            <Input
              id="pcat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t("pages.accessControl.privileges.form.placeholder")}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!name.trim()}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toggle(
  value: boolean | "indeterminate",
  id: string,
  list: string[],
  set: (v: string[]) => void,
) {
  if (value) set([...list, id]);
  else set(list.filter((x) => x !== id));
}
