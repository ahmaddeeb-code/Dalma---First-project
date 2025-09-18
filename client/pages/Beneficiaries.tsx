import { useMemo, useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getLocale } from "@/i18n";
import { getCurrentUser, getCurrentUserId } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import AddEditBeneficiaryDialog from "@/pages/beneficiaries/AddEditDialog";
import { archiveBeneficiaries, removeBeneficiary } from "@/store/beneficiaries";
import { toast } from "sonner";
import {
  BadgeCheck,
  Bell,
  CalendarClock,
  FileWarning,
  Filter,
  Search,
  User2,
  UserSquare2,
  ArrowUpDown,
  Download,
} from "lucide-react";
import {
  Beneficiary,
  BeneficiaryStatus,
  DisabilityType,
  computeAlerts,
  getAge,
  listBeneficiaries,
  queryBeneficiaries,
  subscribe as subscribeBeneficiaries,
} from "@/store/beneficiaries";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { exportAll, exportToCSV, type ColumnDef } from "@/lib/export";

function useBeneficiaries() {
  return useSyncExternalStore(
    (cb) => subscribeBeneficiaries(cb),
    () => listBeneficiaries(),
    () => listBeneficiaries(),
  );
}

function statusBadge(status: BeneficiaryStatus) {
  switch (status) {
    case "active":
      return (
        <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
          نشط
        </Badge>
      );
    case "under_treatment":
      return (
        <Badge className="bg-blue-600 text-white hover:bg-blue-600">
          تحت العلاج
        </Badge>
      );
    case "graduated":
      return <Badge variant="secondary">متخرج</Badge>;
    default:
      return <Badge variant="outline">غير نشط</Badge>;
  }
}

function disabilityLabel(d: DisabilityType, ar: boolean) {
  if (ar) {
    return (
      {
        physical: "حركية",
        intellectual: "ذهنية",
        sensory: "حسية",
        autism: "توحد",
        multiple: "متعددة",
      } as const
    )[d];
  }
  return (
    {
      physical: "Physical",
      intellectual: "Intellectual",
      sensory: "Sensory",
      autism: "Autism",
      multiple: "Multiple",
    } as const
  )[d];
}

