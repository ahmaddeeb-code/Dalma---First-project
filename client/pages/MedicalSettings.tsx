import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { getLocale, subscribeLocale, t } from "@/i18n";
import { effectivePrivileges, loadACL } from "@/store/acl";
import {
  EmergencyProtocol,
  MedicalSettingsState,
  ProgressCriterion,
  SchedulingSettings,
  TherapySessionType,
  TreatmentPlanTemplate,
  addDosageUnit,
  addMedicationCategory,
  addSchedule,
  getSettings,
  removeCriterion,
  removeMedicationCategory,
  removeProtocol,
  removeSchedule,
  removeTemplate,
  removeTherapyType,
  setReportFrequencies,
  setSchedulingRules,
  setWorkingHours,
  subscribeMedical,
  uid,
  upsertCriterion,
  upsertProtocol,
  upsertTemplate,
  upsertTherapyType,
  removeDosageUnit,
} from "@/store/medical";
import { getCurrentUser, getCurrentUserId, subscribeAuth } from "@/store/auth";
import { Plus, Pencil, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function useMedical() {
  return useSyncExternalStore(
    (cb) => subscribeMedical(cb),
    () => getSettings(),
    () => getSettings(),
  );
}

function useLocaleValue() {
  return useSyncExternalStore(
    (cb) => subscribeLocale(cb),
    () => getLocale(),
    () => getLocale(),
  );
}

export default function MedicalSettings() {
  const state = useMedical();
  const userId = useSyncExternalStore(
    (cb) => subscribeAuth(cb),
    () => getCurrentUserId(),
    () => getCurrentUserId(),
  );
  const me = useMemo(() => getCurrentUser(), [userId]);
  const canManage = useMemo(() => {
    if (!me) return false;
    const acl = loadACL();
    const hasPriv = effectivePrivileges(me, acl.roles, acl.privileges).some(
      (p) => p.id === "p_manage_clinical",
    );
    const isAdmin = me.roleIds.includes("r_admin");
    return hasPriv || isAdmin;
  }, [me]);
  const loc = useLocaleValue();

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("pages.medical.title")}
          </h1>
          <p className="text-muted-foreground">{t("pages.medical.subtitle")}</p>
        </div>
      </header>

      {!canManage && (
        <Alert>
          <ShieldAlert className="ml-2 h-4 w-4" />
          <AlertTitle>{t("common.readOnly")}</AlertTitle>
          <AlertDescription>{t("pages.medical.subtitle")}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="therapy">
        <TabsList>
          <TabsTrigger value="therapy">
            {t("pages.medical.tabs.therapy")}
          </TabsTrigger>
          <TabsTrigger value="plans">
            {t("pages.medical.tabs.plans")}
          </TabsTrigger>
          <TabsTrigger value="medication">
            {t("pages.medical.tabs.medication")}
          </TabsTrigger>
          <TabsTrigger value="scheduling">
            {t("pages.medical.tabs.scheduling")}
          </TabsTrigger>
          <TabsTrigger value="progress">
            {t("pages.medical.tabs.progress")}
          </TabsTrigger>
          <TabsTrigger value="emergency">
            {t("pages.medical.tabs.emergency")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="therapy" className="mt-6">
          <TherapyTypesCard state={state} canManage={canManage} loc={loc} />
        </TabsContent>
        <TabsContent value="plans" className="mt-6">
          <PlanTemplatesCard state={state} canManage={canManage} loc={loc} />
        </TabsContent>
        <TabsContent value="medication" className="mt-6">
          <MedicationCard state={state} canManage={canManage} loc={loc} />
        </TabsContent>
        <TabsContent value="scheduling" className="mt-6">
          <SchedulingCard state={state} canManage={canManage} />
        </TabsContent>
        <TabsContent value="progress" className="mt-6">
          <ProgressCard state={state} canManage={canManage} loc={loc} />
        </TabsContent>
        <TabsContent value="emergency" className="mt-6">
          <EmergencyCard state={state} canManage={canManage} loc={loc} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function L(loc: "en" | "ar", v: any): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  if (typeof v === "object" && ("en" in v || "ar" in v)) {
    return (v[loc] as string) || (v.en as string) || "";
  }
  return String(v);
}

function TherapyTypesCard({
  state,
  canManage,
  loc,
}: {
  state: MedicalSettingsState;
  canManage: boolean;
  loc: "en" | "ar";
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TherapySessionType | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{t("pages.medical.therapy.title")}</CardTitle>
          <CardDescription>{t("pages.medical.therapy.desc")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <TableToolbar
            onAdd={canManage ? () => setOpen(true) : undefined}
            addLabel={t("common.add")}
            onExport={(type) => {
              const cols = [
                { header: t("common.name"), accessor: (r:any) => r.name.en || r.name },
                { header: t("pages.medical.therapy.duration"), accessor: (r:any) => r.durationMin },
                { header: t("pages.medical.therapy.frequency"), accessor: (r:any) => r.defaultFrequency },
              ];
              import('@/lib/export').then((m)=>m.exportAll(state.therapyTypes, cols, type, 'therapy'));
            }}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("pages.medical.therapy.duration")}</TableHead>
              <TableHead>{t("pages.medical.therapy.frequency")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.therapyTypes.map((t0) => (
              <TableRow key={t0.id}>
                <TableCell>
                  {L(loc, t0.name)}
                  <div className="text-xs text-muted-foreground">
                    {L(loc, t0.description)}
                  </div>
                </TableCell>
                <TableCell>
                  {t0.durationMin} {t("pages.medical.therapy.min")}
                </TableCell>
                <TableCell>
                  {t(
                    `pages.medical.therapy.freq.${t0.defaultFrequency}` as any,
                  )}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(t0);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setConfirmId(t0.id)}
                      >
                        <Trash2 className="ml-1 h-4 w-4" /> {t("common.delete")}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <TherapyDialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setEditing(null);
          setOpen(v);
        }}
        editing={editing}
      />
      <AlertDialog open={!!confirmId}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("pages.medical.therapy.title")} — {t("common.delete")}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmId(null)}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmId) {
                  removeTherapyType(confirmId);
                  setConfirmId(null);
                  toast.success(t("pages.medical.saved"));
                }
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function TherapyDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: TherapySessionType | null;
}) {
  const [nameEn, setNameEn] = useState(editing?.name.en || "");
  const [nameAr, setNameAr] = useState(editing?.name.ar || "");
  const [descEn, setDescEn] = useState(editing?.description?.en || "");
  const [descAr, setDescAr] = useState(editing?.description?.ar || "");
  const [durationMin, setDurationMin] = useState(
    String(editing?.durationMin ?? 45),
  );
  const [freq, setFreq] = useState<"daily" | "weekly" | "monthly">(
    (editing?.defaultFrequency as any) || "weekly",
  );
  useEffect(() => {
    setNameEn(editing?.name.en || "");
    setNameAr(editing?.name.ar || "");
    setDescEn(editing?.description?.en || "");
    setDescAr(editing?.description?.ar || "");
    setDurationMin(String(editing?.durationMin ?? 45));
    setFreq((editing?.defaultFrequency as any) || "weekly");
  }, [editing, open]);
  const valid =
    (nameEn.trim().length >= 2 || nameAr.trim().length >= 2) &&
    Number(durationMin) > 0;
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
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("pages.medical.common.description")}</Label>
              <Input
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("pages.medical.common.description")}</Label>
              <Input
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("pages.medical.therapy.duration")}</Label>
              <Input
                type="number"
                value={durationMin}
                onChange={(e) => setDurationMin(e.target.value)}
              />
            </div>
            <div>
              <Label>{t("pages.medical.therapy.frequency")}</Label>
              <select
                value={freq}
                onChange={(e) => setFreq(e.target.value as any)}
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="daily">
                  {t("pages.medical.therapy.freq.daily")}
                </option>
                <option value="weekly">
                  {t("pages.medical.therapy.freq.weekly")}
                </option>
                <option value="monthly">
                  {t("pages.medical.therapy.freq.monthly")}
                </option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const item: TherapySessionType = {
                id: editing?.id || uid("th"),
                name: { en: nameEn.trim(), ar: nameAr.trim() },
                description: { en: descEn.trim(), ar: descAr.trim() },
                durationMin: Number(durationMin),
                defaultFrequency: freq,
              };
              upsertTherapyType(item);
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

