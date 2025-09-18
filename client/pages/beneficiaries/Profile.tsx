import { useMemo, useSyncExternalStore, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLocale } from "@/i18n";
import {
  CalendarDays,
  ClipboardList,
  FileText,
  LifeBuoy,
  MessagesSquare,
  Stethoscope,
  Trash2,
  UploadCloud,
  Edit3,
  Save,
  X,
  Archive,
  User2,
  WalletMinimal,
  CalendarClock,
  Activity,
  FileWarning,
} from "lucide-react";
import {
  Beneficiary,
  getAge,
  getBeneficiary,
  subscribe as subscribeBeneficiaries,
  addDocument,
  updateBeneficiary,
  removeBeneficiary,
  archiveBeneficiaries,
} from "@/store/beneficiaries";
import { getBeneficiarySettings, subscribeBeneficiarySettings } from "@/store/beneficiary-settings";

import { getCurrentUser, getCurrentUserId } from "@/store/auth";
import { effectivePrivileges, loadACL } from "@/store/acl";
import { toast } from "sonner";

function useBeneficiary(id: string | undefined) {
  return useSyncExternalStore(
    (cb) => subscribeBeneficiaries(cb),
    () => (id ? getBeneficiary(id) : null),
    () => (id ? getBeneficiary(id) : null),
  );
}

