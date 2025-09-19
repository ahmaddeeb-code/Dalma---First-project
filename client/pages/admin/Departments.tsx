import { useSyncExternalStore, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import TableToolbar from "@/components/ui/table-toolbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, ChevronsUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
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
              onExport={(type) => {
                const cols = [
                  { header: t("common.name") || "Name", accessor: (r: any) => r.name },
                ];
                import("@/lib/export").then((m) => m.exportAll(deps, cols, type, "departments"));
              }}
            />
          </div>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none hover:bg-accent/30"
                    onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  >
                    <div className="flex items-center gap-2">
                      {t("common.name") || "Name"}
                      {sortDir === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead className="w-[160px] text-center">{t("common.actions") || "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {([...deps].sort((a,b)=> (sortDir === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)))).map((d) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-accent" onClick={() => { setEditing(d); setName(d.name); setOpen(true); }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
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
                                  <Trash2 className="mr-2 h-4 w-4" /> {t("common.delete") || "Delete"}
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t("common.confirmDelete") || "Confirm delete"}</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t("common.cancel") || "Cancel"}</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => removeDepartment(d.id)}>
                                    {t("common.delete") || "Delete"}
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
