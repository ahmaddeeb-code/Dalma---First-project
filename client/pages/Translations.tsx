import { useMemo, useState, useSyncExternalStore } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { getLocale, listI18nKeys, getBaseMessage, getOverride, setOverride, removeOverride, subscribeTranslations } from "@/i18n";
import { getCurrentUser } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import { Download, FileUp } from "lucide-react";
import { toast } from "sonner";

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
    return effectivePrivileges(me, acl.roles, acl.privileges).some((p) => p.id === "p_manage_users");
  }, [me]);

  const keys = useMemo(() => listI18nKeys(), []);
  const [query, setQuery] = useState("");
  const [onlyMissing, setOnlyMissing] = useState(false);

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

  function exportOverrides() {
    const data = { ar: rows.reduce((acc: any, r) => { if (r.ovAr) acc[r.key] = r.ovAr; return acc; }, {}) };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
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
          <h1 className="text-2xl font-bold tracking-tight">{ar ? "إدارة الترجمات" : "Translations Management"}</h1>
          <p className="text-muted-foreground mt-1">
            {ar ? "تحكم في الترجمات بناءً على المفاتيح الإنجليزية وفحص جميع الترجمات" : "Manage translations by English keys and check completeness"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportOverrides}>
            <Download className="h-4 w-4 ml-1" /> {ar ? "تصدير" : "Export"}
          </Button>
          <label className="inline-flex items-center gap-2">
            <input type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && importOverrides(e.target.files[0])} />
            <Button variant="secondary" asChild>
              <span><FileUp className="h-4 w-4 ml-1" /> {ar ? "استيراد" : "Import"}</span>
            </Button>
          </label>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "إجمالي المفاتيح" : "Total keys"}</CardDescription>
            <CardTitle className="text-2xl">{total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "مفقود" : "Missing"}</CardDescription>
            <CardTitle className="text-2xl">{missingCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "بحاجة لمراجعة" : "Needs review"}</CardDescription>
            <CardTitle className="text-2xl">{reviewCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>{ar ? "الترجمات" : "Translations"}</CardTitle>
            <CardDescription>{ar ? "ابحث وحرّر العربية" : "Search and edit Arabic"}</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox checked={onlyMissing} onCheckedChange={(v) => setOnlyMissing(v === true)} />
              <span className="text-sm text-muted-foreground">{ar ? "إظهار الناقصة فقط" : "Only missing/review"}</span>
            </div>
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ar ? "بحث بالمفتاح أو النص" : "Search by key or text"} className="w-64" />
          </div>
        </CardHeader>
        <CardContent>
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
              {rows.map((r) => (
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
                      <Badge className="bg-amber-500 text-white hover:bg-amber-500">{ar ? "مفقود" : "Missing"}</Badge>
                    ) : r.needsReview ? (
                      <Badge variant="secondary">{ar ? "بحاجة لمراجعة" : "Needs review"}</Badge>
                    ) : (
                      <Badge variant="outline">OK</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
