import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
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
import {
  subscribeBeneficiarySettings,
  getBeneficiarySettings,
  previewNextBeneficiaryId,
  generateNextBeneficiaryId,
} from "@/store/beneficiary-settings";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  listFamilies,
  subscribeFamilies,
  upsertFamily,
  uid as familyUid,
  type Family,
  linkBeneficiary,
  unlinkBeneficiary,
} from "@/store/families";

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

function useFamilies() {
  return useSyncExternalStore(
    (cb) => subscribeFamilies(cb),
    () => listFamilies(),
    () => listFamilies(),
  );
}

function splitSaudiName(full: string) {
  const parts = (full || "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0] || "";
  const father = parts[1] || "";
  const grandfather = parts[2] || "";
  const family = parts[3] || "";
  const tribe = parts.slice(4).join(" ") || "";
  return { first, father, grandfather, family, tribe };
}
function combineName(
  first: string,
  father: string,
  grandfather: string,
  family: string,
  tribe: string,
) {
  return [first, father, grandfather, family, tribe]
    .map((s) => s?.trim())
    .filter(Boolean)
    .join(" ");
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
  const families = useFamilies();

  // Name (Saudi structure)
  const [firstName, setFirstName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [grandfatherName, setGrandfatherName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [tribeName, setTribeName] = useState("");

  // Family link
  const [familyPickerOpen, setFamilyPickerOpen] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<string>("");
  const [createFamilyOpen, setCreateFamilyOpen] = useState(false);

  // Basics
  const [gender, setGender] = useState<"male" | "female">("male");
  const [dob, setDob] = useState("");
  const [beneficiaryId, setBeneficiaryId] = useState("");
  const [custom, setCustom] = useState<Record<string, string>>({});
  const [civilId, setCivilId] = useState("");

  // Contact
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  // Guardian
  const [guardianName, setGuardianName] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");

  // Medical/Care/Education
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

  // Emergency/Attachments
  const [emergencyNotes, setEmergencyNotes] = useState("");
  const [emergencyContacts, setEmergencyContacts] = useState<string>("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | undefined>();
  const [docs, setDocs] = useState<DocumentItem[]>([]);

  useEffect(() => {
    if (open) {
      if (initial) {
        const parts = splitSaudiName(initial.name || "");
        setFirstName(parts.first);
        setFatherName(parts.father);
        setGrandfatherName(parts.grandfather);
        setFamilyName(parts.family);
        setTribeName(parts.tribe);

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
        // Preselect family link if any
        const linked = families.find((f) =>
          (f.links || []).some((l) => l.beneficiaryId === initial.id),
        );
        setSelectedFamilyId(linked?.id || "");
      } else {
        setFirstName("");
        setFatherName("");
        setGrandfatherName("");
        setFamilyName("");
        setTribeName("");
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
        setSelectedFamilyId("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const valid = useMemo(() => {
    const r = settings.required;
    const hasName =
      combineName(
        firstName,
        fatherName,
        grandfatherName,
        familyName,
        tribeName,
      ).trim().length > 0;
    const base =
      (!r.name || hasName) &&
      (!r.dob || dob.trim().length > 0) &&
      beneficiaryId.trim().length > 0 &&
      (!r.civilId || civilId.trim().length > 0) &&
      (!r.gender || !!gender) &&
      (!r.guardianName || guardianName.trim().length > 0) &&
      (!r.guardianPhone || guardianPhone.trim().length > 0);
    const customsOk = (settings.customFields || []).every(
      (f: any) =>
        !f.required || (custom[f.key] && custom[f.key]!.trim().length > 0),
    );
    return base && customsOk;
  }, [
    firstName,
    fatherName,
    grandfatherName,
    familyName,
    tribeName,
    dob,
    beneficiaryId,
    civilId,
    phone,
    guardianName,
    guardianPhone,
    settings,
    custom,
    gender,
  ]);

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
    const fullName = combineName(
      firstName,
      fatherName,
      grandfatherName,
      familyName,
      tribeName,
    );
    const base = initial
      ? { ...initial }
      : newBeneficiary({ name: fullName, gender, dob, beneficiaryId, civilId });
    base.name = fullName;
    base.gender = gender;
    base.dob = dob;
    base.beneficiaryId = initial
      ? beneficiaryId
      : beneficiaryId || generateNextBeneficiaryId();
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

    // Manage family links
    try {
      if (selectedFamilyId) {
        // unlink from any other families first
        const all = listFamilies();
        for (const f of all) {
          if (
            f.id !== selectedFamilyId &&
            (f.links || []).some((l) => l.beneficiaryId === base.id)
          ) {
            unlinkBeneficiary(f.id, base.id);
          }
        }
        linkBeneficiary(selectedFamilyId, base.id);
      }
    } catch {}

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

  const selectedFamily = useMemo(
    () => families.find((f) => f.id === selectedFamilyId) || null,
    [families, selectedFamilyId],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
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

        <Tabs defaultValue="identity" className="mt-2">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="identity">
              {ar ? "الهوية" : "Identity"}
            </TabsTrigger>
            <TabsTrigger value="contact">
              {ar ? "التواصل" : "Contact"}
            </TabsTrigger>
            <TabsTrigger value="care">{ar ? "الرعاية" : "Care"}</TabsTrigger>
            <TabsTrigger value="education">
              {ar ? "التعليم" : "Education"}
            </TabsTrigger>
            <TabsTrigger value="emergency">
              {ar ? "الطوارئ" : "Emergency"}
            </TabsTrigger>
            <TabsTrigger value="attachments">
              {ar ? "المرفقات" : "Attachments"}
            </TabsTrigger>
            {settings.customFields?.length ? (
              <TabsTrigger value="custom">
                {ar ? "حقول إضافية" : "Custom Fields"}
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="identity" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label requiredMark>{ar ? "رقم المستفيد" : "Beneficiary ID"}</Label>
                <Input
                  value={beneficiaryId}
                  onChange={(e) => setBeneficiaryId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  {ar ? "تلقائي حسب الإعدادات" : "Auto-generated per settings"}
                </p>
              </div>
              <div className="space-y-2">
                <Label requiredMark>{ar ? "السجل المدني" : "Civil Registry"}</Label>
                <Input
                  value={civilId}
                  onChange={(e) => setCivilId(e.target.value)}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label requiredMark={settings.required?.gender}>{ar ? "الجنس" : "Gender"}</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  {(settings.lists.gender || ["male", "female"]).map(
                    (g: string) => (
                      <option key={g} value={g as any}>
                        {g}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <Label requiredMark={settings.required?.dob}>{ar ? "تاريخ الميلاد" : "Date of Birth"}</Label>
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label requiredMark={settings.required?.name}>
                {ar ? "الاسم وفق الصيغة السعودية" : "Name (Saudi format)"}
              </Label>
              <div className="grid md:grid-cols-3 gap-3 mt-2">
                <Input
                  placeholder={ar ? "الاسم الأول" : "First Name"}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <Input
                  placeholder={ar ? "اسم الأب" : "Father’s Name"}
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                />
                <Input
                  placeholder={ar ? "اسم الجد" : "Grandfather’s Name"}
                  value={grandfatherName}
                  onChange={(e) => setGrandfatherName(e.target.value)}
                />
                <Input
                  placeholder={ar ? "اسم العائلة" : "Family Name"}
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                />
                <Input
                  placeholder={
                    ar
                      ? "القبيلة/اسم إضافي (اختياري)"
                      : "Tribe/Additional (optional)"
                  }
                  value={tribeName}
                  onChange={(e) => setTribeName(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {combineName(
                  firstName,
                  fatherName,
                  grandfatherName,
                  familyName,
                  tribeName,
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{ar ? "ربط بملف عائلة" : "Link to Family Profile"}</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <Popover
                  open={familyPickerOpen}
                  onOpenChange={setFamilyPickerOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-[320px] justify-between"
                    >
                      {selectedFamily ? (
                        <span className="truncate">
                          {selectedFamily.familyId} •{" "}
                          {selectedFamily.name || "—"} •{" "}
                          {selectedFamily.contact.phone || ""}
                        </span>
                      ) : ar ? (
                        "اختر العائلة"
                      ) : (
                        "Select family"
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-0">
                    <Command>
                      <CommandInput
                        placeholder={
                          ar ? "ابحث عن العائلة..." : "Search family..."
                        }
                      />
                      <CommandList>
                        <CommandEmpty>
                          {ar ? "لا ��وجد نتائج" : "No family found."}
                        </CommandEmpty>
                        <CommandGroup>
                          {families.map((f) => (
                            <CommandItem
                              key={f.id}
                              value={`${f.familyId} ${f.name || ""} ${f.contact.phone || ""}`}
                              onSelect={() => {
                                setSelectedFamilyId(f.id);
                                setFamilyPickerOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedFamilyId === f.id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <span className="truncate">
                                {f.familyId} • {f.name || "—"} •{" "}
                                {f.contact.phone || ""}
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="secondary"
                  onClick={() => setCreateFamilyOpen(true)}
                >
                  <Plus className="ml-1 h-4 w-4" />{" "}
                  {ar ? "إنشاء عائلة جديدة" : "Create new family"}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-3 mt-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label requiredMark={settings.required?.phone}>{ar ? "الهاتف" : "Phone"}</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{ar ? "العنوان" : "Address"}</Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label requiredMark={settings.required?.guardianName}>{ar ? "اسم ولي الأمر" : "Guardian Name"}</Label>
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
                <Label requiredMark={settings.required?.guardianPhone}>{ar ? "هاتف ولي الأمر" : "Guardian Phone"}</Label>
                <Input
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="care" className="space-y-3 mt-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{ar ? "نوع الإعاقة" : "Disability"}</Label>
                <select
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                  value={disability}
                  onChange={(e) => setDisability(e.target.value as any)}
                >
                  <option value="physical">{ar ? "حركية" : "Physical"}</option>
                  <option value="intellectual">
                    {ar ? "ذهنية" : "Intellectual"}
                  </option>
                  <option value="sensory">{ar ? "حسية" : "Sensory"}</option>
                  <option value="autism">{ar ? "توحد" : "Autism"}</option>
                  <option value="multiple">{ar ? "متع��دة" : "Multiple"}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{ar ? "تاريخ طبي" : "Medical History"}</Label>
                <Textarea
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{ar ? "الطبيب" : "Doctor"}</Label>
                <Input
                  value={doctor}
                  onChange={(e) => setDoctor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{ar ? "المعالج" : "Therapist"}</Label>
                <Input
                  value={therapist}
                  onChange={(e) => setTherapist(e.target.value)}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="space-y-2 md:col-span-2">
                <Label>
                  {ar ? "الأهداف (افصلها بفاصلة)" : "Goals (comma separated)"}
                </Label>
                <Input
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{ar ? "التقدم %" : "Progress %"}</Label>
                <Input
                  type="number"
                  value={progress}
                  onChange={(e) => setProgress(Number(e.target.value))}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-3 mt-4">
            <div className="grid md:grid-cols-2 gap-3">
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
            </div>
            <div className="grid md:grid-cols-2 gap-3">
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
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-3 mt-4">
            <div className="space-y-2">
              <Label>{ar ? "ملاحظات الطوارئ" : "Emergency Notes"}</Label>
              <Textarea
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
              />
            </div>
            <div className="space-y-2">
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
          </TabsContent>

          <TabsContent value="attachments" className="space-y-3 mt-4">
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
            <div className="space-y-2">
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
          </TabsContent>

          {settings.customFields?.length ? (
            <TabsContent value="custom" className="space-y-3 mt-4">
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                {settings.customFields.map((f: any) => (
                  <div key={f.id} className="space-y-1">
                    <Label requiredMark={!!f.required}>{f.label}</Label>
                    {f.type === "select" ? (
                      <select
                        className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                        value={custom[f.key] || ""}
                        onChange={(e) =>
                          setCustom({ ...custom, [f.key]: e.target.value })
                        }
                      >
                        <option value="">—</option>
                        {(f.options || []).map((o: string) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        value={custom[f.key] || ""}
                        onChange={(e) =>
                          setCustom({ ...custom, [f.key]: e.target.value })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          ) : null}
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {ar ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={onSave} disabled={!valid}>
            {ar ? "حفظ" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Quick create family */}
      {createFamilyOpen && (
        <QuickCreateFamilyDialog
          open={createFamilyOpen}
          onOpenChange={(v) => setCreateFamilyOpen(v)}
          onCreated={(fam) => {
            setSelectedFamilyId(fam.id);
          }}
        />
      )}
    </Dialog>
  );
}

function QuickCreateFamilyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: (f: Family) => void;
}) {
  const ar = getLocale() === "ar";
  const [familyId, setFamilyId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const valid = familyId.trim().length > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {ar ? "إنشاء عائلة جديدة" : "Create new family"}
          </DialogTitle>
          <DialogDescription>
            {ar
              ? "أدخل معلومات أساسية لملف العائلة"
              : "Enter basic info for the family profile"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Family ID</Label>
            <Input
              value={familyId}
              onChange={(e) => setFamilyId(e.target.value)}
              placeholder="F-0001"
            />
          </div>
          <div className="space-y-2">
            <Label>
              {ar ? "اسم العائلة (اختياري)" : "Family name (optional)"}
            </Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {ar ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const fam: Family = {
                id: familyUid(),
                familyId: familyId.trim(),
                name: name.trim() || undefined,
                contact: {
                  phone: phone.trim() || undefined,
                  email: email.trim() || undefined,
                },
                socio: {},
                notes: undefined,
                guardians: [],
                links: [],
                documents: [],
              };
              upsertFamily(fam);
              toast.success(ar ? "تم إنشاء العائلة" : "Family created");
              onCreated(fam);
              onOpenChange(false);
            }}
          >
            {ar ? "إنشاء" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
