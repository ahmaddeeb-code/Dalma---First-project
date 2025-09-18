import { Link, useParams } from "react-router-dom";
import { useMemo, useSyncExternalStore, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  HeartPulse,
  Home,
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

      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <User2 className="h-6 w-6" />
              </AvatarFallback>
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
                  {ar ? "الم��الج" : "Therapist"}:
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

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="personal">
            <Home className="h-4 w-4 ml-1" />{" "}
            {ar ? "البيانات الشخص��ة" : "Personal"}
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
                      />{" "}
                      (
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
                    {ar ? "الحساسي��" : "Allergies"}:
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
                      {edit && (<Button size="sm" variant="ghost" onClick={()=>{ b.care.goals = b.care.goals.filter((x)=>x!==g); }}>{"✕"}</Button>)}
                    </li>
                  ))}
                  {b.care.goals.length === 0 && (
                    <li className="text-muted-foreground">
                      {ar ? "لا يوجد" : "None"}
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-2">
                  {ar ? "نسبة التقدم" : "Progress"}
                </div>
                <div className="w-full h-3 bg-muted rounded">
                  <div
                    className="h-3 bg-primary rounded"
                    style={{ width: `${b.care.progress}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {b.care.progress}%
                </div>
              </div>
              <div>
                <div className="font-medium mb-2 flex items-center gap-2">
                  {ar ? "جدول الجلسات" : "Appointments"}
                  {edit && (
                    <>
                      <Input className="h-8 w-36" placeholder={ar?"النوع":"Type"} onChange={(e)=>((window as any)._apType=e.target.value)} />
                      <Input className="h-8 w-52" type="datetime-local" onChange={(e)=>((window as any)._apDate=e.target.value)} />
                      <Input className="h-8 w-40" placeholder={ar?"المعالج":"Therapist"} onChange={(e)=>((window as any)._apTher=e.target.value)} />
                      <Button size="sm" onClick={()=>{ const t=(window as any)._apType||"Session"; const d=(window as any)._apDate||new Date().toISOString(); const th=(window as any)._apTher; b.care.appointments.push({ id: String(Date.now()), type: t, date: d, therapist: th }); toast.success(ar?"تمت الإضافة":"Added"); }}>
                        {ar?"إضافة":"Add"}
                      </Button>
                    </>
                  )}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{ar ? "النوع" : "Type"}</TableHead>
                      <TableHead>{ar ? "التاريخ" : "Date"}</TableHead>
                      <TableHead>{ar ? "المعالج" : "Therapist"}</TableHead>
                      <TableHead>{ar ? "الحضور" : "Attendance"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {b.care.appointments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.type}</TableCell>
                        <TableCell>
                          {new Date(a.date).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {a.therapist || (ar ? "غير محدد" : "Unassigned")}
                        </TableCell>
                        <TableCell>
                          {a.attended === true
                            ? ar
                              ? "حضر"
                              : "Present"
                            : a.attended === false
                              ? ar
                                ? "غاب"
                                : "Missed"
                              : ar
                                ? "—"
                                : "—"}
                        </TableCell>
                        {edit && (
                          <TableCell className="text-right">
                            <Button size="sm" variant="ghost" onClick={()=>{ b.care.appointments = b.care.appointments.filter(x=>x.id!==a.id); }}>{ar?"حذف":"Delete"}</Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="education" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "التعليم والأنشطة" : "Education & Activities"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "البرامج الملتحق بها والأنشطة"
                  : "Enrolled programs and activities"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">
                  {ar ? "البرامج" : "Programs"}
                </div>
                {edit && (
                  <div className="flex items-center gap-2 mb-2">
                    <Select onValueChange={(v)=>{ if(v && !b.education.programs.includes(v)) b.education.programs.push(v); }}>
                      <SelectTrigger className="h-8 w-56"><SelectValue placeholder={ar?"إضافة برنامج":"Add program"} /></SelectTrigger>
                      <SelectContent>
                        {settings.lists.supportPrograms.map((p)=>(<SelectItem key={p} value={p}>{p}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <ul className="list-disc pl-5 space-y-1">
                  {b.education.programs.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                  {b.education.programs.length === 0 && (
                    <li className="text-muted-foreground">
                      {ar ? "لا يوجد" : "None"}
                    </li>
                  )}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">
                  {ar ? "الأنشطة" : "Activities"}
                </div>
                {edit && (
                  <div className="flex items-center gap-2 mb-2">
                    <Input className="h-8 w-56" placeholder={ar?"إضافة نشاط":"Add activity"} onKeyDown={(e)=>{ if(e.key==="Enter"){ const v=(e.target as HTMLInputElement).value.trim(); if(v){ b.education.activities.push(v); (e.target as HTMLInputElement).value=""; }}}} />
                  </div>
                )}
                <ul className="list-disc pl-5 space-y-1">
                  {b.education.activities.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                  {b.education.activities.length === 0 && (
                    <li className="text-muted-foreground">
                      {ar ? "لا يوجد" : "None"}
                    </li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "المستندات والمرفقات" : "Documents & Attachments"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "تقارير طبية وشهادات وإفادات"
                  : "Medical reports, certificates, prescriptions"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canEdit && (
                <div className="mb-3 grid gap-2">
                  <div className="flex items-center gap-2">
                    <Select onValueChange={(v)=>((window as any)._docType=v)}>
                      <SelectTrigger className="h-8 w-56"><SelectValue placeholder={ar?"نوع المستند":"Document type"} /></SelectTrigger>
                      <SelectContent>
                        {settings.documentCategories.map((c)=>(<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Input className="h-8 w-56" placeholder={ar?"العنوان":"Title"} onChange={(e)=>((window as any)._docTitle=e.target.value)} />
                    <Input className="h-8" type="date" onChange={(e)=>((window as any)._docIssued=e.target.value)} />
                    <Input className="h-8" type="date" onChange={(e)=>((window as any)._docExp=e.target.value)} />
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-2">
                    <UploadCloud className="h-4 w-4" /> {ar?"رفع ملف":"Upload file"}
                    <Input
                      type="file"
                      accept="image/*,application/pdf"
                      multiple
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (!files || !b) return;
                        for (const f of Array.from(files)) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            addDocument(
                              b.id,
                              {
                                id: `${Date.now()}_${f.name}`.replace(
                                  /\s+/g,
                                  "_",
                                ),
                                type: f.type || "Attachment",
                                title: f.name,
                                url: reader.result as string,
                                issuedAt: new Date().toISOString(),
                              },
                              getCurrentUserId() || undefined,
                            );
                          };
                          reader.readAsDataURL(f);
                        }
                        toast.success(
                          ar ? "تمت إضافة المرفقات" : "Attachments added",
                        );
                      }}
                    />
                  </label>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ar ? "النوع" : "Type"}</TableHead>
                    <TableHead>{ar ? "العنوان" : "Title"}</TableHead>
                    <TableHead>{ar ? "تاريخ الإصدار" : "Issued"}</TableHead>
                    <TableHead>{ar ? "تاريخ الانتهاء" : "Expires"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {b.documents.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>
                        <a
                          className="underline"
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {d.title}
                        </a>
                      </TableCell>
                      <TableCell>
                        {d.issuedAt
                          ? new Date(d.issuedAt).toLocaleDateString()
                          : ar
                            ? "—"
                            : "—"}
                      </TableCell>
                      <TableCell>
                        {d.expiresAt ? (
                          <span>
                            {new Date(d.expiresAt).toLocaleDateString()}{" "}
                            {new Date(d.expiresAt) < new Date() ? (
                              <Badge className="ml-2 bg-destructive text-destructive-foreground">
                                {ar ? "منتهي" : "Expired"}
                              </Badge>
                            ) : null}
                          </span>
                        ) : ar ? (
                          "—"
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "معلومات مالية وإ��ارية" : "Financial & Administrative"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "الرعايات والدفعات والبرامج"
                  : "Sponsorships, payments, support programs"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div>
                  <span className="text-muted-foreground">
                    {ar ? "الرعاية" : "Sponsorship"}:
                  </span>{" "}
                  {b.financial.sponsorship || (ar ? "لا يوجد" : "None")}
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {ar ? "البرامج الداعمة" : "Support Programs"}:
                  </span>{" "}
                  {b.financial.supportPrograms?.join(", ") ||
                    (ar ? "لا يوجد" : "None")}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">
                  {ar ? "سجل الدفعات" : "Payment History"}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{ar ? "التاريخ" : "Date"}</TableHead>
                      <TableHead>{ar ? "المبلغ" : "Amount"}</TableHead>
                      <TableHead>{ar ? "الطريقة" : "Method"}</TableHead>
                      <TableHead>{ar ? "ملاحظة" : "Note"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {b.financial.paymentHistory.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          {new Date(p.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{p.amount.toLocaleString()}</TableCell>
                        <TableCell>{p.method}</TableCell>
                        <TableCell>{p.note || (ar ? "—" : "—")}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "التواصل والملاحظات" : "Communication & Feedback"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "رسائل بين الموظفين والأوصياء"
                  : "Messages between staff and guardians"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {b.communication.messages.map((m) => (
                  <li key={m.id} className="flex items-start gap-2">
                    <Badge
                      variant={m.from === "system" ? "secondary" : "outline"}
                    >
                      {m.from}
                    </Badge>
                    <div>
                      <div>{m.content}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(m.date).toLocaleString()}
                      </div>
                    </div>
                  </li>
                ))}
                {b.communication.messages.length === 0 && (
                  <li className="text-muted-foreground">
                    {ar ? "لا توجد رسائل" : "No messages"}
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {ar ? "معلومات الطوارئ" : "Emergency Information"}
              </CardTitle>
              <CardDescription>
                {ar
                  ? "جهات اتصال وملاحظات طبية حرجة"
                  : "Emergency contacts and critical notes"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium mb-1">
                  {ar ? "جهات الاتصال" : "Contacts"}
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {b.emergency.contacts.map((c, i) => (
                    <li key={i}>
                      {c.name} ({c.relation}) — {c.phone}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">
                  {ar ? "ملاحظات" : "Notes"}
                </div>
                <p>{b.emergency.notes || (ar ? "لا يوجد" : "None")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{ar ? "سجل التعديلات" : "Edit History"}</CardTitle>
              <CardDescription>
                {ar
                  ? "ت��قب التعديلات للمراجعة"
                  : "Audit trail for accountability"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                {(b.audit || [])
                  .slice()
                  .reverse()
                  .map((a) => (
                    <li
                      key={a.id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {new Date(a.at).toLocaleString()} — {a.action}
                      </span>
                      <span className="text-muted-foreground">{a.userId}</span>
                    </li>
                  ))}
                {(b.audit || []).length === 0 && (
                  <li className="text-muted-foreground">
                    {ar ? "لا يوجد سجل" : "No history"}
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
