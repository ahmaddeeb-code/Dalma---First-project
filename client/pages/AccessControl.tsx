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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function AccessControl() {
  const ar = document.documentElement.getAttribute("dir") === "rtl";
  const [state, setState] = useState<ACLState>(() => loadACL());
  useEffect(() => saveACL(state), [state]);

  const usage = useMemo(() => computeUsage(state), [state]);

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التحكم بالصلاحيات</h1>
          <p className="text-muted-foreground">
            إدارة المستخدمين والأدوار والصلاحيات؛ وتعيينها بأمان.
          </p>
        </div>
      </header>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="roles">الأدوار</TabsTrigger>
          <TabsTrigger value="privileges">الصلاحيات</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>المستخدمون</CardTitle>
                <CardDescription>
                  Create accounts and assign roles/privileges.
                </CardDescription>
              </div>
              <UserDialog
                onSubmit={(u) =>
                  setState((s) => ({ ...s, users: upsert(s.users, u) }))
                }
                roles={state.roles}
                privileges={state.privileges}
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>البريد الإلكتروني</TableHead>
                    <TableHead>الأدوار</TableHead>
                    <TableHead>الصلاحيات الفعلية</TableHead>
                    <TableHead className="w-[120px]">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.users.map((u) => {
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
                              +{eff.length - 3} more
                            </span>
                          ) : null}
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
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
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setState((s) => ({
                                ...s,
                                users: removeById(s.users, u.id),
                              }))
                            }
                          >
                            <Trash2 className="ml-1 h-4 w-4" />
                            حذف
                          </Button>
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
                <CardTitle>الأدوار</CardTitle>
                <CardDescription>
                  Roles bundle privileges for easier assignment.
                </CardDescription>
              </div>
              <RoleDialog
                onSubmit={(r) =>
                  setState((s) => ({ ...s, roles: upsert(s.roles, r) }))
                }
                privileges={state.privileges}
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الصلاحيات</TableHead>
                    <TableHead>المستخدمون</TableHead>
                    <TableHead className="w-[120px]">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.roles.map((r) => (
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
                      <TableCell className="flex items-center gap-2">
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setState((s) => ({
                              ...s,
                              roles: removeById(s.roles, r.id),
                              users: s.users.map((u) => ({
                                ...u,
                                roleIds: u.roleIds.filter((id) => id !== r.id),
                              })),
                            }))
                          }
                        >
                          <Trash2 className="ml-1 h-4 w-4" />
                            حذف
                        </Button>
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
                <CardTitle>{ar ? "الصلاحيات" : "Privileges"}</CardTitle>
                <CardDescription>
                  Atomic permissions assigned to roles or directly to users.
                </CardDescription>
              </div>
              <PrivilegeDialog
                onSubmit={(p) =>
                  setState((s) => ({
                    ...s,
                    privileges: upsert(s.privileges, p),
                  }))
                }
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>مستخدمة في الأدوار</TableHead>
                    <TableHead>مستخدمة في المستخدمين</TableHead>
                    <TableHead className="w-[120px]">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.privileges.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{p.category || "—"}</Badge>
                      </TableCell>
                      <TableCell>{usage.privRoles[p.id] || 0}</TableCell>
                      <TableCell>{usage.privUsers[p.id] || 0}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <PrivilegeDialog
                          existing={p}
                          onSubmit={(np) =>
                            setState((s) => ({
                              ...s,
                              privileges: upsert(s.privileges, np),
                            }))
                          }
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setState((s) => ({
                              ...s,
                              privileges: removeById(s.privileges, p.id),
                              roles: s.roles.map((r) => ({
                                ...r,
                                privilegeIds: r.privilegeIds.filter(
                                  (id) => id !== p.id,
                                ),
                              })),
                              users: s.users.map((u) => ({
                                ...u,
                                privilegeIds: u.privilegeIds.filter(
                                  (id) => id !== p.id,
                                ),
                              })),
                            }))
                          }
                        >
                          <Trash2 className="ml-1 h-4 w-4" />
                            حذف
                        </Button>
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
          <Button variant="secondary" size="sm">
            <Pencil className="ml-1 h-4 w-4" />
            تعديل
          </Button>
        ) : (
          <Button>
            <Plus className="ml-1 h-4 w-4" />
            مستخدم جديد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "تعديل مستخدم" : "مستخدم جديد"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Roles</Label>
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
            <Label>Direct Privileges</Label>
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
            حفظ
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
          <Button variant="secondary" size="sm">
            <Pencil className="ml-1 h-4 w-4" />
            تعديل
          </Button>
        ) : (
          <Button>
            <Plus className="ml-1 h-4 w-4" />
            دور جديد
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existing ? "تعديل دور" : "دور جديد"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="rname">Name</Label>
            <Input
              id="rname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rdesc">Description</Label>
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
            حفظ
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
          <Button variant="secondary" size="sm">
            <Pencil className="ml-1 h-4 w-4" />
            تعديل
          </Button>
        ) : (
          <Button>
            <Plus className="ml-1 h-4 w-4" />
            صلاحية جديدة
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {existing ? "تعديل صلاحية" : "صلاحية جديدة"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="pname">Name</Label>
            <Input
              id="pname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pdesc">Description</Label>
            <Input
              id="pdesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pcat">Category</Label>
            <Input
              id="pcat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Records, Administration, Reporting"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} disabled={!name.trim()}>
            حفظ
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
