import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { listPrivileges, getUserById, updateUser, type User } from "@/store/acl";
import { t } from "@/i18n";

export default function ManagePrivilegesDialog({
  userId,
  open,
  onOpenChange,
}: { userId: string | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [privIds, setPrivIds] = useState<string[]>([]);
  const all = listPrivileges();

  useEffect(() => {
    if (!open || !userId) return;
    const u = getUserById(userId);
    setUser(u);
    setPrivIds(u?.privilegeIds || []);
  }, [open, userId]);

  function toggle(id: string, v: boolean | string) {
    const on = v === true;
    setPrivIds((prev) => {
      const set = new Set(prev);
      if (on) set.add(id); else set.delete(id);
      return Array.from(set);
    });
  }

  function onSave() {
    if (!user) return;
    updateUser(user.id, { privilegeIds: privIds });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pages.accessControl.users.form.directPrivs") || "Direct Privileges"}</DialogTitle>
        </DialogHeader>
        <div className="border rounded-md p-2 max-h-64 overflow-auto space-y-2">
          {all.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <Checkbox checked={privIds.includes(p.id)} onCheckedChange={(v) => toggle(p.id, v)} />
              <span>{p.name}</span>
            </label>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel") || "Cancel"}</Button>
          <Button onClick={onSave}>{t("common.save") || "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
