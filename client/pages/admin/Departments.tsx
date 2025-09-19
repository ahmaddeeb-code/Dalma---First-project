import { useSyncExternalStore, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { listDepartments, subscribeDepartments, upsertDepartment, removeDepartment, uid, type Department } from "@/store/departments";
import { t } from "@/i18n";

function useDepartments() {
  return useSyncExternalStore(
    (cb) => subscribeDepartments(cb),
    () => listDepartments(),
    () => listDepartments(),
  );
}

export default function DepartmentsPage() {
  const deps = useDepartments();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");

  function onSave() {
    const ent: Department = { id: editing?.id || uid(), name: name.trim() };
    if (!ent.name) return;
    upsertDepartment(ent);
    setOpen(false); setEditing(null); setName("");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">Manage predefined departments and assignments</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
          <CardDescription>Edit and remove departments. Employees can be assigned in the Employees page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <TableToolbar
              onAdd={() => { setEditing(null); setName(""); setOpen(true); }}
              addLabel={t("common.add") || "Add"}
              onPageSizeChange={undefined}
            />
          </div>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name") || "Name"}</TableHead>
                  <TableHead className="w-[160px] text-center">{t("common.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deps.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" onClick={() => { setEditing(d); setName(d.name); setOpen(true); }}>{t("common.edit") || "Edit"}</Button>
                        <Button size="sm" variant="destructive" onClick={() => removeDepartment(d.id)}>{t("common.delete") || "Delete"}</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? (t("common.edit") || "Edit") : (t("common.add") || "Add")} Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label requiredMark className="text-sm">{t("common.name") || "Name"}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("common.cancel") || "Cancel"}</Button>
            <Button onClick={onSave} disabled={!name.trim()}>{t("common.save") || "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
