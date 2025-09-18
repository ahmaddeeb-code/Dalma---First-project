import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Role,
  Privilege,
  User,
  listRoles,
  listPrivileges,
  upsertUser,
  uid,
} from "@/store/acl";
import { getLocale } from "@/i18n";
import { toast } from "sonner";

export default function AddEditEmployeeDialog({
  open,
  onOpenChange,
  user,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: User | null;
}) {
  const ar = getLocale() === "ar";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(true);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [privIds, setPrivIds] = useState<string[]>([]);

  const roles: Role[] = listRoles();
  const privileges: Privilege[] = listPrivileges();

  useEffect(() => {
    if (!open) return;
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "");
      setTitle(user.title || "");
      setActive(user.active !== false);
      setRoleIds(user.roleIds || []);
      setPrivIds(user.privilegeIds || []);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setDepartment("");
      setTitle("");
      setActive(true);
      setRoleIds([]);
      setPrivIds([]);
    }
  }, [open, user]);

  const valid = useMemo(() => {
    return name.trim().length >= 2 && /.+@.+\..+/.test(email);
  }, [name, email]);

  function toggleRole(id: string, v: boolean | string) {
    const on = v === true;
    setRoleIds((prev) => {
      const set = new Set(prev);
      if (on) set.add(id);
      else set.delete(id);
      return Array.from(set);
    });
  }
  function togglePriv(id: string, v: boolean | string) {
    const on = v === true;
    setPrivIds((prev) => {
      const set = new Set(prev);
      if (on) set.add(id);
      else set.delete(id);
      return Array.from(set);
    });
  }

  function onSave() {
    if (!valid) return;
    const entity: User = {
      id: user?.id || uid("u"),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      department: department.trim() || undefined,
      title: title.trim() || undefined,
      active,
      roleIds: roleIds,
      privilegeIds: privIds,
    };
    upsertUser(entity);
    toast.success(ar ? "تم الحفظ" : "Saved");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {user
              ? ar
                ? "تعديل الموظف"
                : "Edit Employee"
              : ar
                ? "إضافة موظف"
                : "Add Employee"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{ar ? "الاسم" : "Name"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{ar ? "البريد الإلكتروني" : "Email"}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>{ar ? "الهاتف" : "Phone"}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>{ar ? "القسم" : "Department"}</Label>
            <Input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div>
            <Label>{ar ? "المسمى الوظيفي" : "Title"}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox checked={active} onCheckedChange={(v) => setActive(v === true)} />
            <Label>{ar ? "نشط" : "Active"}</Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div>
            <Label className="mb-2 inline-block">{ar ? "��لأدوار" : "Roles"}</Label>
            <div className="border rounded-md p-2 max-h-48 overflow-auto space-y-2">
              {roles.map((r) => (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={roleIds.includes(r.id)}
                    onCheckedChange={(v) => toggleRole(r.id, v)}
                  />
                  <span>{r.name}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <Label className="mb-2 inline-block">
              {ar ? "الصلاحيات المباشرة" : "Direct Privileges"}
            </Label>
            <div className="border rounded-md p-2 max-h-48 overflow-auto space-y-2">
              {privileges.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={privIds.includes(p.id)}
                    onCheckedChange={(v) => togglePriv(p.id, v)}
                  />
                  <span>{p.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {ar ? "إلغاء" : "Cancel"}
          </Button>
          <Button disabled={!valid} onClick={onSave}>
            {ar ? "حفظ" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
