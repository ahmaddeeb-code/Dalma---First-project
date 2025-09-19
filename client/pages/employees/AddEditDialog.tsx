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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const titleAbbrevOptions = [
  "Mr.",
  "Ms.",
  "Dr.",
  "Eng.",
  "Nrs.",
  "PT",
  "OT",
  "ST",
  "Admin",
];

function combineName(parts: string[]) {
  return parts.map((p) => p.trim()).filter(Boolean).join(" ");
}

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
  // Saudi 5-part names in EN/AR
  const [nameEnParts, setNameEnParts] = useState<string[]>(["", "", "", "", ""]);
  const [nameArParts, setNameArParts] = useState<string[]>(["", "", "", "", ""]);
  // Basics
  const [gender, setGender] = useState<"male" | "female">("male");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Employment
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [titleAbbrev, setTitleAbbrev] = useState<string>("");
  const [joinedAt, setJoinedAt] = useState<string>("");
  const [active, setActive] = useState(true);
  // Access
  const [roleIds, setRoleIds] = useState<string[]>([]);

  const roles: Role[] = listRoles();
  const departments = listDepartments();

  useEffect(() => {
    if (!open) return;
    if (user) {
      setNameEnParts(user.nameEnParts || ["", "", "", "", ""]);
      setNameArParts(user.nameArParts || ["", "", "", "", ""]);
      setGender((user.gender as any) || "male");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setDepartment(user.department || "");
      setTitle(user.title || "");
      setTitleAbbrev(user.titleAbbrev || "");
      setJoinedAt(user.joinedAt ? user.joinedAt.slice(0, 10) : "");
      setActive(user.active !== false);
      setRoleIds(user.roleIds || []);
    } else {
      setNameEnParts(["", "", "", "", ""]);
      setNameArParts(["", "", "", "", ""]);
      setGender("male");
      setEmail("");
      setPhone("");
      setDepartment("");
      setTitle("");
      setTitleAbbrev("");
      setJoinedAt(new Date().toISOString().slice(0, 10));
      setActive(true);
      setRoleIds([]);
    }
  }, [open, user]);

  const valid = useMemo(() => {
    const en = combineName(nameEnParts);
    const hasName = en.trim().length > 0 && nameEnParts[0].trim() && nameEnParts[3].trim();
    return hasName && /.+@.+\..+/.test(email);
  }, [nameEnParts, email]);

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
    const computedName = combineName(nameEnParts);
    const entity: User = {
      id: user?.id || uid("u"),
      name: computedName,
      email: email.trim(),
      phone: phone.trim() || undefined,
      department: department || undefined,
      title: title.trim() || undefined,
      titleAbbrev: titleAbbrev || undefined,
      gender,
      joinedAt: joinedAt ? new Date(joinedAt).toISOString() : undefined,
      active,
      roleIds: roleIds,
      privilegeIds: user?.privilegeIds || [],
      nameEnParts: nameEnParts.map((p) => p.trim()),
      nameArParts: nameArParts.map((p) => p.trim()),
    };
    upsertUser(entity);
    toast.success(t("pages.translations.saved") || (ar ? "تم الحفظ" : "Saved"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? (ar ? "تعديل موظف" : "Edit Employee") : (ar ? "إضافة موظف" : "Add Employee")}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="identity" className="mt-1">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="identity">{ar ? "الهوية" : "Identity"}</TabsTrigger>
            <TabsTrigger value="employment">{ar ? "الوظيفة" : "Employment"}</TabsTrigger>
            <TabsTrigger value="contact">{ar ? "التواصل" : "Contact"}</TabsTrigger>
            <TabsTrigger value="access">{ar ? "الصلاحيات" : "Access"}</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4 mt-3">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label>{ar ? "الاسم (إنجليزي) - 5 أجزاء" : "Name (English) - 5 parts"} *</Label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {nameEnParts.map((p, i) => (
                    <Input
                      key={i}
                      value={p}
                      onChange={(e) => {
                        const arr = [...nameEnParts];
                        arr[i] = e.target.value;
                        setNameEnParts(arr);
                      }}
                      placeholder={["Given", "Father", "Grandfather", "Family", "Extra"][i]}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{combineName(nameEnParts)}</p>
              </div>
              <div>
                <Label>{ar ? "الاسم (عربي) - 5 أجزاء" : "Name (Arabic) - 5 parts"}</Label>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {nameArParts.map((p, i) => (
                    <Input
                      dir="rtl"
                      key={i}
                      value={p}
                      onChange={(e) => {
                        const arr = [...nameArParts];
                        arr[i] = e.target.value;
                        setNameArParts(arr);
                      }}
                      placeholder={["الاسم", "اسم الأب", "اسم الجد", "العائلة", "إضافي"][i]}
                    />
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <Label>{ar ? "الجنس" : "Gender"}</Label>
                  <select
                    className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                  >
                    <option value="male">{ar ? "ذكر" : "Male"}</option>
                    <option value="female">{ar ? "أنثى" : "Female"}</option>
                  </select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employment" className="space-y-4 mt-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>{ar ? "القسم" : "Department"}</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option value="">{t("common.select") || (ar ? "اختر" : "Select")}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{ar ? "المسمى الوظيفي" : "Title"}</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>{ar ? "اختصار المسمى" : "Title Abbreviation"}</Label>
                <Select value={titleAbbrev || ""} onValueChange={setTitleAbbrev}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={ar ? "اختر اختصاراً" : "Choose abbreviation"} />
                  </SelectTrigger>
                  <SelectContent>
                    {titleAbbrevOptions.map((ab) => (
                      <SelectItem key={ab} value={ab}>
                        {ab}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{ar ? "تاريخ الالتحاق" : "Date of Joining"}</Label>
                <Input type="date" value={joinedAt} onChange={(e) => setJoinedAt(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Checkbox checked={active} onCheckedChange={(v) => setActive(v === true)} />
              <Label>{t("common.active") || (ar ? "نشط" : "Active")}</Label>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>{ar ? "الهاتف" : "Phone"}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="access" className="space-y-2 mt-3">
            <Label className="mb-1 inline-block">{t("common.roles") || (ar ? "الأدوار" : "Roles")}</Label>
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
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-2">
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
