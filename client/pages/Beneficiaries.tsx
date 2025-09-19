import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
import TableToolbar from "@/components/ui/table-toolbar";
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
import { getCurrentUser } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import AddEditBeneficiaryDialog from "@/pages/beneficiaries/AddEditDialog";
import { archiveBeneficiaries } from "@/store/beneficiaries";
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
  Users,
  Activity,
  GraduationCap,
  Stethoscope,
  Save,
  Trash2,
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
    )[d as keyof any] || d;
  }
  return (
    {
      physical: "Physical",
      intellectual: "Intellectual",
      sensory: "Sensory",
      autism: "Autism",
      multiple: "Multiple",
    } as const
  )[d as keyof any] || d;
}

type FilterState = {
  searchText: string;
  disability: DisabilityType | "all";
  status: BeneficiaryStatus | "all";
  program: string | "all";
  therapist: string | "all";
  ageMin?: number;
  ageMax?: number;
  sortBy: "name" | "age" | "status";
  sortDir: "asc" | "desc";
  pageSize: number;
};

const SAVED_VIEWS_KEY = "dalma_saved_beneficiary_views_v1";

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

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  const total = data.length;
  const active = data.filter((b) => b.status === "active").length;
  const under = data.filter((b) => b.status === "under_treatment").length;
  const grads = data.filter((b) => b.status === "graduated").length;

  const alerts = computeAlerts();

  // saved views
  type SavedView = { id: string; name: string; state: FilterState };
  const [saved, setSaved] = useState<SavedView[]>([]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_VIEWS_KEY);
      setSaved(raw ? (JSON.parse(raw) as SavedView[]) : []);
    } catch {
      setSaved([]);
    }
  }, []);
  function saveViews(next: SavedView[]) {
    setSaved(next);
    localStorage.setItem(SAVED_VIEWS_KEY, JSON.stringify(next));
  }
  function currentState(): FilterState {
    return {
      searchText,
      disability,
      status,
      program,
      therapist,
      ageMin: ageMin ? Number(ageMin) : undefined,
      ageMax: ageMax ? Number(ageMax) : undefined,
      sortBy,
      sortDir,
      pageSize,
    };
  }
  function applyState(s: FilterState) {
    setSearchText(s.searchText || "");
    setDisability(s.disability || "all");
    setStatus(s.status || "all");
    setProgram(s.program || "all");
    setTherapist(s.therapist || "all");
    setAgeMin(s.ageMin != null ? String(s.ageMin) : "");
    setAgeMax(s.ageMax != null ? String(s.ageMax) : "");
    setSortBy(s.sortBy);
    setSortDir(s.sortDir);
    setPageSize(s.pageSize || 10);
    setPage(1);
  }
  function clearAll() {
    setSearchText("");
    setDisability("all");
    setStatus("all");
    setProgram("all");
    setTherapist("all");
    setAgeMin("");
    setAgeMax("");
    setSortBy("name");
    setSortDir("asc");
    setPageSize(10);
    setPage(1);
  }

  const activeFilterChips: string[] = [];
  if (searchText) activeFilterChips.push(`${ar ? "بحث" : "Search"}: ${searchText}`);
  if (disability !== "all") activeFilterChips.push(`${ar ? "إعاقة" : "Disability"}: ${disabilityLabel(disability, ar)}`);
  if (status !== "all") activeFilterChips.push(`${ar ? "حالة" : "Status"}: ${status}`);
  if (program !== "all") activeFilterChips.push(`${ar ? "برنامج" : "Program"}: ${program}`);
  if (therapist !== "all") activeFilterChips.push(`${ar ? "معالج" : "Therapist"}: ${therapist}`);
  if (ageMin) activeFilterChips.push(`${ar ? "عمر ≥" : "Age ≥"} ${ageMin}`);
  if (ageMax) activeFilterChips.push(`${ar ? "عمر ≤" : "Age ≤"} ${ageMax}`);

  // widgets data
  const upcoming = useMemo(() => {
    const out: { id: string; when: Date; who: string; type: string }[] = [];
    for (const b of data) {
      for (const ap of b.care.appointments) {
        const d = new Date(ap.date);
        if (d > new Date()) out.push({ id: b.id, when: d, who: b.name, type: ap.type });
      }
    }
    return out.sort((a, b) => +a.when - +b.when).slice(0, 6);
  }, [data]);
  const expiringDocs = useMemo(() => {
    const now = new Date();
    const soon = new Date();
    soon.setDate(soon.getDate() + 30);
    const out: { who: string; title: string; when: Date }[] = [];
    for (const b of data) {
      for (const d of b.documents) {
        if (!d.expiresAt) continue;
        const dt = new Date(d.expiresAt);
        if (dt <= soon && dt >= now) out.push({ who: b.name, title: d.title, when: dt });
      }
    }
    return out.sort((a, b) => +a.when - +b.when).slice(0, 6);
  }, [data]);
  const therapistLoad = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of data) {
      if (b.care.assignedTherapist) {
        map.set(b.care.assignedTherapist, (map.get(b.care.assignedTherapist) || 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [data]);

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
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Users className="h-4 w-4" />{ar ? "إجمالي" : "Total"}</CardDescription>
            <CardTitle className="text-3xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Activity className="h-4 w-4" />{ar ? "نشطون" : "Active"}</CardDescription>
            <CardTitle className="text-3xl">{active}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><Stethoscope className="h-4 w-4" />{ar ? "تحت العلاج" : "Under Treatment"}</CardDescription>
            <CardTitle className="text-3xl">{under}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2"><GraduationCap className="h-4 w-4" />{ar ? "متخرجون" : "Graduated"}</CardDescription>
            <CardTitle className="text-3xl">{grads}</CardTitle>
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="hidden md:flex items-center gap-2">
              <Label className="text-xs">
                {ar ? "حجم الصفحة" : "Page size"}
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
                  <Download className="h-4 w-4 ml-1" /> {ar ? "تصدير" : "Export"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{ar ? "تنسيق" : "Format"}</DropdownMenuLabel>
                {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                  <DropdownMenuItem
                    key={fmt}
                    onClick={() => {
                      const cols: ColumnDef<Beneficiary>[] = [
                        { header: ar ? "الاسم" : "Name", accessor: (r) => r.name },
                        { header: ar ? "العمر" : "Age", accessor: (r) => getAge(r) },
                        { header: ar ? "الإعاقة" : "Disability", accessor: (r) => r.medical.disabilityType },
                        { header: ar ? "المعالج" : "Therapist", accessor: (r) => r.care.assignedTherapist || "" },
                        { header: ar ? "الحالة" : "Status", accessor: (r) => r.status },
                      ];
                      exportAll(filtered, cols, fmt, `beneficiaries_${fmt}`);
                    }}
                  >
                    {ar ? "المجموعة المفلترة" : "Filtered"} – {fmt.toUpperCase()}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {(["csv", "xlsx", "pdf"] as const).map((fmt) => (
                  <DropdownMenuItem
                    key={fmt}
                    onClick={() => {
                      const cols: ColumnDef<Beneficiary>[] = [
                        { header: ar ? "الاسم" : "Name", accessor: (r) => r.name },
                        { header: ar ? "العمر" : "Age", accessor: (r) => getAge(r) },
                        { header: ar ? "الإعاقة" : "Disability", accessor: (r) => r.medical.disabilityType },
                        { header: ar ? "المعالج" : "Therapist", accessor: (r) => r.care.assignedTherapist || "" },
                        { header: ar ? "الحالة" : "Status", accessor: (r) => r.status },
                      ];
                      exportAll(data, cols, fmt, `beneficiaries_${fmt}`);
                    }}
                  >
                    {ar ? "كامل البيانات" : "Full dataset"} – {fmt.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary">
                  <Save className="h-4 w-4" /> {ar ? "العروض المحفوظة" : "Saved views"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-64">
                <DropdownMenuItem
                  onClick={() => {
                    const name = window.prompt(ar ? "اسم العرض" : "View name");
                    if (!name) return;
                    const view: SavedView = {
                      id: Math.random().toString(36).slice(2),
                      name,
                      state: currentState(),
                    };
                    saveViews([view, ...saved]);
                    toast.success(ar ? "تم الحفظ" : "Saved");
                  }}
                >
                  {ar ? "حفظ العرض الحالي" : "Save current view"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {saved.length === 0 && (
                  <DropdownMenuItem disabled>
                    {ar ? "لا توجد عروض محفوظة" : "No saved views"}
                  </DropdownMenuItem>
                )}
                {saved.map((v) => (
                  <div key={v.id} className="px-2 py-1.5 text-sm flex items-center justify-between gap-2">
                    <button className="hover:underline" onClick={() => applyState(v.state)}>{v.name}</button>
                    <button
                      className="text-destructive hover:underline"
                      onClick={() => {
                        const next = saved.filter((s) => s.id !== v.id);
                        saveViews(next);
                      }}
                      title={ar ? "حذف" : "Delete"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" onClick={clearAll}>{ar ? "مسح الكل" : "Clear all"}</Button>
            {canEdit && (
              <Button onClick={() => setAddOpen(true)}>
                {ar ? "إضافة مستفيد" : "Add Beneficiary"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-7 gap-3">
          <div className="md:col-span-7">
            <TableToolbar
              onAdd={canEdit ? () => setAddOpen(true) : undefined}
              addLabel={ar ? "إضافة مستفيد" : "Add Beneficiary"}
              onExport={async (type) => {
                const cols = [
                  { header: ar ? "المستفيد" : "Name", accessor: (r: any) => r.name },
                  { header: "ID", accessor: (r: any) => r.beneficiaryId },
                  { header: ar ? "الإعاقة" : "Disability", accessor: (r: any) => r.medical.disabilityType },
                  { header: ar ? "الحالة" : "Status", accessor: (r: any) => r.status },
                ];
                await import("@/lib/export").then((m) => m.exportAll(pageItems, cols, type, "beneficiaries"));
              }}
              pageSize={pageSize}
              onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
            />
          </div>
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
          <div className="md:col-span-5 flex items-end gap-2 flex-wrap">
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
                  <SelectItem value="physical">{disabilityLabel("physical", ar)}</SelectItem>
                  <SelectItem value="intellectual">{disabilityLabel("intellectual", ar)}</SelectItem>
                  <SelectItem value="sensory">{disabilityLabel("sensory", ar)}</SelectItem>
                  <SelectItem value="autism">{disabilityLabel("autism", ar)}</SelectItem>
                  <SelectItem value="multiple">{disabilityLabel("multiple", ar)}</SelectItem>
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
              <Label>{ar ? "المعالج" : "Therapist"}</Label>
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
            <div>
              <Label>{ar ? "ترتيب حسب" : "Sort by"}</Label>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{ar ? "الاسم" : "Name"}</SelectItem>
                  <SelectItem value="age">{ar ? "العمر" : "Age"}</SelectItem>
                  <SelectItem value="status">{ar ? "الحالة" : "Status"}</SelectItem>
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
          </div>

          <div className="md:col-span-7 flex items-center gap-2 flex-wrap">
            <div className="text-sm text-muted-foreground">
              {ar ? "فلاتر الحالة:" : "Status filters:"}
            </div>
            {([
              { key: "all", label: ar ? "الكل" : "All" },
              { key: "active", label: ar ? "نشط" : "Active" },
              { key: "under_treatment", label: ar ? "تحت العلاج" : "Under" },
              { key: "graduated", label: ar ? "متخرج" : "Graduated" },
              { key: "inactive", label: ar ? "غير نشط" : "Inactive" },
            ] as const).map((s) => (
              <Button
                key={s.key}
                size="sm"
                variant={status === s.key ? "default" : "outline"}
                onClick={() => setStatus(s.key as any)}
              >
                {s.label}
              </Button>
            ))}
            {activeFilterChips.length > 0 && (
              <div className="ml-auto flex items-center gap-2 text-xs flex-wrap">
                {activeFilterChips.map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">
                    {c}
                  </span>
                ))}
              </div>
            )}
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
              <UserSquare2 className="h-5 w-5" /> {ar ? "المستفيدون" : "Beneficiaries"}
            </CardTitle>
            <CardDescription>
              {ar ? "انقر على الاسم لفتح الملف" : "Click a name to open profile"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {canEdit && (
                      <TableHead>
                        <Checkbox
                          checked={
                            pageItems.length > 0 &&
                            pageItems.every((b) => selected.includes(b.id))
                          }
                          onCheckedChange={(v) =>
                            setSelected((prev) => {
                              const ids = pageItems.map((b) => b.id);
                              if (v) return Array.from(new Set([...prev, ...ids]));
                              return prev.filter((id) => !ids.includes(id));
                            })
                          }
                        />
                      </TableHead>
                    )}
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => {
                        setSortBy("name");
                        setSortDir(
                          sortBy === "name" && sortDir === "asc" ? "desc" : "asc",
                        );
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {ar ? "المستفيد" : "Beneficiary"} <ArrowUpDown className="h-3 w-3 opacity-60" />
                      </span>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer select-none"
                      onClick={() => {
                        setSortBy("age");
                        setSortDir(
                          sortBy === "age" && sortDir === "asc" ? "desc" : "asc",
                        );
                      }}
                    >
                      <span className="inline-flex items-center gap-1">
                        {ar ? "العمر" : "Age"} <ArrowUpDown className="h-3 w-3 opacity-60" />
                      </span>
                    </TableHead>
                    <TableHead>{ar ? "الإعاقة" : "Disability"}</TableHead>
                    <TableHead className="hidden md:table-cell">
                      {ar ? "البرامج" : "Programs"}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      {ar ? "المعالج" : "Therapist"}
                    </TableHead>
                    <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
                    <TableHead className="text-center">
                      {ar ? "الملف" : "Profile"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((b) => (
                    <TableRow key={b.id}>
                      {canEdit && (
                        <TableCell>
                          <Checkbox
                            checked={selected.includes(b.id)}
                            onCheckedChange={(v) =>
                              setSelected((prev) =>
                                v ? [...prev, b.id] : prev.filter((x) => x !== b.id),
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
                              <Link to={`/beneficiaries/${b.id}`} className="hover:underline">
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
                      <TableCell className="hidden md:table-cell">
                        {b.education.programs.join(", ")}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {b.care.assignedTherapist || (ar ? "غير محدد" : "Unassigned")}
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
                <div key={a.text} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> {a.text}
                  </span>
                  <Badge variant="secondary">{ar ? "جلسة فائتة" : "Missed"}</Badge>
                </div>
              ))}
              {alerts.reviews.map((a) => (
                <div key={a.text} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4" /> {a.text}
                  </span>
                  <Badge variant="outline">{ar ? "مراجعة" : "Review"}</Badge>
                </div>
              ))}
              {alerts.expiring.map((a) => (
                <div key={a.text} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <FileWarning className="h-4 w-4" /> {a.text}
                  </span>
                  <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                    {ar ? "قرب الانتهاء" : "Expiring"}
                  </Badge>
                </div>
              ))}
              {alerts.missed.length + alerts.reviews.length + alerts.expiring.length === 0 && (
                <p className="text-sm text-muted-foreground">{ar ? "لا توجد تنبيهات" : "No alerts"}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5" /> {ar ? "مواعيد قادمة" : "Upcoming"}
              </CardTitle>
              <CardDescription>
                {ar ? "أقرب 6 مواعيد" : "Next 6 appointments"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {upcoming.map((u, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{u.who} – {u.type}</span>
                  <span className="text-muted-foreground">{u.when.toLocaleString()}</span>
                </div>
              ))}
              {upcoming.length === 0 && (
                <div className="text-muted-foreground">{ar ? "لا يوجد" : "None"}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileWarning className="h-5 w-5" /> {ar ? "مستندات على وشك الانتهاء" : "Expiring docs"}
              </CardTitle>
              <CardDescription>
                {ar ? "خلال 30 يوماً" : "Within 30 days"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {expiringDocs.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span>{d.who} – {d.title}</span>
                  <span className="text-muted-foreground">{d.when.toLocaleDateString()}</span>
                </div>
              ))}
              {expiringDocs.length === 0 && (
                <div className="text-muted-foreground">{ar ? "لا يوجد" : "None"}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" /> {ar ? "عبء المعالجين" : "Therapist load"}
              </CardTitle>
              <CardDescription>
                {ar ? "أكثر 6 معالجين" : "Top 6 therapists"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {therapistLoad.map(([t, n]) => (
                <div key={t} className="flex items-center justify-between">
                  <span>{t}</span>
                  <Badge variant="secondary">{n}</Badge>
                </div>
              ))}
              {therapistLoad.length === 0 && (
                <div className="text-muted-foreground">{ar ? "لا يوجد" : "None"}</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <AddEditBeneficiaryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
