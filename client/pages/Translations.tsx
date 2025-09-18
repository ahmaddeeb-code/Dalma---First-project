import { useMemo, useState, useSyncExternalStore } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getLocale,
  listI18nKeys,
  getBaseMessage,
  getOverride,
  setOverride,
  removeOverride,
  subscribeTranslations,
  addDiscoveredKey,
  listOverrideLocales,
  getOverridesForLocale,
} from "@/i18n";
import { getCurrentUser } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import { Download, FileUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { exportAll, type ColumnDef } from "@/lib/export";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

function useTransTick() {
  return useSyncExternalStore(
    (cb) => subscribeTranslations(cb),
    () => 0,
    () => 0,
  );
}

export default function Translations() {
  useTransTick();
  const ar = getLocale() === "ar";
  const me = useMemo(() => getCurrentUser(), []);
  const canManage = useMemo(() => {
    if (!me) return false;
    const acl = loadACL();
    return effectivePrivileges(me, acl.roles, acl.privileges).some(
      (p) => p.id === "p_manage_users",
    );
  }, [me]);

  const [keysTick, setKeysTick] = useState(0);
  const keys = useMemo(() => listI18nKeys(), [keysTick]);
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [confirmScan, setConfirmScan] = useState(false);
  const [confirmImport, setConfirmImport] = useState<null | { mode: "overwrite" | "incremental" }>(null);
  const [log, setLog] = useState<Array<{ at: string; action: string; details: string }>>(() => {
    try { return JSON.parse(localStorage.getItem("i18n_logs_v1")||"[]"); } catch { return []; }
  });

  function pushLog(entry: { action: string; details: string }){
    const item = { at: new Date().toISOString(), ...entry };
    const next = [item, ...log].slice(0, 20);
    localStorage.setItem("i18n_logs_v1", JSON.stringify(next));
    setLog(next);
  }

  async function scanProjectKeys(){
    const mods = import.meta.glob([
      "./client/**/*.{ts,tsx}",
      "./shared/**/*.{ts,tsx}",
      "/client/**/*.{ts,tsx}"
    ], { as: "raw" });
    const found = new Map<string, Set<string>>();
    const keySet = new Set<string>();
    for (const path in mods){
      const loader = mods[path] as () => Promise<string>;
      try {
        const code = await loader();
        const rx = /t\(\s*["'`]([^"'`]+)["'`]\s*\)/g;
        let m: RegExpExecArray | null;
        while((m = rx.exec(code))){
          keySet.add(m[1]);
          const set = found.get(path) || new Set<string>(); set.add(m[1]); found.set(path, set);
        }
      } catch {}
    }
    const before = new Set(listI18nKeys());
    const newlyAdded: string[] = [];
    keySet.forEach(k => { if (!before.has(k)) { addDiscoveredKey(k); newlyAdded.push(k); } });
    setKeysTick(x=>x+1);
    pushLog({ action: "scan", details: `${newlyAdded.length} keys added from ${found.size} files` });
    toast.success(ar?`تمت إضافة ${newlyAdded.length}`:`Added ${newlyAdded.length}`);
    return { newlyAdded, byFile: found };
  }

  async function exportAllAsExcel(){
    const XLSX = await import("xlsx");
    const allKeys = listI18nKeys();
    const locales = Array.from(new Set(["en","ar", ...listOverrideLocales()]));
    const header = ["Key", ...locales];
    const rows = allKeys.map(k => [k, ...locales.map(loc => getBaseMessage(loc as any, k) || getOverridesForLocale(loc)[k] || "")]);
    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Translations");
    XLSX.writeFile(wb, "translations.xlsx");
  }

  async function importFromExcel(file: File, mode: "overwrite"|"incremental"){
    const XLSX = await import("xlsx");
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!json.length) { toast.error(ar?"ملف فارغ":"Empty file"); return; }
    const header = (json[0] as any[]).map((h: any)=>String(h||"").trim());
    const keyIdx = header.findIndex((h)=>/^key$/i.test(h));
    if (keyIdx===-1){ toast.error(ar?"عمود Key مفقود":"Missing Key column"); return; }
    const locales = header.filter((h,i)=>i!==keyIdx && h).map(h=>String(h));
    let added=0, updated=0, skipped=0;
    for (let i=1;i<json.length;i++){
      const row = json[i] as any[];
      const k = String(row[keyIdx]||"").trim();
      if (!k){ skipped++; continue; }
      // ensure key is listed
      if (!listI18nKeys().includes(k)) { addDiscoveredKey(k); added++; }
      for (const loc of locales){
        const v = String(row[header.indexOf(loc)]||"");
        if (mode==="overwrite") {
          (setOverride as any)(loc, k, v);
          if (v) updated++;
          else (removeOverride as any)(loc, k);
        } else { // incremental
          if (v) { (setOverride as any)(loc, k, v); updated++; } else { skipped++; }
        }
      }
    }
    setKeysTick(x=>x+1);
    pushLog({ action: "import_excel", details: `added ${added}, updated ${updated}, skipped ${skipped}` });
    toast.success(ar?`تم: ��ضافة ${added}، محدثة ${updated}`:`Done: added ${added}, updated ${updated}`);
  }

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return keys
      .map((k) => {
        const en = getBaseMessage("en", k) || "";
        const baseAr = getBaseMessage("ar", k) || "";
        const ovAr = getOverride("ar", k) || "";
        const currentAr = ovAr || baseAr;
        const missing = !currentAr;
        const needsReview = !!currentAr && currentAr === en;
        return { key: k, en, baseAr, ovAr, currentAr, missing, needsReview };
      })
      .filter((r) => (onlyMissing ? r.missing || r.needsReview : true))
      .filter((r) => {
        if (!q) return true;
        const hay = `${r.key} ${r.en} ${r.currentAr}`.toLowerCase();
        return hay.includes(q);
      });
  }, [keys, query, onlyMissing]);

  const total = keys.length;
  const missingCount = rows.filter((r) => r.missing).length;
  const reviewCount = rows.filter((r) => r.needsReview).length;

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = rows.slice(start, start + pageSize);

  function exportOverrides() {
    const data = {
      ar: rows.reduce((acc: any, r) => {
        if (r.ovAr) acc[r.key] = r.ovAr;
        return acc;
      }, {}),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "i18n_overrides.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importOverrides(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        const arMap = (json && json.ar) || {};
        let applied = 0;
        Object.keys(arMap).forEach((k) => {
          const v = String(arMap[k] ?? "");
          if (v) {
            setOverride("ar", k, v);
            applied++;
          }
        });
        toast.success(ar ? `تم استيراد ${applied}` : `Imported ${applied}`);
      } catch {
        toast.error(ar ? "ملف غير صالح" : "Invalid file");
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {ar ? "إدارة الترجمات" : "Translations Management"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {ar
              ? "تحكم في الترجمات بناءً على المفاتيح الإنجليزية وفحص جميع الترجمات"
              : "Manage translations by English keys and check completeness"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{ar?"حجم الصفحة":"Page size"}</span>
            <select className="h-9 rounded-md border bg-background px-2 text-sm" value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }}>
              {[20,50,100].map(n=> (<option key={n} value={n}>{n}</option>))}
            </select>
          </div>
          <Button variant="secondary" onClick={()=>setConfirmScan(true)}>
            {ar?"تحديث المفاتيح":"Update Keys"}
          </Button>
          <label className="inline-flex items-center gap-2">
            <input type="file" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if(!f) return; setConfirmImport({ mode: "incremental" }); (e.target as any).value=""; (window as any).__pendingExcel=f; }} />
            <Button>{ar?"استيراد Excel":"Import Excel"}</Button>
          </label>
          <Button variant="outline" onClick={exportAllAsExcel}>{ar?"تصدير Excel":"Export Excel"}</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Download className="h-4 w-4 ml-1" /> {ar?"تصدير جدول":"Export table"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{ar?"تنسيق":"Format"}</DropdownMenuLabel>
              {(["csv","xlsx","pdf"] as const).map(fmt => (
                <DropdownMenuItem key={fmt} onClick={()=>{
                  const cols: ColumnDef<{key:string; en:string; currentAr:string}>[] = [
                    { header: "Key", accessor: r=>r.key },
                    { header: "English", accessor: r=>r.en },
                    { header: ar?"Arabic":"Arabic", accessor: r=>r.currentAr },
                  ];
                  exportAll(rows, cols, fmt, `translations_${fmt}`);
                }}>{ar?"المجموعة المفلترة":"Filtered"} – {fmt.toUpperCase()}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" onClick={exportOverrides}>
            <Download className="h-4 w-4 ml-1" /> {ar ? "تصدير" : "Export"}
          </Button>
          <label className="inline-flex items-center gap-2">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) =>
                e.target.files &&
                e.target.files[0] &&
                importOverrides(e.target.files[0])
              }
            />
            <Button variant="secondary" asChild>
              <span>
                <FileUp className="h-4 w-4 ml-1" /> {ar ? "استيراد" : "Import"}
              </span>
            </Button>
          </label>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card className="rounded-xl shadow-sm bg-gradient-to-br from-primary/15 to-secondary/15">
          <CardHeader className="pb-2 p-4">
            <CardDescription className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="currentColor"><path d="M7 6v12l10-6-10-6z"/></svg>
              {ar ? "إجمالي المفاتيح" : "Total keys"}
            </CardDescription>
            <CardTitle className="text-xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xl shadow-sm bg-gradient-to-br from-warning/20 to-primary/10">
          <CardHeader className="pb-2 p-4">
            <CardDescription className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-500" fill="currentColor"><path d="M12 2 1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              {ar ? "مفقود" : "Missing"}
            </CardDescription>
            <CardTitle className="text-xl">{missingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="rounded-xl shadow-sm bg-gradient-to-br from-info/15 to-success/15">
          <CardHeader className="pb-2 p-4">
            <CardDescription className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-sky-600" fill="currentColor"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-6 7-7-1.414-1.414L11 13.172 8.414 10.586 7 12l4 4z"/></svg>
              {ar ? "بحاجة لمراجعة" : "Needs review"}
            </CardDescription>
            <CardTitle className="text-xl">{reviewCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{ar ? "الترجمات" : "Translations"}</CardTitle>
            <CardDescription>
              {ar ? "ابحث وحرّر العربية" : "Search and edit Arabic"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={onlyMissing}
                onCheckedChange={(v) => setOnlyMissing(v === true)}
              />
              <span className="text-sm text-muted-foreground">
                {ar ? "إظهار الناقصة فقط" : "Only missing/review"}
              </span>
            </div>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                ar ? "بحث بالمفتاح أو النص" : "Search by key or text"
              }
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>English</TableHead>
                <TableHead>{ar ? "العربية" : "Arabic"}</TableHead>
                <TableHead>{ar ? "الحالة" : "Status"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.map((r) => (
                <TableRow key={r.key}>
                  <TableCell className="font-mono text-xs">{r.key}</TableCell>
                  <TableCell className="text-sm">{r.en}</TableCell>
                  <TableCell>
                    <Input
                      defaultValue={r.currentAr}
                      onBlur={(e) => {
                        const v = e.currentTarget.value.trim();
                        if (!canManage) return;
                        if (v) setOverride("ar", r.key, v);
                        else removeOverride("ar", r.key);
                        toast.success(ar ? "تم الحفظ" : "Saved");
                      }}
                      placeholder={ar ? "أدخل الترجمة" : "Enter translation"}
                    />
                  </TableCell>
                  <TableCell>
                    {r.missing ? (
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                        {ar ? "مفقود" : "Missing"}
                      </Badge>
                    ) : r.needsReview ? (
                      <Badge variant="secondary">
                        {ar ? "بحاجة لمراجعة" : "Needs review"}
                      </Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
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
                  <PaginationPrevious href="#" onClick={(e)=>{ e.preventDefault(); setPage(p=>Math.max(1, p-1)); }} />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-3 py-2 text-sm text-muted-foreground">{page} / {totalPages}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e)=>{ e.preventDefault(); setPage(p=>Math.min(totalPages, p+1)); }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{ar?"السجل":"Logs"}</CardTitle>
          <CardDescription>{ar?"آخر العمليات على الترجمات":"Recent translation operations"}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-1">
            {log.length? log.map((l,idx)=> (
              <li key={idx}><span className="font-mono text-xs">{new Date(l.at).toLocaleString()}</span> — <span className="font-medium">{l.action}</span> · {l.details}</li>
            )) : <li className="text-muted-foreground">{ar?"لا يوجد":"No logs"}</li>}
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={confirmScan}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ar?"تحديث المفاتيح؟":"Update keys?"}</AlertDialogTitle>
            <AlertDialogDescription>{ar?"سيتم فحص الكود لاكتشاف ال��فاتيح الجديدة وإضافتها":"We will scan the source to find new keys and add them."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={()=>setConfirmScan(false)}>{ar?"إلغاء":"Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={async ()=>{ setConfirmScan(false); await scanProjectKeys(); }}>{ar?"تأكيد":"Confirm"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!confirmImport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{ar?"استيراد من Excel؟":"Import from Excel?"}</AlertDialogTitle>
            <AlertDialogDescription>{ar?"اختر وضع الاستيراد:":"Choose import mode:"}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-2 px-6">
            <Button variant={confirmImport?.mode==="incremental"?"default":"outline"} onClick={()=>setConfirmImport({ mode: "incremental" })}>{ar?"تحديث جزئي":"Incremental"}</Button>
            <Button variant={confirmImport?.mode==="overwrite"?"default":"outline"} onClick={()=>setConfirmImport({ mode: "overwrite" })}>{ar?"استبدال كامل":"Overwrite"}</Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={()=>setConfirmImport(null)}>{ar?"إلغاء":"Cancel"}</AlertDialogCancel>
            <AlertDialogAction onClick={async ()=>{ const f = (window as any).__pendingExcel as File|undefined; if(!f){ setConfirmImport(null); return; } const mode = confirmImport!.mode; setConfirmImport(null); await importFromExcel(f, mode); (window as any).__pendingExcel = undefined; }}>{ar?"متابعة":"Proceed"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
