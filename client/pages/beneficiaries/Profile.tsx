import { Link, useParams } from "react-router-dom";
import { useMemo, useSyncExternalStore, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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

export default function BeneficiaryProfile() {
  const { id } = useParams();
  const b = useBeneficiary(id);
  const ar = getLocale() === "ar";
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
                <span>
                  {ar ? "الجنس" : "Gender"}:{" "}
                  {b.gender === "male"
                    ? ar
                      ? "ذكر"
                      : "Male"
                    : ar
                      ? "أنثى"
                      : "Female"}
                </span>
                <span>
                  {ar ? "الإعاقة" : "Disability"}:{" "}
                  {
                    {
                      physical: ar ? "حركية" : "Physical",
                      intellectual: ar ? "ذهنية" : "Intellectual",
                      sensory: ar ? "حسية" : "Sensory",
                      autism: ar ? "توحد" : "Autism",
                      multiple: ar ? "متعددة" : "Multiple",
                    }[b.medical.disabilityType]
                  }
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

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="personal">
            <Home className="h-4 w-4 ml-1" />{" "}
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
            <ClipboardList className="h-4 w-4 ml-1" /> {ar ? "السجل" : "History"}
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
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "الهاتف" : "Phone"}:
                  </span>{" "}
                  {b.contact.phone}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{" "}
                  {b.contact.email || (ar ? "غير متوفر" : "Not provided")}
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "العنوان" : "Address"}:
                  </span>{" "}
                  {b.contact.address || (ar ? "غير متوف��" : "Not provided")}
                </div>
              </div>
              <div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "ولي الأمر" : "Guardian"}:
                  </span>{" "}
                  {b.guardian.name} ({b.guardian.relation})
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">
                    {ar ? "هاتف ولي الأمر" : "Guardian Phone"}:
                  </span>{" "}
                  {b.guardian.phone}
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
              <div>
                <div className="font-medium mb-2">
                  {ar ? "الأهداف" : "Goals"}
                </div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {b.care.goals.map((g) => (
                    <li key={g}>{g}</li>
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
                <div className="font-medium mb-2">
                  {ar ? "جدول الجلسات" : "Appointments"}
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
                      <TableCell>{d.title}</TableCell>
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
      </Tabs>
    </div>
  );
}
