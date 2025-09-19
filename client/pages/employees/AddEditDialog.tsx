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
import { Role, User, listRoles, upsertUser, uid } from "@/store/acl";
import { listDepartments } from "@/store/departments";
import { getLocale, t } from "@/i18n";
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
  const [nameEnParts, setNameEnParts] = useState<string[]>(["", "", "", "", ""]);
  const [nameArParts, setNameArParts] = useState<string[]>(["", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [active, setActive] = useState(true);
  const [roleIds, setRoleIds] = useState<string[]>([]);

  const roles: Role[] = listRoles();
  const departments = listDepartments();

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
      setNameEnParts(user.nameEnParts || ["", "", "", "", ""]);
      setNameArParts(user.nameArParts || ["", "", "", "", ""]);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setDepartment("");
      setTitle("");
      setActive(true);
      setRoleIds([]);
      setNameEnParts(["", "", "", "", ""]);
      setNameArParts(["", "", "", "", ""]);
    }
  }, [open, user]);

  const valid = useMemo(() => {
    const computed = (name || nameEnParts.join(" ")).trim();
    return computed.length >= 2 && /.+@.+\..+/.test(email);
  }, [name, nameEnParts, email]);

  function toggleRole(id: string, v: boolean | string) {
    const on = v === true;
    setRoleIds((prev) => {
      const set = new Set(prev);
      if (on) set.add(id);
      else set.delete(id);
      return Array.from(set);
    });
  }

  function onSave() {
    if (!valid) return;
    const computedName = (name || nameEnParts.join(" ")).replace(/\s+/g, " ").trim();
    const entity: User = {
      id: user?.id || uid("u"),
      name: computedName,
      email: email.trim(),
      phone: phone.trim() || undefined,
      department: department || undefined,
      title: title.trim() || undefined,
      active,
      roleIds: roleIds,
      privilegeIds: user?.privilegeIds || [],
      nameEnParts: nameEnParts.map((p) => p.trim()),
      nameArParts: nameArParts.map((p) => p.trim()),
    };
    upsertUser(entity);
    toast.success(t("pages.translations.saved"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {user
              ? t("common.edit") + " " + t("pages.employees.addEmployee")
              : t("pages.employees.addEmployee")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{t("common.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={ar ? "الاسم الكامل (إنجليزي)" : "Full name (English)"} />
          </div>
          <div>
            <Label>{t("common.email")}</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>{ar ? "الاسم (إنجليزي) - 5 أجزاء" : "Name (English) - 5 parts"}</Label>
              <div className="grid grid-cols-5 gap-2">
                {nameEnParts.map((p, i) => (
                  <Input key={i} value={p} onChange={(e) => {
                    const arr = [...nameEnParts]; arr[i] = e.target.value; setNameEnParts(arr);
                  }} placeholder={["Given","Father","Grandfather","Family","Extra"][i]} />
                ))}
              </div>
            </div>
            <div>
              <Label>{ar ? "الاسم (عربي) - 5 أجزاء" : "Name (Arabic) - 5 parts"}</Label>
              <div className="grid grid-cols-5 gap-2">
                {nameArParts.map((p, i) => (
                  <Input dir="rtl" key={i} value={p} onChange={(e) => {
                    const arr = [...nameArParts]; arr[i] = e.target.value; setNameArParts(arr);
                  }} placeholder={["الاسم","اسم الأب","اسم الجد","العائلة","إضافي"][i]} />
                ))}
              </div>
            </div>
          </div>
          <div>
            <Label>{ar ? "الهاتف" : "Phone"}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <Label>{ar ? "القسم" : "Department"}</Label>
            <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option value="">{t("common.select") || "Select"}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <Label>{ar ? "المسمى الوظيفي" : "Title"}</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox
              checked={active}
              onCheckedChange={(v) => setActive(v === true)}
            />
            <Label>{t("common.active")}</Label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div>
            <Label className="mb-2 inline-block">{t("common.roles")}</Label>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button disabled={!valid} onClick={onSave}>
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