function PlanTemplatesCard({
  state,
  canManage,
  loc,
}: {
  state: MedicalSettingsState;
  canManage: boolean;
  loc: "en" | "ar";
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TreatmentPlanTemplate | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{t("pages.medical.plans.title")}</CardTitle>
          <CardDescription>{t("pages.medical.plans.desc")}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <TableToolbar
            onAdd={canManage ? () => setOpen(true) : undefined}
            addLabel={t("common.add")}
            onExport={(type) => {
              const cols = [
                { header: t("common.name"), accessor: (r:any) => L(loc, r.name) },
                { header: t("pages.medical.plans.assigned"), accessor: (r:any) => r.assignedRole },
              ];
              import('@/lib/export').then((m)=>m.exportAll(state.templates, cols, type, 'plan_templates'));
            }}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("pages.medical.plans.assigned")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.templates.map((tpl) => (
              <TableRow key={tpl.id}>
                <TableCell>
                  {L(loc, tpl.name)}
                  <div className="text-xs text-muted-foreground">
                    {L(loc, tpl.description)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("pages.medical.plans.goals")}{" "}
                    {(tpl.goals[loc] || tpl.goals.en || []).join(", ")} •{" "}
                    {t("pages.medical.plans.interventions")}{" "}
                    {(
                      tpl.interventions[loc] ||
                      tpl.interventions.en ||
                      []
                    ).join(", ")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {tpl.assignedRole === "doctor"
                      ? t("pages.medical.plans.doctor")
                      : t("pages.medical.plans.therapist")}
                  </Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(tpl);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          removeTemplate(tpl.id);
                          toast.success(t("pages.medical.saved"));
                        }}
                      >
                        <Trash2 className="ml-1 h-4 w-4" /> {t("common.delete")}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <PlanDialog
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

function PlanDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: TreatmentPlanTemplate | null;
}) {
  const [nameEn, setNameEn] = useState(editing?.name.en || "");
  const [nameAr, setNameAr] = useState(editing?.name.ar || "");
  const [descEn, setDescEn] = useState(editing?.description?.en || "");
  const [descAr, setDescAr] = useState(editing?.description?.ar || "");
  const [assignedRole, setAssignedRole] = useState<"doctor" | "therapist">(
    editing?.assignedRole || "therapist",
  );
  const [goalEn, setGoalEn] = useState("");
  const [goalAr, setGoalAr] = useState("");
  const [interEn, setInterEn] = useState("");
  const [interAr, setInterAr] = useState("");
  const [goalsEn, setGoalsEn] = useState<string[]>(editing?.goals.en || []);
  const [goalsAr, setGoalsAr] = useState<string[]>(editing?.goals.ar || []);
  const [intersEn, setIntersEn] = useState<string[]>(
    editing?.interventions.en || [],
  );
  const [intersAr, setIntersAr] = useState<string[]>(
    editing?.interventions.ar || [],
  );
  useEffect(() => {
    setNameEn(editing?.name.en || "");
    setNameAr(editing?.name.ar || "");
    setDescEn(editing?.description?.en || "");
    setDescAr(editing?.description?.ar || "");
    setAssignedRole(editing?.assignedRole || "therapist");
    setGoalsEn(editing?.goals.en || []);
    setGoalsAr(editing?.goals.ar || []);
    setIntersEn(editing?.interventions.en || []);
    setIntersAr(editing?.interventions.ar || []);
    setGoalEn("");
    setGoalAr("");
    setInterEn("");
    setInterAr("");
  }, [editing, open]);
  const valid =
    (nameEn.trim().length >= 2 || nameAr.trim().length >= 2) &&
    goalsEn.length + goalsAr.length > 0 &&
    intersEn.length + intersAr.length > 0;
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
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("pages.medical.common.description")}</Label>
              <Input
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("pages.medical.common.description")}</Label>
              <Input
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>{t("pages.medical.plans.assigned")}</Label>
            <select
              value={assignedRole}
              onChange={(e) => setAssignedRole(e.target.value as any)}
              className="w-full h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="doctor">{t("pages.medical.plans.doctor")}</option>
              <option value="therapist">
                {t("pages.medical.plans.therapist")}
              </option>
            </select>
          </div>
          <div>
            <Label>{t("pages.medical.plans.goals")}</Label>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="flex gap-2">
                <Input
                  value={goalEn}
                  onChange={(e) => setGoalEn(e.target.value)}
                  placeholder={t("pages.medical.plans.addGoal") as string}
                />
                <Button
                  onClick={() => {
                    if (goalEn.trim()) {
                      setGoalsEn([goalEn.trim(), ...goalsEn]);
                      setGoalEn("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={goalAr}
                  onChange={(e) => setGoalAr(e.target.value)}
                  placeholder={t("pages.medical.plans.addGoal") as string}
                />
                <Button
                  onClick={() => {
                    if (goalAr.trim()) {
                      setGoalsAr([goalAr.trim(), ...goalsAr]);
                      setGoalAr("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {goalsEn.map((g, i) => (
                <Badge
                  key={"en-" + i}
                  onClick={() => setGoalsEn(goalsEn.filter((x) => x !== g))}
                  className="cursor-pointer"
                  variant="secondary"
                >
                  EN: {g}
                </Badge>
              ))}
              {goalsAr.map((g, i) => (
                <Badge
                  key={"ar-" + i}
                  onClick={() => setGoalsAr(goalsAr.filter((x) => x !== g))}
                  className="cursor-pointer"
                  variant="secondary"
                >
                  AR: {g}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>{t("pages.medical.plans.interventions")}</Label>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="flex gap-2">
                <Input
                  value={interEn}
                  onChange={(e) => setInterEn(e.target.value)}
                  placeholder={
                    t("pages.medical.plans.addIntervention") as string
                  }
                />
                <Button
                  onClick={() => {
                    if (interEn.trim()) {
                      setIntersEn([interEn.trim(), ...intersEn]);
                      setInterEn("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={interAr}
                  onChange={(e) => setInterAr(e.target.value)}
                  placeholder={
                    t("pages.medical.plans.addIntervention") as string
                  }
                />
                <Button
                  onClick={() => {
                    if (interAr.trim()) {
                      setIntersAr([interAr.trim(), ...intersAr]);
                      setInterAr("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {intersEn.map((g, i) => (
                <Badge
                  key={"en-" + i}
                  onClick={() => setIntersEn(intersEn.filter((x) => x !== g))}
                  className="cursor-pointer"
                  variant="secondary"
                >
                  EN: {g}
                </Badge>
              ))}
              {intersAr.map((g, i) => (
                <Badge
                  key={"ar-" + i}
                  onClick={() => setIntersAr(intersAr.filter((x) => x !== g))}
                  className="cursor-pointer"
                  variant="secondary"
                >
                  AR: {g}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const tpl: TreatmentPlanTemplate = {
                id: editing?.id || uid("tpl"),
                name: { en: nameEn.trim(), ar: nameAr.trim() },
                description: { en: descEn.trim(), ar: descAr.trim() },
                goals: { en: goalsEn, ar: goalsAr },
                interventions: { en: intersEn, ar: intersAr },
                assignedRole,
              };
              upsertTemplate(tpl);
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

function MedicationCard({
  state,
  canManage,
  loc,
}: {
  state: MedicalSettingsState;
  canManage: boolean;
  loc: "en" | "ar";
}) {
  const [catEn, setCatEn] = useState("");
  const [catAr, setCatAr] = useState("");
  const [unitEn, setUnitEn] = useState("");
  const [unitAr, setUnitAr] = useState("");
  const [schedEn, setSchedEn] = useState("");
  const [schedAr, setSchedAr] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.medical.medication.title")}</CardTitle>
        <CardDescription>{t("pages.medical.medication.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <Label>{t("pages.medical.medication.categories")}</Label>
          <div className="grid gap-2 mt-1">
            <div className="flex gap-2">
              <Input
                value={catEn}
                onChange={(e) => setCatEn(e.target.value)}
                placeholder="EN"
              />
              <Input
                value={catAr}
                onChange={(e) => setCatAr(e.target.value)}
                placeholder="AR"
              />
              <Button
                disabled={!canManage || (!catEn.trim() && !catAr.trim())}
                onClick={() => {
                  addMedicationCategory({ en: catEn.trim(), ar: catAr.trim() });
                  setCatEn("");
                  setCatAr("");
                  toast.success(t("pages.medical.saved"));
                }}
              >
                {t("common.add")}
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.medication.categories.map((c) => (
              <Badge
                key={c.id}
                className="cursor-pointer"
                onClick={() => {
                  if (canManage) {
                    removeMedicationCategory(c.id);
                    toast.success(t("pages.medical.saved"));
                  }
                }}
                variant="secondary"
              >
                {L(loc, c.label)}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <Label>{t("pages.medical.medication.units")}</Label>
          <div className="grid gap-2 mt-1">
            <div className="flex gap-2">
              <Input
                value={unitEn}
                onChange={(e) => setUnitEn(e.target.value)}
                placeholder="EN"
              />
              <Input
                value={unitAr}
                onChange={(e) => setUnitAr(e.target.value)}
                placeholder="AR"
              />
              <Button
                disabled={!canManage || (!unitEn.trim() && !unitAr.trim())}
                onClick={() => {
                  addDosageUnit({ en: unitEn.trim(), ar: unitAr.trim() });
                  setUnitEn("");
                  setUnitAr("");
                  toast.success(t("pages.medical.saved"));
                }}
              >
                {t("common.add")}
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.medication.dosageUnits.map((u) => (
              <Badge
                key={u.id}
                className="cursor-pointer"
                onClick={() => {
                  if (canManage) {
                    removeDosageUnit(u.id);
                    toast.success(t("pages.medical.saved"));
                  }
                }}
                variant="secondary"
              >
                {L(loc, u.label)}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <Label>{t("pages.medical.medication.schedules")}</Label>
          <div className="grid gap-2 mt-1">
            <div className="flex gap-2">
              <Input
                value={schedEn}
                onChange={(e) => setSchedEn(e.target.value)}
                placeholder="EN"
              />
              <Input
                value={schedAr}
                onChange={(e) => setSchedAr(e.target.value)}
                placeholder="AR"
              />
              <Button
                disabled={!canManage || (!schedEn.trim() && !schedAr.trim())}
                onClick={() => {
                  addSchedule({ en: schedEn.trim(), ar: schedAr.trim() });
                  setSchedEn("");
                  setSchedAr("");
                  toast.success(t("pages.medical.saved"));
                }}
              >
                {t("common.add")}
              </Button>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.medication.schedules.map((s) => (
              <Badge
                key={s.id}
                className="cursor-pointer"
                onClick={() => {
                  if (canManage) {
                    removeSchedule(s.id);
                    toast.success(t("pages.medical.saved"));
                  }
                }}
                variant="secondary"
              >
                {L(loc, s.label)}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SchedulingCard({
  state,
  canManage,
}: {
  state: MedicalSettingsState;
  canManage: boolean;
}) {
  const rules = state.scheduling;
  const [sessionLength, setSessionLength] = useState(
    String(rules.sessionLength),
  );
  const [maxPerDay, setMaxPerDay] = useState(String(rules.maxPerDay));
  const [bufferMin, setBufferMin] = useState(String(rules.bufferMin));
  const [allowRecurring, setAllowRecurring] = useState<boolean>(
    rules.allowRecurring,
  );
  const [hours, setHours] = useState(rules.workingHours);

  function setHour(idx: number, key: "start" | "end", value: string) {
    setHours((prev) =>
      prev.map((h, i) => (i === idx ? { ...h, [key]: value } : h)),
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.medical.scheduling.title")}</CardTitle>
        <CardDescription>{t("pages.medical.scheduling.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <Label>{t("pages.medical.scheduling.sessionLength")}</Label>
            <Input
              type="number"
              value={sessionLength}
              onChange={(e) => setSessionLength(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("pages.medical.scheduling.maxPerDay")}</Label>
            <Input
              type="number"
              value={maxPerDay}
              onChange={(e) => setMaxPerDay(e.target.value)}
            />
          </div>
          <div>
            <Label>{t("pages.medical.scheduling.bufferMin")}</Label>
            <Input
              type="number"
              value={bufferMin}
              onChange={(e) => setBufferMin(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox
              checked={allowRecurring}
              onCheckedChange={(v) => setAllowRecurring(v === true)}
            />
            <Label>{t("pages.medical.scheduling.allowRecurring")}</Label>
          </div>
        </div>
        <div>
          <Label className="mb-2 inline-block">
            {t("pages.medical.scheduling.workingHours")}
          </Label>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("pages.medical.scheduling.day")}</TableHead>
                <TableHead>{t("pages.medical.scheduling.start")}</TableHead>
                <TableHead>{t("pages.medical.scheduling.end")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hours.map((h, i) => (
                <TableRow key={i}>
                  <TableCell>{weekdayLabel(h.day)}</TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={h.start}
                      onChange={(e) => setHour(i, "start", e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="time"
                      value={h.end}
                      onChange={(e) => setHour(i, "end", e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Button
            disabled={!canManage}
            onClick={() => {
              const next: Partial<SchedulingSettings> = {
                sessionLength: Number(sessionLength),
                maxPerDay: Number(maxPerDay),
                bufferMin: Number(bufferMin),
                allowRecurring,
              };
              setSchedulingRules(next);
              setWorkingHours(hours);
              toast.success(t("pages.medical.saved"));
            }}
          >
            {t("common.save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function weekdayLabel(d: number) {
  const ar = getLocale() === "ar";
  const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysAr = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];
  return ar ? daysAr[d] : daysEn[d];
}

function ProgressCard({
  state,
  canManage,
  loc,
}: {
  state: MedicalSettingsState;
  canManage: boolean;
  loc: "en" | "ar";
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProgressCriterion | null>(null);
  const [freqs, setFreqs] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const f of state.progress.reportFrequencies) init[f] = true;
    return init;
  });
  function toggleFreq(key: string, on: boolean) {
    setFreqs((prev) => ({ ...prev, [key]: on }));
  }
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{t("pages.medical.progress.title")}</CardTitle>
          <CardDescription>{t("pages.medical.progress.desc")}</CardDescription>
        </div>
        {canManage && (
          <Button onClick={() => setOpen(true)}>
            <Plus className="ml-1 h-4 w-4" /> {t("common.add")}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("pages.medical.common.description")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.progress.criteria.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{L(loc, c.name)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {L(loc, c.description)}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(c);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          removeCriterion(c.id);
                          toast.success(t("pages.medical.saved"));
                        }}
                      >
                        <Trash2 className="ml-1 h-4 w-4" /> {t("common.delete")}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div>
          <Label className="mb-2 inline-block">
            {t("pages.medical.progress.reportFreq")}
          </Label>
          <div className="flex flex-wrap gap-3">
            {[
              ["weekly", "weekly"],
              ["monthly", "monthly"],
              ["quarterly", "quarterly"],
            ].map(([k, label]) => (
              <label key={k} className="flex items-center gap-2">
                <Checkbox
                  checked={!!freqs[k]}
                  onCheckedChange={(v) => toggleFreq(k, v === true)}
                />
                <span className="text-sm capitalize">{label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <Button
              disabled={!canManage}
              onClick={() => {
                const keys = Object.keys(freqs).filter((k) => freqs[k]);
                setReportFrequencies(keys as any);
                toast.success(t("pages.medical.saved"));
              }}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </CardContent>
      <CriterionDialog
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

function CriterionDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: ProgressCriterion | null;
}) {
  const [nameEn, setNameEn] = useState(editing?.name.en || "");
  const [nameAr, setNameAr] = useState(editing?.name.ar || "");
  const [descEn, setDescEn] = useState(editing?.description?.en || "");
  const [descAr, setDescAr] = useState(editing?.description?.ar || "");
  useEffect(() => {
    setNameEn(editing?.name.en || "");
    setNameAr(editing?.name.ar || "");
    setDescEn(editing?.description?.en || "");
    setDescAr(editing?.description?.ar || "");
  }, [editing, open]);
  const valid = nameEn.trim().length >= 2 || nameAr.trim().length >= 2;
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
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("pages.medical.common.description")}</Label>
              <Input
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("pages.medical.common.description")}</Label>
              <Input
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const item: ProgressCriterion = {
                id: editing?.id || uid("cr"),
                name: { en: nameEn.trim(), ar: nameAr.trim() },
                description: { en: descEn.trim(), ar: descAr.trim() },
              };
              upsertCriterion(item);
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

function EmergencyCard({
  state,
  canManage,
  loc,
}: {
  state: MedicalSettingsState;
  canManage: boolean;
  loc: "en" | "ar";
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EmergencyProtocol | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{t("pages.medical.emergency.title")}</CardTitle>
          <CardDescription>{t("pages.medical.emergency.desc")}</CardDescription>
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
              <TableHead>{t("common.name")}</TableHead>
              <TableHead>{t("pages.medical.common.description")}</TableHead>
              <TableHead>{t("pages.medical.emergency.steps")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.emergencyProtocols.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{L(loc, p.name)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {L(loc, p.description)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {(p.steps[loc] || p.steps.en || []).join(" → ")}
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditing(p);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          removeProtocol(p.id);
                          toast.success(t("pages.medical.saved"));
                        }}
                      >
                        <Trash2 className="ml-1 h-4 w-4" /> {t("common.delete")}
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ProtocolDialog
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

function ProtocolDialog({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: EmergencyProtocol | null;
}) {
  const [nameEn, setNameEn] = useState(editing?.name.en || "");
  const [nameAr, setNameAr] = useState(editing?.name.ar || "");
  const [descEn, setDescEn] = useState(editing?.description?.en || "");
  const [descAr, setDescAr] = useState(editing?.description?.ar || "");
  const [stepEn, setStepEn] = useState("");
  const [stepAr, setStepAr] = useState("");
  const [stepsEn, setStepsEn] = useState<string[]>(editing?.steps.en || []);
  const [stepsAr, setStepsAr] = useState<string[]>(editing?.steps.ar || []);
  useEffect(() => {
    setNameEn(editing?.name.en || "");
    setNameAr(editing?.name.ar || "");
    setDescEn(editing?.description?.en || "");
    setDescAr(editing?.description?.ar || "");
    setStepsEn(editing?.steps.en || []);
    setStepsAr(editing?.steps.ar || []);
    setStepEn("");
    setStepAr("");
  }, [editing, open]);
  const valid =
    (nameEn.trim().length >= 2 || nameAr.trim().length >= 2) &&
    stepsEn.length + stepsAr.length > 0;
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
              <Label>EN — {t("common.name")}</Label>
              <Input
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("common.name")}</Label>
              <Input
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>EN — {t("pages.medical.common.description")}</Label>
              <Input
                value={descEn}
                onChange={(e) => setDescEn(e.target.value)}
              />
            </div>
            <div>
              <Label>AR — {t("pages.medical.common.description")}</Label>
              <Input
                value={descAr}
                onChange={(e) => setDescAr(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>{t("pages.medical.emergency.steps")}</Label>
            <div className="grid md:grid-cols-2 gap-2">
              <div className="flex gap-2">
                <Input
                  value={stepEn}
                  onChange={(e) => setStepEn(e.target.value)}
                  placeholder={t("pages.medical.emergency.addStep") as string}
                />
                <Button
                  onClick={() => {
                    if (stepEn.trim()) {
                      setStepsEn([stepEn.trim(), ...stepsEn]);
                      setStepEn("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  value={stepAr}
                  onChange={(e) => setStepAr(e.target.value)}
                  placeholder={t("pages.medical.emergency.addStep") as string}
                />
                <Button
                  onClick={() => {
                    if (stepAr.trim()) {
                      setStepsAr([stepAr.trim(), ...stepsAr]);
                      setStepAr("");
                    }
                  }}
                >
                  {t("common.add")}
                </Button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {stepsEn.map((s, i) => (
                <Badge
                  key={"en-" + i}
                  className="cursor-pointer"
                  onClick={() => setStepsEn(stepsEn.filter((x) => x !== s))}
                  variant="secondary"
                >
                  EN: {s}
                </Badge>
              ))}
              {stepsAr.map((s, i) => (
                <Badge
                  key={"ar-" + i}
                  className="cursor-pointer"
                  onClick={() => setStepsAr(stepsAr.filter((x) => x !== s))}
                  variant="secondary"
                >
                  AR: {s}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            disabled={!valid}
            onClick={() => {
              const p: EmergencyProtocol = {
                id: editing?.id || uid("ep"),
                name: { en: nameEn.trim(), ar: nameAr.trim() },
                description: { en: descEn.trim(), ar: descAr.trim() },
                steps: { en: stepsEn, ar: stepsAr },
              };
              upsertProtocol(p);
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