function statusBadgeAr(status: Beneficiary["status"]) {
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

function useBeneficiarySettings(){
  return useSyncExternalStore(
    (cb)=>subscribeBeneficiarySettings(cb),
    ()=>getBeneficiarySettings(),
    ()=>getBeneficiarySettings(),
  );
}

export default function BeneficiaryProfile() {
  const { id } = useParams();
  const b = useBeneficiary(id);
  const ar = getLocale() === "ar";
  const settings = useBeneficiarySettings();
  const user = useMemo(() => getCurrentUser(), []);
  const canEdit = useMemo(() => {
    if (!user) return false;
    const acl = loadACL();
    const privs = effectivePrivileges(user, acl.roles, acl.privileges);
    return privs.some((p) => p.id === "p_edit_records");
  }, [user]);

  const age = useMemo(() => (b ? getAge(b) : 0), [b]);
  const [edit, setEdit] = useState(false);

  if (!b) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          {ar
            ? "لا يوجد مستفيد بهذا المعرف"
            : "No beneficiary found for this ID"}
        </p>
        <Button asChild>
          <Link to="/beneficiaries">
            {ar ? "عودة إلى القائمة" : "Back to list"}
          </Link>
        </Button>
      </div>
    );
  }

  const nextAppointment = b.care.appointments
    .filter((a) => new Date(a.date) > new Date())
    .sort((a, c) => +new Date(a.date) - +new Date(c.date))[0];
  const expiringSoon = b.documents.filter((d) => d.expiresAt && new Date(d.expiresAt) < new Date(Date.now() + 1000*60*60*24*30));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="secondary">
          <Link to="/beneficiaries">{ar ? "المستفيدون" : "Beneficiaries"}</Link>
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-2xl font-bold tracking-tight">
          {ar ? "ملف المستفيد" : "Beneficiary Profile"}
        </h1>
      </div>

      <Card className="overflow-hidden">
        <div className="h-28 w-full bg-gradient-to-r from-primary/20 via-blue-500/15 to-emerald-500/20" />
        <CardContent className="-mt-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-background">
              {b.photoUrl ? (
                <AvatarImage alt={b.name} src={b.photoUrl} />
              ) : (
                <AvatarFallback>
                  <User2 className="h-8 w-8" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-3">
                <h2 className="text-xl font-semibold">{b.name}</h2>
                {statusBadgeAr(b.status)}
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-3">
                <span>
                  {ar ? "الرقم" : "ID"}: {b.beneficiaryId}
                </span>
                <span>
                  {ar ? "السجل المدني" : "Civil"}: {b.civilId}
                </span>
                <span>
                  {ar ? "العمر" : "Age"}: {age}
                </span>
                <span className="flex items-center gap-2">
                  <span>{ar ? "الجنس" : "Gender"}:</span>
                  {edit ? (
                    <Select defaultValue={b.gender} onValueChange={(v)=> (b.gender = v as any)}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(settings.lists.gender || ["male","female"]).map((g)=> (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    b.gender === "male" ? (ar?"ذكر":"Male") : (ar?"أنثى":"Female")
                  )}
                </span>
                <span className="flex items-center gap-2">
                  <span>{ar ? "الإعاقة" : "Disability"}:</span>
                  {edit ? (
                    <Select defaultValue={b.medical.disabilityType} onValueChange={(v)=> (b.medical.disabilityType = v)}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {settings.disabilityCategories.map((d)=> (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    b.medical.disabilityType
                  )}
                </span>
              </div>
              <div className="text-sm mt-2">
                <span className="text-muted-foreground">
                  {ar ? "الطبيب" : "Doctor"}:
                </span>{" "}
                {b.care.assignedDoctor || (ar ? "غير محدد" : "Unassigned")} ·{" "}
                <span className="text-muted-foreground">
                  {ar ? "المعالج" : "Therapist"}:
                </span>{" "}
                {b.care.assignedTherapist || (ar ? "غير محدد" : "Unassigned")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {canEdit && (
        <Card>
          <CardContent className="py-4 flex flex-wrap items-center gap-2">
            {!edit ? (
              <Button size="sm" variant="outline" onClick={() => setEdit(true)}>
                <Edit3 className="h-4 w-4 ml-1" /> {ar ? "تعديل" : "Edit"}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!b) return;
                    updateBeneficiary(
                      b.id,
                      { ...b },
                      getCurrentUserId() || undefined,
                      "inline_update",
                    );
                    setEdit(false);
                    toast.success(ar ? "تم الحفظ" : "Saved");
                  }}
                >
                  <Save className="h-4 w-4 ml-1" /> {ar ? "حفظ" : "Save"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  <X className="h-4 w-4 ml-1" /> {ar ? "إلغاء" : "Cancel"}
                </Button>
              </>
            )}
            <label className="cursor-pointer inline-flex items-center gap-1 text-sm bg-secondary text-secondary-foreground rounded-md px-2 py-1">
              <UploadCloud className="h-4 w-4" />{" "}
              {ar ? "صورة الملف" : "Profile Photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f || !b) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    updateBeneficiary(
                      b.id,
                      { photoUrl: reader.result as string },
                      getCurrentUserId() || undefined,
                      "upload_photo",
                    );
                    toast.success(ar ? "تم تحديث الصورة" : "Photo updated");
                  };
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="secondary">
                  <Archive className="h-4 w-4 ml-1" />{" "}
                  {b.archived
                    ? ar
                      ? "إلغاء الأرشفة"
                      : "Unarchive"
                    : ar
                      ? "أرشفة"
                      : "Archive"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {ar ? "تأكيد" : "Confirm"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {b.archived
                      ? ar
                        ? "هل تريد إلغاء أرشفة هذا الملف؟"
                        : "Unarchive this profile?"
                      : ar
                        ? "هل تريد أرشفة هذا الملف؟"
                        : "Archive this profile?"}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {ar ? "إلغاء" : "Cancel"}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (!b) return;
                      archiveBeneficiaries(
                        [b.id],
                        !b.archived,
                        getCurrentUserId() || undefined,
                      );
                      toast.success(ar ? "تم التحديث" : "Updated");
                    }}
                  >
                    {ar ? "تأكيد" : "Confirm"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 ml-1" /> {ar ? "حذف" : "Delete"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {ar ? "حذف نهائي" : "Permanent Delete"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {ar
                      ? "سيتم حذف هذا المستفيد نهائياً. لا يمكن التراجع."
                      : "This will permanently delete this beneficiary. This action cannot be undone."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {ar ? "إلغاء" : "Cancel"}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (!b) return;
                      removeBeneficiary(b.id);
                      toast.success(ar ? "تم الحذف" : "Deleted");
                      window.history.back();
                    }}
                  >
                    {ar ? "حذف" : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "التقدم" : "Progress"}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> {b.care.progress}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-2 bg-muted rounded">
              <div className="h-2 bg-primary rounded" style={{ width: `${b.care.progress}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "الموعد القادم" : "Next appointment"}</CardDescription>
            <CardTitle className="text-base">
              {nextAppointment ? (
                <span className="inline-flex items-center gap-2"><CalendarClock className="h-5 w-5" />{new Date(nextAppointment.date).toLocaleString()}</span>
              ) : (
                <span className="text-muted-foreground">{ar?"لا يوجد":"None"}</span>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "البرامج" : "Programs"}</CardDescription>
            <CardContent className="pt-2 flex flex-wrap gap-2">
              {b.education.programs.length ? b.education.programs.map((p)=> (
                <Badge key={p} variant="secondary">{p}</Badge>
              )): <span className="text-sm text-muted-foreground">{ar?"لا يوجد":"None"}</span>}
            </CardContent>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>{ar ? "مستندات على وشك الانتهاء" : "Expiring docs"}</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <FileWarning className="h-5 w-5 text-amber-500" /> {expiringSoon.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="personal">
            {ar ? "البيانات الشخصية" : "Personal"}
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Stethoscope className="h-4 w-4 ml-1" />{" "}
            {ar ? "طبي وإعاقة" : "Medical"}
          </TabsTrigger>
          <TabsTrigger value="care">
            <ClipboardList className="h-4 w-4 ml-1" />{" "}
            {ar ? "خطة الرعاية" : "Care Plan"}
          </TabsTrigger>
          <TabsTrigger value="education">
            <CalendarDays className="h-4 w-4 ml-1" />{" "}
            {ar ? "تعليم وأنشطة" : "Education"}
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 ml-1" />{" "}
            {ar ? "المستندات" : "Documents"}
          </TabsTrigger>
          <TabsTrigger value="financial">
            <WalletMinimal className="h-4 w-4 ml-1" />{" "}
            {ar ? "مالية وإدارية" : "Financial"}
          </TabsTrigger>
          <TabsTrigger value="communication">
            <MessagesSquare className="h-4 w-4 ml-1" />{" "}
            {ar ? "تواصل وملاحظات" : "Communication"}
          </TabsTrigger>
          <TabsTrigger value="emergency">
            <LifeBuoy className="h-4 w-4 ml-1" /> {ar ? "الطوارئ" : "Emergency"}
          </TabsTrigger>
          <TabsTrigger value="history">
            <ClipboardList className="h-4 w-4 ml-1" />{" "}
            {ar ? "السجل" : "History"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "البيانات الشخصية والتعريف" : "Personal & Identification"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "معلومات الاتصال وولي الأمر"
                  : "Contact and guardian details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {ar ? "الهاتف" : "Phone"}:
                  </span>
                  {edit ? (
                    <Input
                      className="h-8"
                      defaultValue={b.contact.phone}
                      onChange={(e) => (b.contact.phone = e.target.value)}
                    />
                  ) : (
                    b.contact.phone
                  )}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">Email:</span>
                  {edit ? (
                    <Input
                      className="h-8"
                      defaultValue={b.contact.email}
                      onChange={(e) => (b.contact.email = e.target.value)}
                    />
                  ) : (
                    b.contact.email || (ar ? "غير متوفر" : "Not provided")
                  )}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {ar ? "العنوان" : "Address"}:
                  </span>
                  {edit ? (
                    <Input
                      className="h-8"
                      defaultValue={b.contact.address}
                      onChange={(e) => (b.contact.address = e.target.value)}
                    />
                  ) : (
                    b.contact.address || (ar ? "غير متوفر" : "Not provided")
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {ar ? "ولي الأمر" : "Guardian"}:
                  </span>
                  {edit ? (
                    <>
                      <Input
                        className="h-8 w-48"
                        defaultValue={b.guardian.name}
                        onChange={(e) => (b.guardian.name = e.target.value)}
                      />{" "}(
                      <Input
                        className="h-8 w-40"
                        defaultValue={b.guardian.relation}
                        onChange={(e) => (b.guardian.relation = e.target.value)}
                      />
                      )
                    </>
                  ) : (
                    <>
                      {b.guardian.name} ({b.guardian.relation})
                    </>
                  )}
                </div>
                <div className="text-sm flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {ar ? "هاتف ولي الأمر" : "Guardian Phone"}:
                  </span>
                  {edit ? (
                    <Input
                      className="h-8"
                      defaultValue={b.guardian.phone}
                      onChange={(e) => (b.guardian.phone = e.target.value)}
                    />
                  ) : (
                    b.guardian.phone
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>{ar?"حقول إضافية":"Custom Fields"}</CardTitle>
              <CardDescription>{ar?"تُدار من إعدادات المستفيد":"Managed in Beneficiary Settings"}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              {settings.customFields.map((f)=> (
                <div key={f.id} className="text-sm">
                  <div className="text-muted-foreground mb-1">{f.label}</div>
                  {f.type === "select" ? (
                    edit ? (
                      <Select defaultValue={String(b.extra?.[f.key]||"")} onValueChange={(v)=>{ b.extra = { ...(b.extra||{}), [f.key]: v }; }}>
                        <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(f.options||[]).map(o=> (<SelectItem key={o} value={o}>{o}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div>{String(b.extra?.[f.key] || (ar?"—":"—"))}</div>
                    )
                  ) : (
                    edit ? (
                      <Input className="h-8" defaultValue={String(b.extra?.[f.key]||"")} onChange={(e)=>{ b.extra = { ...(b.extra||{}), [f.key]: e.target.value }; }} />
                    ) : (
                      <div>{String(b.extra?.[f.key] || (ar?"—":"—"))}</div>
                    )
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "المعلومات الطبية والإعاقة" : "Medical & Disability"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "تشخيصات، علاجات، أدوية وحساسية"
                  : "Diagnoses, treatments, medications, allergies"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "التاريخ" : "History"}:
                  </span>{" "}
                  {b.medical.history || (ar ? "غير متوفر" : "Not provided")}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "التشخيصات" : "Diagnoses"}:
                  </span>{" "}
                  {b.medical.diagnoses?.join(", ") || (ar ? "لا يوجد" : "None")}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "العلاجات" : "Treatments"}:
                  </span>{" "}
                  {b.medical.treatments?.join(", ") ||
                    (ar ? "لا يوجد" : "None")}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "الأدوية" : "Medications"}:
                  </span>{" "}
                  {b.medical.medications && b.medical.medications.length
                    ? ""
                    : ar
                      ? "لا يوجد"
                      : "None"}
                </div>
                {b.medical.medications?.map((m) => (
                  <div key={m.name} className="text-sm pl-3">
                    • {m.name} — {m.dosage} ({m.schedule})
                  </div>
                ))}
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "الحساسية" : "Allergies"}:
                  </span>{" "}
                  {b.medical.allergies?.join(", ") || (ar ? "لا يوجد" : "None")}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="care" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "خطة الرعاية والخدمات" : "Care & Service Plan"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "أهداف مخصصة، تقدم، وجدول الجلسات"
                  : "Personalized goals, progress, session schedule"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm flex items-center gap-2 flex-wrap">
                <span className="text-muted-foreground">
                  {ar ? "الطبيب" : "Doctor"}:
                </span>{" "}
                {edit ? (
                  <Input
                    className="h-8 w-48"
                    defaultValue={b.care.assignedDoctor}
                    onChange={(e) => (b.care.assignedDoctor = e.target.value)}
                  />
                ) : (
                  b.care.assignedDoctor || (ar ? "غير محدد" : "Unassigned")
                )}
                <span>·</span>
                <span className="text-muted-foreground">
                  {ar ? "المعالج" : "Therapist"}:
                </span>{" "}
                {edit ? (
                  <Input
                    className="h-8 w-48"
                    defaultValue={b.care.assignedTherapist}
                    onChange={(e) =>
                      (b.care.assignedTherapist = e.target.value)
                    }
                  />
                ) : (
                  b.care.assignedTherapist || (ar ? "غير محدد" : "Unassigned")
                )}
              </div>
              <div>
                <div className="font-medium mb-2 flex items-center gap-2">
                  {ar ? "الأهداف" : "Goals"}
                  {edit && (
                    <>
                      <Input className="h-8 w-56" placeholder={ar?"أضف هدفاً":"Add goal"} onKeyDown={(e)=>{ if(e.key==="Enter"){ const v=(e.target as HTMLInputElement).value.trim(); if(v){ b.care.goals.push(v); (e.target as HTMLInputElement).value=""; }}}} />
                      <Select onValueChange={(id)=>{ const tpl = settings.carePlanTemplates.find(t=>t.id===id); if(tpl){ tpl.goals.forEach(g=>{ if(!b.care.goals.includes(g)) b.care.goals.push(g); }); toast.success(ar?"تم تطبيق القالب":"Template applied"); } }}>
                        <SelectTrigger className="h-8 w-56"><SelectValue placeholder={ar?"تطبيق قالب":"Apply template"} /></SelectTrigger>
                        <SelectContent>
                          {settings.carePlanTemplates.map(t=>(<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </>
                  )}
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {b.care.goals.map((g,idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="flex-1">{g}</span>
                      {edit && (<Button size="sm" variant="ghost" onClick={()=>{ b.care.goals = b.care.goals.filter((x)=>x!==g); }}>{