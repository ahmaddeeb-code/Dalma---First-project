import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeBeneficiarySettings, getBeneficiarySettings, previewNextBeneficiaryId, generateNextBeneficiaryId } from "@/store/beneficiary-settings";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getLocale } from "@/i18n";
import {
  Beneficiary,
  DisabilityType,
  DocumentItem,
  newBeneficiary,
  upsertBeneficiary,
} from "@/store/beneficiaries";
import { getCurrentUserId } from "@/store/auth";

export type AddEditDialogProps = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Beneficiary | null;
};

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddEditBeneficiaryDialog({
  open,
  onOpenChange,
  initial,
}: AddEditDialogProps) {
  const ar = getLocale() === "ar";
  const settings = useSyncExternalStore(
    (cb) => subscribeBeneficiarySettings(cb),
    () => getBeneficiarySettings(),
    () => getBeneficiarySettings(),
  );
  const [name, setName] = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dob, setDob] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [custom, setCustom] = useState<Record<string,string>>({});
  const [civilId, setCivilId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [disability, setDisability] = useState<DisabilityType>("physical");
  const [history, setHistory] = useState("");
  const [doctor, setDoctor] = useState("");
  const [therapist, setTherapist] = useState("");
  const [goals, setGoals] = useState("");
  const [progress, setProgress] = useState<number>(0);
  const [programs, setPrograms] = useState("");
  const [activities, setActivities] = useState("");
  const [sponsorship, setSponsorship] = useState("");
  const [supportPrograms, setSupportPrograms] = useState("");
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<string>("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    if (open) {
      if (initial) {
        setName(initial.name || "");
        setGender(initial.gender);
        setDob(initial.dob);
        setBeneficiaryId(initial.beneficiaryId);
        setCivilId(initial.civilId);
        setCustom((initial as any).extra || {});
        setPhone(initial.contact.phone || "");
        setEmail(initial.contact.email || "");
        setAddress(initial.contact.address || "");
        setGuardianName(initial.guardian.name || "");
        setGuardianRelation(initial.guardian.relation || "");
        setGuardianPhone(initial.guardian.phone || "");
        setDisability(initial.medical.disabilityType);
        setHistory(initial.medical.history || "");
        setDoctor(initial.care.assignedDoctor || "");
        setTherapist(initial.care.assignedTherapist || "");
        setGoals(initial.care.goals.join(", "));
        setProgress(initial.care.progress || 0);
        setPrograms(initial.education.programs.join(", "));
        setActivities(initial.education.activities.join(", "));
        setSponsorship(initial.financial.sponsorship || "");
        setSupportPrograms(
          (initial.financial.supportPrograms || []).join(", "),
        );
        setEmergencyNotes(initial.emergency.notes || "");
        setEmergencyContacts(
          initial.emergency.contacts
            .map((c) => `${c.name}:${c.relation}:${c.phone}`)
            .join("\n"),
        );
        setPhotoDataUrl(initial.photoUrl);
        setDocs(initial.documents);
      } else {
        setName("");
        setGender("male");
        setDob("");
        setBeneficiaryId(previewNextBeneficiaryId());
        setCivilId("");
        setCustom({});
        setPhone("");
        setEmail("");
        setAddress("");
        setGuardianName("");
        setGuardianRelation("");
        setGuardianPhone("");
        setDisability("physical");
        setHistory("");
        setDoctor("");
        setTherapist("");
        setGoals("");
        setProgress(0);
        setPrograms("");
        setActivities("");
        setSponsorship("");
        setSupportPrograms("");
        setEmergencyNotes("");
        setEmergencyContacts("");
        setPhotoDataUrl(undefined);
        setDocs([]);
      }
    }
  }, [open, initial]);

  const valid = useMemo(() => {
    const r = settings.required;
    const base = (
      (!r.name || name.trim().length > 0) &&
      (!r.dob || dob.trim().length > 0) &&
      beneficiaryId.trim().length > 0 &&
      (!r.civilId || civilId.trim().length > 0) &&
      (!r.gender || !!gender) &&
      (!r.guardianName || guardianName.trim().length > 0) &&
      (!r.guardianPhone || guardianPhone.trim().length > 0)
    );
    const customsOk = (settings.customFields || []).every((f:any) => !f.required || (custom[f.key] && custom[f.key]!.trim().length>0));
    return base && customsOk;
  }, [name, dob, beneficiaryId, civilId, phone, guardianName, guardianPhone, settings, custom, gender]);

  async function onPhotoChange(f: File | null) {
    if (!f) return;
    const url = await readFileAsDataURL(f);
    setPhotoDataUrl(url);
  }

  async function onDocsChange(files: FileList | null) {
    if (!files) return;
    const list: DocumentItem[] = [];
    for (const f of Array.from(files)) {
      const url = await readFileAsDataURL(f);
      list.push({
        id: `${Date.now()}_${f.name}`.replace(/\s+/g, "_"),
        type: f.type || "Attachment",
        title: f.name,
        url,
        issuedAt: new Date().toISOString(),
      });
    }
    setDocs((prev) => [...list, ...prev]);
  }

  function onSave() {
    if (!valid) {
      toast.error(
        ar ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields",
      );
      return;
    }
    const base = initial
      ? { ...initial }
      : newBeneficiary({ name, gender, dob, beneficiaryId, civilId });
    base.name = name;
    base.gender = gender;
    base.dob = dob;
    base.beneficiaryId = initial ? beneficiaryId : (beneficiaryId || generateNextBeneficiaryId());
    base.civilId = civilId;
    (base as any).extra = custom;
    base.contact = { phone, email, address };
    base.guardian = {
      name: guardianName,
      relation: guardianRelation,
      phone: guardianPhone,
    };
    base.medical = { ...base.medical, disabilityType: disability, history };
    base.care = {
      ...base.care,
      assignedDoctor: doctor,
      assignedTherapist: therapist,
      goals: goals
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      progress,
    };
    base.education = {
      programs: programs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      activities: activities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    base.financial = {
      ...base.financial,
      sponsorship,
      supportPrograms: supportPrograms
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    base.emergency = {
      contacts: emergencyContacts
        .split("\n")
        .map((line) => {
          const [n, r, p] = line.split(":");
          return n && r && p
            ? { name: n.trim(), relation: r.trim(), phone: p.trim() }
            : null;
        })
        .filter(Boolean) as any[],
      notes: emergencyNotes,
    };
    base.photoUrl = photoDataUrl || base.photoUrl;
    base.documents = docs;

    if (!initial) {
      const entry = {
        id: `${Date.now()}`,
        at: new Date().toISOString(),
        userId: getCurrentUserId() || "system",
        action: "create",
        patch: { name: base.name },
      } as any;
      base.audit = [...(base.audit || []), entry];
    }

    upsertBeneficiary(base);
    toast.success(
      ar
        ? initial
          ? "تم تحديث المستفيد"
          : "تم إضافة مستفيد"
        : initial
          ? "Beneficiary updated"
          : "Beneficiary added",
    );
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {ar
              ? initial
                ? "تعديل مستفيد"
                : "إضافة مستفيد"
              : initial
                ? "Edit Beneficiary"
                : "Add Beneficiary"}
          </DialogTitle>
          <DialogDescription>
            {ar
              ? "أدخل البيانات المطلوبة. الحقول الأساسية مطلوبة."
              : "Enter the required information. Required fields must be filled."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{ar ? "الاسم" : "Name"} *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "الجنس" : "Gender"}</Label>
            <Select value={gender} onValueChange={(v) => setGender(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(settings.lists.gender || ["male","female"]).map((g:string)=> (
                  <SelectItem key={g} value={g as any}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{ar ? "تاريخ الميلاد" : "Date of Birth"} *</Label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "رق�� المستفيد" : "Beneficiary ID"} *</Label>
            <Input
              value={beneficiaryId}
              onChange={(e) => setBeneficiaryId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">{ar?"تلقائي حسب الإعدادات":"Auto-generated per settings"}</p>
          </div>
          <div className="space-y-2">
            <Label>{ar ? "السجل المدني" : "Civil Registry"} *</Label>
            <Input
              value={civilId}
              onChange={(e) => setCivilId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "الهاتف" : "Phone"} *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{ar ? "العنوان" : "Address"}</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{ar ? "ا��م ولي الأمر" : "Guardian Name"} *</Label>
            <Input
              value={guardianName}
              onChange={(e) => setGuardianName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "صلة القرابة" : "Relation"}</Label>
            <Input
              value={guardianRelation}
              onChange={(e) => setGuardianRelation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "هاتف ولي الأمر" : "Guardian Phone"} *</Label>
            <Input
              value={guardianPhone}
              onChange={(e) => setGuardianPhone(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{ar ? "نوع الإعاقة" : "Disability"}</Label>
            <Select
              value={disability}
              onValueChange={(v) => setDisability(v as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="physical">
                  {ar ? "حركية" : "Physical"}
                </SelectItem>
                <SelectItem value="intellectual">
                  {ar ? "ذهنية" : "Intellectual"}
                </SelectItem>
                <SelectItem value="sensory">
                  {ar ? "حسية" : "Sensory"}
                </SelectItem>
                <SelectItem value="autism">{ar ? "توحد" : "Autism"}</SelectItem>
                <SelectItem value="multiple">
                  {ar ? "متعددة" : "Multiple"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>{ar ? "تا��يخ طبي" : "Medical History"}</Label>
            <Textarea
              value={history}
              onChange={(e) => setHistory(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "الطبيب" : "Doctor"}</Label>
            <Input value={doctor} onChange={(e) => setDoctor(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "المعالج" : "Therapist"}</Label>
            <Input
              value={therapist}
              onChange={(e) => setTherapist(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>
              {ar ? "الأهداف (افصلها بفاصلة)" : "Goals (comma separated)"}
            </Label>
            <Input value={goals} onChange={(e) => setGoals(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "التقدم %" : "Progress %"}</Label>
            <Input
              type="number"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {ar ? "البرامج (بفواصل)" : "Programs (comma separated)"}
            </Label>
            <Input
              value={programs}
              onChange={(e) => setPrograms(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {ar ? "الأنشطة (بفواصل)" : "Activities (comma separated)"}
            </Label>
            <Input
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{ar ? "الراعي" : "Sponsorship"}</Label>
            <Input
              value={sponsorship}
              onChange={(e) => setSponsorship(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>
              {ar
                ? "برامج الدعم (بفواصل)"
                : "Support Programs (comma separated)"}
            </Label>
            <Input
              value={supportPrograms}
              onChange={(e) => setSupportPrograms(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>{ar ? "ملاحظات الطوارئ" : "Emergency Notes"}</Label>
            <Textarea
              value={emergencyNotes}
              onChange={(e) => setEmergencyNotes(e.target.value)}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>
              {ar
                ? "جهات الطوارئ (اسم:صلة:هاتف \n لكل سطر)"
                : "Emergency Contacts (Name:Relation:Phone per line)"}
            </Label>
            <Textarea
              value={emergencyContacts}
              onChange={(e) => setEmergencyContacts(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{ar ? "صورة الملف" : "Profile Photo"}</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => onPhotoChange(e.target.files?.[0] || null)}
            />
            {photoDataUrl ? (
              <img
                src={photoDataUrl}
                alt="photo"
                className="h-20 w-20 object-cover rounded-md"
              />
            ) : null}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>
              {ar ? "مرفقات (PDF/صور)" : "Attachments (PDF/Images)"}
            </Label>
            <Input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => onDocsChange(e.target.files)}
            />
            <div className="text-xs text-muted-foreground">
              {ar
                ? "سيتم حفظ الملفات كمرفقات داخلية"
                : "Files will be stored as inline attachments"}
            </div>
            <ul className="text-sm list-disc pl-5">
              {docs.map((d) => (
                <li key={d.id}>{d.title}</li>
              ))}
            </ul>
          </div>
        </div>

        {settings.customFields?.length ? (
          <div className="mt-4">
            <Label>{ar?"حقول إضافية":"Additional Fields"}</Label>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              {settings.customFields.map((f:any) => (
                <div key={f.id} className="space-y-1">
                  <Label>{f.label}{f.required?" *":""}</Label>
                  {f.type === "select" ? (
                    <select className="w-full h-9 rounded-md border bg-background px-3 text-sm" value={custom[f.key] || ""} onChange={(e)=>setCustom({ ...custom, [f.key]: e.target.value })}>
                      <option value="">—</option>
                      {(f.options || []).map((o:string)=>(<option key={o} value={o}>{o}</option>))}
                    </select>
                  ) : (
                    <Input value={custom[f.key] || ""} onChange={(e)=>setCustom({ ...custom, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {ar ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={onSave} disabled={!valid}>
            {ar ? "حفظ" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
