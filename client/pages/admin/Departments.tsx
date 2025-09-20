import { useSyncExternalStore, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TableToolbar from "@/components/ui/table-toolbar";
import TableActions, {
  createEditAction,
  createDeleteAction,
} from "@/components/ui/table-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TableV2 from "@/components/ui/table-v2";
import SortableTableHead from "@/components/ui/sortable-table-head";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  listDepartments,
  subscribeDepartments,
  upsertDepartment,
  removeDepartment,
  uid,
  type Department,
} from "@/store/departments";
import { t } from "@/i18n";

function useDepartments() {
  return useSyncExternalStore(
    (cb) => subscribeDepartments(cb),
    () => listDepartments(),
    () => listDepartments(),
  );
}

export default function DepartmentsPage() {
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const deps = useDepartments();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [name, setName] = useState("");

  function onSave() {
    const ent: Department = { id: editing?.id || uid(), name: name.trim() };
    if (!ent.name) return;
    upsertDepartment(ent);
    setOpen(false);
    setEditing(null);
    setName("");
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage predefined departments and assignments
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Department List</CardTitle>
          <CardDescription>
            Edit and remove departments. Employees can be assigned in the
            Employees page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <TableToolbar
              onAdd={() => {
                setEditing(null);
                setName("");
                setOpen(true);
              }}
              addLabel={t("common.add") || "Add"}
              onExport={(type) => {
                const cols = [
                  {
                    header: t("common.name") || "Name",
                    accessor: (r: any) => r.name,
                  },
                ];
                import("@/lib/export").then((m) =>
                  m.exportAll(deps, cols, type, "departments"),
                );
              }}
            />
          </div>
          <TableV2
            title={t("common.departments") || "Departments"}
            columns={[
              { key: "name", label: t("common.name") || "Name", sortable: true },
              {
                key: "actions",
                label: t("common.actions") || "Actions",
                sortable: false,
                render: (r) => (
                  <div className="flex justify-center">
                    <TableActions
                      actions={[
                        createEditAction(() => {
                          const d = deps.find((x) => x.id === r.id)!;
                          setEditing(d);
                          setName(d.name);
                          setOpen(true);
                        }),
                        createDeleteAction(
                          () => removeDepartment(r.id),
                          t("common.confirmDelete") || "Confirm delete",
                          `Delete department "${r.name}"?`,
                        ),
                      ]}
                    />
                  </div>
                ),
              },
            ]}
            rows={deps.map((d) => ({ id: d.id, name: d.name }))}
            paginationEnabled
            pageSize={10}
            pageSizeOptions={[10,25,50]}
            sortable
            defaultSort={{ key: "name", dir: "asc" }}
          />
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("common.edit") || "Edit" : t("common.add") || "Add"}{" "}
              Department
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label requiredMark className="text-sm">
              {t("common.name") || "Name"}
            </Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button onClick={onSave} disabled={!name.trim()}>
              {t("common.save") || "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