export default function Beneficiaries() {
  const data = useBeneficiaries();
  const user = useMemo(() => getCurrentUser(), []);
  const canEdit = useMemo(() => {
    if (!user) return false;
    const acl = loadACL();
    const privs = effectivePrivileges(user, acl.roles, acl.privileges);
    return privs.some((p) => p.id === "p_edit_records");
  }, [user]);
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"name" | "age" | "status">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchText, setSearchText] = useState("");
  const [disability, setDisability] = useState<DisabilityType | "all">("all");
  const [status, setStatus] = useState<BeneficiaryStatus | "all">("all");
  const [program, setProgram] = useState<string | "all">("all");
  const [therapist, setTherapist] = useState<string | "all">("all");
  const [ageMin, setAgeMin] = useState<string>("");
  const [ageMax, setAgeMax] = useState<string>("");
  const locale = getLocale();
  const ar = locale === "ar";

  const programs = useMemo(
    () => Array.from(new Set(data.flatMap((b) => b.education.programs))),
    [data],
  );
  const therapists = useMemo(
    () =>
      Array.from(
        new Set(
          data.map((b) => b.care.assignedTherapist).filter(Boolean) as string[],
        ),
      ),
    [data],
  );

  const filtered = useMemo(() => {
    const base = queryBeneficiaries({
      search: searchText,
      disability,
      status,
      program,
      therapist,
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
    });
    const sorted = [...base].sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.name.localeCompare(b.name);
      else if (sortBy === "age") cmp = getAge(a) - getAge(b);
      else if (sortBy === "status") cmp = a.status.localeCompare(b.status);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [
    searchText,
    disability,
    status,
    program,
    therapist,
    ageMin,
    ageMax,
    sortBy,
    sortDir,
  ]);

  const total = data.length;
  const active = data.filter((b) => b.status === "active").length;
  const under = data.filter((b) => b.status === "under_treatment").length;
  const grads = data.filter((b) => b.status === "graduated").length;

  const alerts = computeAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {ar ? "إدارة المستفيدين" : "Beneficiary Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {ar
              ? "قائمة المستفيدين مع البحث والفلاتر والوصول السريع للملفات"
              : "List of beneficiaries with search, filters, and quick access to profiles"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "إجمالي" : "Total"}</CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "نشطون" : "Active"}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {active}{" "}
              <Badge className="bg-emerald-600 text-white">
                {ar ? "نشط" : "Active"}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>
              {ar ? "تحت العلاج" : "Under Treatment"}
            </CardDescription>
            <CardTitle className="text-2xl">{under}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "متخرجون" : "Graduated"}</CardDescription>
            <CardTitle className="text-2xl">{grads}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" /> {ar ? "الفلاتر" : "Filters"}
            </CardTitle>
            <CardDescription>
              {ar
                ? "تصفية حسب النوع، الحالة، البرنامج والمعالج"
                : "Filter by disability, status, program and therapist"}
            </CardDescription>
          </div>
          {canEdit && (
            <Button onClick={() => setAddOpen(true)}>
              {ar ? "إضافة مستفيد" : "Add Beneficiary"}
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <div className="md:col-span-2">
            <Label>{ar ? "بحث" : "Search"}</Label>
            <div className="relative">
              <Search
                className="absolute top-2.5 text-muted-foreground "
                style={{ [ar ? "right" : "left"]: "0.5rem" }}
              />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className={ar ? "pr-8" : "pl-8"}
                placeholder={
                  ar ? "اسم، رقم هوية، ولي أمر..." : "Name, ID, guardian..."
                }
              />
            </div>
          </div>
          <div>
            <Label>{ar ? "نوع الإعاقة" : "Disability"}</Label>
            <Select
              value={disability}
              onValueChange={(v) => setDisability(v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={ar ? "الكل" : "All"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? "الكل" : "All"}</SelectItem>
                <SelectItem value="physical">
                  {disabilityLabel("physical", ar)}
                </SelectItem>
                <SelectItem value="intellectual">
                  {disabilityLabel("intellectual", ar)}
                </SelectItem>
                <SelectItem value="sensory">
                  {disabilityLabel("sensory", ar)}
                </SelectItem>
                <SelectItem value="autism">
                  {disabilityLabel("autism", ar)}
                </SelectItem>
                <SelectItem value="multiple">
                  {disabilityLabel("multiple", ar)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{ar ? "الحالة" : "Status"}</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder={ar ? "الكل" : "All"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? "الكل" : "All"}</SelectItem>
                <SelectItem value="active">{ar ? "نشط" : "Active"}</SelectItem>
                <SelectItem value="under_treatment">
                  {ar ? "تحت العلاج" : "Under treatment"}
                </SelectItem>
                <SelectItem value="graduated">
                  {ar ? "متخرج" : "Graduated"}
                </SelectItem>
                <SelectItem value="inactive">
                  {ar ? "غير نشط" : "Inactive"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{ar ? "البرنامج" : "Program"}</Label>
            <Select value={program} onValueChange={(v) => setProgram(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder={ar ? "الكل" : "All"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? "الكل" : "All"}</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{ar ? "المع��لج" : "Therapist"}</Label>
            <Select
              value={therapist}
              onValueChange={(v) => setTherapist(v as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder={ar ? "الكل" : "All"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ar ? "الكل" : "All"}</SelectItem>
                {therapists.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{ar ? "ترتيب حسب" : "Sort by"}</Label>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{ar ? "الاسم" : "Name"}</SelectItem>
                <SelectItem value="age">{ar ? "العمر" : "Age"}</SelectItem>
                <SelectItem value="status">
                  {ar ? "الحالة" : "Status"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{ar ? "الاتجاه" : "Direction"}</Label>
            <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">{ar ? "تصاعدي" : "Asc"}</SelectItem>
                <SelectItem value="desc">{ar ? "تنازلي" : "Desc"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>{ar ? "العمر الأدنى" : "Min Age"}</Label>
              <Input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
              />
            </div>
            <div>
              <Label>{ar ? "العمر الأقصى" : "Max Age"}</Label>
              <Input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          {selected.length > 0 && canEdit && (
            <div className="px-6 pt-4 flex items-center justify-between gap-2">
              <div className="text-sm">
                {ar ? "المحدد:" : "Selected:"} {selected.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success(ar ? "تم إرسال إشعار" : "Notification sent");
                  }}
                >
                  {ar ? "إرسال إشعار" : "Send Notification"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const payload = JSON.stringify(
                      filtered.filter((b) => selected.includes(b.id)),
                      null,
                      2,
                    );
                    const blob = new Blob([payload], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "beneficiaries.json";
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  {ar ? "تصدير" : "Export"}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    archiveBeneficiaries(selected, true);
                    setSelected([]);
                    toast.success(ar ? "تمت الأرشفة" : "Archived");
                  }}
                >
                  {ar ? "أرشفة" : "Archive"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected([])}
                >
                  {ar ? "مسح" : "Clear"}
                </Button>
              </div>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserSquare2 className="h-5 w-5" />{" "}
              {ar ? "المستفيدون" : "Beneficiaries"}
            </CardTitle>
            <CardDescription>
              {ar
                ? "انقر على الاسم لفتح الملف"
                : "Click a name to open profile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {canEdit && (
                    <TableHead>
                      <Checkbox
                        checked={
                          selected.length > 0 &&
                          selected.length === filtered.length
                        }
                        onCheckedChange={(v) =>
                          setSelected(v ? filtered.map((b) => b.id) : [])
                        }
                      />
                    </TableHead>
                  )}
                  <TableHead>{ar ? "المستفيد" : "Beneficiary"}</TableHead>
                  <TableHead>{ar ? "العمر" : "Age"}</TableHead>
                  <TableHead>{ar ? "الإعاقة" : "Disability"}</TableHead>
                  <TableHead>{ar ? "البرامج" : "Programs"}</TableHead>
                  <TableHead>{ar ? "المعالج" : "Therapist"}</TableHead>
                  <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
                  <TableHead className="text-center">
                    {ar ? "الملف" : "Profile"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((b) => (
                  <TableRow key={b.id}>
                    {canEdit && (
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(b.id)}
                          onCheckedChange={(v) =>
                            setSelected((prev) =>
                              v
                                ? [...prev, b.id]
                                : prev.filter((x) => x !== b.id),
                            )
                          }
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            <User2 className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            <Link
                              to={`/beneficiaries/${b.id}`}
                              className="hover:underline"
                            >
                              {b.name}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {b.beneficiaryId} • {b.civilId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getAge(b)}</TableCell>
                    <TableCell>
                      {disabilityLabel(b.medical.disabilityType, ar)}
                    </TableCell>
                    <TableCell>{b.education.programs.join(", ")}</TableCell>
                    <TableCell>
                      {b.care.assignedTherapist ||
                        (ar ? "غير محدد" : "Unassigned")}
                    </TableCell>
                    <TableCell>{statusBadge(b.status)}</TableCell>
                    <TableCell className="text-center">
                      <Button asChild size="sm" variant="secondary">
                        <Link to={`/beneficiaries/${b.id}`}>
                          {ar ? "فتح" : "Open"}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> {ar ? "تنبيهات" : "Alerts"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "جلسات فائتة، مراجعات قادمة، مستندات على وشك الانتهاء"
                  : "Missed sessions, upcoming reviews, expiring documents"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.missed.map((a) => (
                <div
                  key={a.text}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> {a.text}
                  </span>
                  <Badge variant="secondary">
                    {ar ? "جلسة فائتة" : "Missed"}
                  </Badge>
                </div>
              ))}
              {alerts.reviews.map((a) => (
                <div
                  key={a.text}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" /> {a.text}
                  </span>
                  <Badge variant="outline">{ar ? "مراجعة" : "Review"}</Badge>
                </div>
              ))}
              {alerts.expiring.map((a) => (
                <div
                  key={a.text}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <FileWarning className="h-4 w-4" /> {a.text}
                  </span>
                  <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                    {ar ? "قرب الانتهاء" : "Expiring"}
                  </Badge>
                </div>
              ))}
              {alerts.missed.length +
                alerts.reviews.length +
                alerts.expiring.length ===
                0 && (
                <p className="text-sm text-muted-foreground">
                  {ar ? "لا توجد تنبيهات" : "No alerts"}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AddEditBeneficiaryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
