import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { t, getLocale } from "@/i18n";
import { getCurrentUser, getCurrentUserId, subscribeAuth } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import {
  listFamilies,
  subscribeFamilies,
  upsertFamily,
  removeFamily,
  uid as familyUid,
  type Family,
  type Guardian,
  addGuardian,
  upsertGuardian,
  removeGuardian,
  linkBeneficiary,
  unlinkBeneficiary,
  setGuardianRelation,
  addFamilyDocument,
  removeFamilyDocument,
} from "@/store/families";
import { listBeneficiaries, type Beneficiary } from "@/store/beneficiaries";
import { Plus, Pencil, Trash2, FilePlus, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { exportAll, type ColumnDef } from "@/lib/export";

function useFamilies() {
  return useSyncExternalStore(
    (cb) => subscribeFamilies(cb),
    () => listFamilies(),
    () => listFamilies(),
  );
}
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function FamilyProfiles() {
  const families = useFamilies();
  const [search, setSearch] = useState("");
  const userId = useSyncExternalStore(
    (cb) => subscribeAuth(cb),
    () => getCurrentUserId(),
    () => getCurrentUserId(),
  );
  const me = useMemo(() => getCurrentUser(), [userId]);
  const canManage = useMemo(() => {
    if (!me) return false;
    const acl = loadACL();
    const has = effectivePrivileges(me, acl.roles, acl.privileges).some(
      (p) => p.id === "p_manage_families",
    );
    const isAdmin = me.roleIds.includes("r_admin");
    return has || isAdmin;
  }, [me]);

  const filtered = families.filter((f) =>
    (f.familyId + (f.name || "")).toLowerCase().includes(search.toLowerCase()),
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Family | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {getLocale() === "ar" ? "ملفات العائلات" : "Family Profiles"}
          </h1>
          <p className="text-muted-foreground">
            {getLocale() === "ar"
              ? "إدارة العائلات والأولياء وربط المستفيدين"
              : "Manage families, guardians, and link beneficiaries"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder={t("common.search") as string}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {canManage && (
            <Button onClick={() => setOpen(true)}>
              <Plus className="ml-1 h-4 w-4" /> {t("common.add")}
            </Button>
          )}
        </div>
      </header>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>
              {getLocale() === "ar" ? "قائمة العائلات" : "Families"}
            </CardTitle>
            <CardDescription>
              {getLocale() === "ar"
                ? "ابحث ورتب وافتح التفاصيل"
                : "Search and open details"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs">
                {getLocale() === "ar" ? "حجم الصفحة" : "Page size"}
              </Label>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="h-4 w-4 ml-1" />{" "}
                  {getLocale() === "ar" ? "تصدير" : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {getLocale() === "ar" ? "تنسيق" : "Format"}
                </DropdownMenuLabel>
                {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                  <DropdownMenuItem
                    key={fmt}
                    onClick={() => {
                      const cols: ColumnDef<Family>[] = [
                        { header: "ID", accessor: (r) => r.familyId },
                        {
                          header: getLocale() === "ar" ? "الاسم" : "Name",
                          accessor: (r) => r.name || "",
                        },
                        {
                          header: getLocale() === "ar" ? "الهاتف" : "Phone",
                          accessor: (r) => r.contact.phone || "",
                        },
                        {
                          header: getLocale() === "ar" ? "البريد" : "Email",
                          accessor: (r) => r.contact.email || "",
                        },
                        {
                          header:
                            getLocale() === "ar"
                              ? "المستفيدون"
                              : "Beneficiaries",
                          accessor: (r) => r.links.length,
                        },
                      ];
                      exportAll(filtered, cols, fmt, `families_${fmt}`);
                    }}
                  >
                    {getLocale() === "ar" ? "المجموعة المفلترة" : "Filtered"} –{" "}
                    {fmt.toUpperCase()}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                  <DropdownMenuItem
                    key={fmt}
                    onClick={() => {
                      const cols: ColumnDef<Family>[] = [
                        { header: "ID", accessor: (r) => r.familyId },
                        {
                          header: getLocale() === "ar" ? "الاسم" : "Name",
                          accessor: (r) => r.name || "",
                        },
                        {
                          header: getLocale() === "ar" ? "الهاتف" : "Phone",
                          accessor: (r) => r.contact.phone || "",
                        },
                        {
                          header: getLocale() === "ar" ? "البريد" : "Email",
                          accessor: (r) => r.contact.email || "",
                        },
                        {
                          header:
                            getLocale() === "ar"
                              ? "المستفيدون"
                              : "Beneficiaries",
                          accessor: (r) => r.links.length,
                        },
                      ];
                      exportAll(families, cols, fmt, `families_${fmt}`);
                    }}
                  >
                    {getLocale() === "ar" ? "كامل البيانات" : "Full dataset"} –{" "}
                    {fmt.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t("common.name")}</TableHead>
                  <TableHead>
                    {getLocale() === "ar" ? "الهاتف" : "Phone"}
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    {getLocale() === "ar" ? "البريد" : "Email"}
                  </TableHead>
                  <TableHead>
                    {getLocale() === "ar" ? "المستفيدون" : "Beneficiaries"}
                  </TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono">{f.familyId}</TableCell>
                    <TableCell>{f.name || "—"}</TableCell>
                    <TableCell>{f.contact.phone || "—"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {f.contact.email || "—"}
                    </TableCell>
                    <TableCell>{f.links.length}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(f);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                      </Button>
                      {canManage && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            removeFamily(f.id);
                            toast.success(t("pages.medical.saved"));
                          }}
                        >
                          {t("common.delete")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 py-2 text-sm text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <FamilyDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
        canManage={canManage}
      />
    </div>
  );
}

function FamilyDialog({
  open,
  onOpenChange,
  editing,
  canManage,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Family | null;
  canManage: boolean;
}) {
  const [tab, setTab] = useState("info");
  const [familyId, setFamilyId] = useState(editing?.familyId || "");
  const [name, setName] = useState(editing?.name || "");
  const [address, setAddress] = useState(editing?.contact.address || "");
  const [phone, setPhone] = useState(editing?.contact.phone || "");
  const [email, setEmail] = useState(editing?.contact.email || "");
  const [income, setIncome] = useState(editing?.socio?.incomeLevel || "");
  const [programs, setPrograms] = useState(
    (editing?.socio?.supportPrograms || []).join(", "),
  );
  const [aid, setAid] = useState(editing?.socio?.governmentAid || "");
  const [notes, setNotes] = useState(editing?.notes || "");
  const [confirmDel, setConfirmDel] = useState(false);
  useEffect(() => {
    setFamilyId(editing?.familyId || "");
    setName(editing?.name || "");
    setAddress(editing?.contact.address || "");
    setPhone(editing?.contact.phone || "");
    setEmail(editing?.contact.email || "");
    setIncome(editing?.socio?.incomeLevel || "");
    setPrograms((editing?.socio?.supportPrograms || []).join(", "));
    setAid(editing?.socio?.governmentAid || "");
    setNotes(editing?.notes || "");
  }, [editing, open]);
  const valid = familyId.trim().length > 0;

  const allBeneficiaries = listBeneficiaries();

  async function save() {
    const fam: Family = {
      id: editing?.id || familyUid(),
      familyId: familyId.trim(),
      name: name.trim() || undefined,
      contact: {
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      },
      socio: {
        incomeLevel: income.trim() || undefined,
        supportPrograms: programs
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        governmentAid: aid.trim() || undefined,
      },
      notes: notes.trim() || undefined,
      guardians: editing?.guardians || [],
      links: editing?.links || [],
      documents: editing?.documents || [],
    };
    upsertFamily(fam);
    toast.success(t("pages.medical.saved"));
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? t("common.edit") : t("common.add")}
          </DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="info">
              {getLocale() === "ar" ? "معلومات العائلة" : "Family Info"}
            </TabsTrigger>
            <TabsTrigger value="guardians">
              {getLocale() === "ar" ? "الأولياء" : "Parents/Guardians"}
            </TabsTrigger>
            <TabsTrigger value="beneficiaries">
              {getLocale() === "ar" ? "المستفيدون" : "Beneficiaries"}
            </TabsTrigger>
            <TabsTrigger value="docs">
              {getLocale() === "ar" ? "المستندات" : "Documents"}
            </TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label>Family ID</Label>
                <Input
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  placeholder="F-0001"
                />
              </div>
              <div>
                <Label>Family name (optional)</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <Label>Income level</Label>
                <Input
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  placeholder="low/medium/high"
                />
              </div>
              <div>
                <Label>Support programs</Label>
                <Input
                  value={programs}
                  onChange={(e) => setPrograms(e.target.value)}
                  placeholder="comma separated"
                />
              </div>
              <div>
                <Label>Government aid</Label>
                <Input value={aid} onChange={(e) => setAid(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex justify-between mt-2">
              <Button
                variant="destructive"
                onClick={() => setConfirmDel(true)}
                disabled={!editing}
              >
                {t("common.delete")}
              </Button>
              <Button onClick={save} disabled={!valid}>
                {t("common.save")}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="guardians" className="mt-4">
            <GuardiansTab family={editing} canManage={canManage} />
          </TabsContent>
          <TabsContent value="beneficiaries" className="mt-4">
            <BeneficiariesTab
              family={editing}
              canManage={canManage}
              all={allBeneficiaries}
            />
          </TabsContent>
          <TabsContent value="docs" className="mt-4">
            <DocumentsTab family={editing} canManage={canManage} />
          </TabsContent>
          <TabsContent value="dashboard" className="mt-4">
            <DashboardTab family={editing} />
          </TabsContent>
        </Tabs>

        <AlertDialog open={confirmDel}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete family?</AlertDialogTitle>
              <AlertDialogDescription>
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setConfirmDel(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (editing) {
                    removeFamily(editing.id);
                    toast.success("Deleted");
                    setConfirmDel(false);
                    onOpenChange(false);
                  }
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}

function GuardiansTab({
  family,
  canManage,
}: {
  family: Family | null;
  canManage: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Guardian | null>(null);
  const [file, setFile] = useState<File | null>(null);
  if (!family)
    return (
      <p className="text-sm text-muted-foreground">Save family info first.</p>
    );
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Parents/Guardians</CardTitle>
          <CardDescription>Add and manage guardians</CardDescription>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="ml-1 h-4 w-4" /> {t("common.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Relation</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {family.guardians.map((g) => (
              <TableRow key={g.id}>
                <TableCell>{g.fullName}</TableCell>
                <TableCell>{g.relation || "-"}</TableCell>
                <TableCell className="text-xs">
                  {g.contact.phone || ""}{" "}
                  {g.contact.email ? `• ${g.contact.email}` : ""}
                </TableCell>
                <TableCell className="capitalize">{g.status}</TableCell>
                <TableCell className="flex gap-2">
                  {canManage && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(g);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          removeGuardian(family.id, g.id);
                          toast.success(t("pages.medical.saved"));
                        }}
                      >
                        {t("common.delete")}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <GuardianDialog
        familyId={family.id}
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
      />
    </Card>
  );
}

function GuardianDialog({
  familyId,
  open,
  onOpenChange,
  editing,
}: {
  familyId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Guardian | null;
}) {
  const [fullName, setFullName] = useState(editing?.fullName || "");
  const [gender, setGender] = useState<"male" | "female">(
    editing?.gender || "male",
  );
  const [dob, setDob] = useState(editing?.dob || "");
  const [relation, setRelation] = useState(editing?.relation || "");
  const [nationalId, setNationalId] = useState(editing?.nationalId || "");
  const [occupation, setOccupation] = useState(editing?.occupation || "");
  const [phone, setPhone] = useState(editing?.contact.phone || "");
  const [email, setEmail] = useState(editing?.contact.email || "");
  const [address, setAddress] = useState(editing?.contact.address || "");
  const [status, setStatus] = useState<"active" | "inactive" | "deceased">(
    editing?.status || "active",
  );
  useEffect(() => {
    setFullName(editing?.fullName || "");
    setGender(editing?.gender || "male");
    setDob(editing?.dob || "");
    setRelation(editing?.relation || "");
    setNationalId(editing?.nationalId || "");
    setOccupation(editing?.occupation || "");
    setPhone(editing?.contact.phone || "");
    setEmail(editing?.contact.email || "");
    setAddress(editing?.contact.address || "");
    setStatus(editing?.status || "active");
  }, [editing, open]);
  const valid = fullName.trim().length > 1;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editing ? t("common.edit") : t("common.add")}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Full name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label>Gender</Label>
              <select
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>DOB</Label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>
            <div>
              <Label>Relation</Label>
              <Input
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="mother/father/guardian..."
              />
            </div>
            <div>
              <Label>National ID</Label>
              <Input
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <Label>Occupation</Label>
              <Input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>Status</Label>
            <select
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="deceased">Deceased</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const g: Guardian = {
                id: editing?.id || familyUid("g"),
                fullName: fullName.trim(),
                gender,
                dob,
                relation: relation.trim() || undefined,
                nationalId: nationalId.trim() || undefined,
                occupation: occupation.trim() || undefined,
                contact: {
                  phone: phone.trim() || undefined,
                  email: email.trim() || undefined,
                  address: address.trim() || undefined,
                },
                status,
                documents: editing?.documents || [],
              };
              if (editing) upsertGuardian(familyId, g);
              else addGuardian(familyId, g);
              toast.success(t("pages.medical.saved"));
              onOpenChange(false);
            }}
          >
            {t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BeneficiariesTab({
  family,
  canManage,
  all,
}: {
  family: Family | null;
  canManage: boolean;
  all: Beneficiary[];
}) {
  const [selectedId, setSelectedId] = useState<string>("");
  if (!family)
    return (
      <p className="text-sm text-muted-foreground">Save family info first.</p>
    );
  const links = family.links;
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Linked Beneficiaries</CardTitle>
          <CardDescription>
            Connect beneficiaries and set relations
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {canManage && (
            <>
              <select
                className="h-9 rounded-md border bg-background px-3 text-sm"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">—</option>
                {all.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.beneficiaryId})
                  </option>
                ))}
              </select>
              <Button
                disabled={!selectedId}
                onClick={() => {
                  linkBeneficiary(family.id, selectedId);
                  setSelectedId("");
                  toast.success(t("pages.medical.saved"));
                }}
              >
                {t("common.add")}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beneficiary</TableHead>
              <TableHead>Therapist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Relations per guardian</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((l) => {
              const b = all.find((x) => x.id === l.beneficiaryId);
              return (
                <TableRow key={l.beneficiaryId}>
                  <TableCell className="font-medium">
                    {b ? `${b.name} • ${b.beneficiaryId}` : l.beneficiaryId}
                  </TableCell>
                  <TableCell className="text-xs">
                    {b?.care.assignedTherapist || "—"}
                  </TableCell>
                  <TableCell className="capitalize">
                    {b?.status || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {(family.guardians || []).map((g) => {
                        const cur =
                          l.relations.find((r) => r.guardianId === g.id)
                            ?.relation || "";
                        return (
                          <div
                            key={g.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="min-w-[140px] truncate">
                              {g.fullName}
                            </span>
                            <Input
                              value={cur}
                              onChange={(e) =>
                                setGuardianRelation(
                                  family.id,
                                  l.beneficiaryId,
                                  g.id,
                                  e.target.value,
                                )
                              }
                              placeholder="relation"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    {canManage && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          unlinkBeneficiary(family.id, l.beneficiaryId);
                          toast.success(t("pages.medical.saved"));
                        }}
                      >
                        {t("common.delete")}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DocumentsTab({
  family,
  canManage,
}: {
  family: Family | null;
  canManage: boolean;
}) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  if (!family)
    return (
      <p className="text-sm text-muted-foreground">Save family info first.</p>
    );
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>Family Documents</CardTitle>
          <CardDescription>
            Upload and manage identification/legal papers
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
          <Input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button
            disabled={!title.trim() || !file}
            onClick={async () => {
              if (!file) return;
              const url = await readFileAsDataURL(file);
              addFamilyDocument(family.id, {
                id: `${Date.now()}`,
                title: title.trim(),
                url,
                type: file.type,
                issuedAt: new Date().toISOString(),
              });
              setTitle("");
              setFile(null);
              toast.success(t("pages.medical.saved"));
            }}
          >
            <FilePlus className="ml-1 h-4 w-4" /> Upload
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {(family.documents || []).map((d) => (
            <Badge
              key={d.id}
              className="cursor-pointer"
              onClick={() => {
                if (canManage) {
                  removeFamilyDocument(family.id, d.id);
                  toast.success(t("pages.medical.saved"));
                }
              }}
              variant="secondary"
            >
              {d.title}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardTab({ family }: { family: Family | null }) {
  if (!family) return null;
  const all = listBeneficiaries();
  const items = family.links
    .map((l) => all.find((b) => b.id === l.beneficiaryId))
    .filter(Boolean) as Beneficiary[];
  const alerts = items.flatMap((b) => {
    const now = Date.now();
    const soonDoc = (b.documents || []).some(
      (d) =>
        d.expiresAt &&
        new Date(d.expiresAt).getTime() - now < 30 * 24 * 60 * 60 * 1000,
    );
    const missed = (b.care.appointments || []).some(
      (a) => a.attended === false,
    );
    return [
      soonDoc ? `${b.name}: document expiring soon` : null,
      missed ? `${b.name}: missed appointment` : null,
    ].filter(Boolean) as string[];
  });
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Beneficiaries</CardTitle>
            <CardDescription>Total linked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
            <CardDescription>Currently active</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {items.filter((b) => b.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Key notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {alerts.length ? alerts.join(" • ") : "None"}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Linked beneficiaries and caregivers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Therapist</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell className="font-mono">{b.beneficiaryId}</TableCell>
                  <TableCell>{b.care.assignedTherapist || "—"}</TableCell>
                  <TableCell className="capitalize">{b.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
