import { useMemo, useState, useSyncExternalStore } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getLocale, t } from "@/i18n";
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
} from "@/store/medical";
import { getCurrentUser } from "@/store/auth";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

function useMedical() {
  return useSyncExternalStore(
    (cb) => subscribeMedical(cb),
    () => getSettings(),
    () => getSettings(),
  );
}

export default function MedicalSettings() {
  const state = useMedical();
  const me = useMemo(() => getCurrentUser(), []);
  const canManage = useMemo(() => {
    if (!me) return false;
    const acl = loadACL();
    return effectivePrivileges(me, acl.roles, acl.privileges).some((p) => p.id === "p_manage_clinical");
  }, [me]);
  const ar = getLocale() === "ar";

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("pages.medical.title")}</h1>
          <p className="text-muted-foreground">{t("pages.medical.subtitle")}</p>
        </div>
      </header>

      <Tabs defaultValue="therapy">
        <TabsList>
          <TabsTrigger value="therapy">{t("pages.medical.tabs.therapy")}</TabsTrigger>
          <TabsTrigger value="plans">{t("pages.medical.tabs.plans")}</TabsTrigger>
          <TabsTrigger value="medication">{t("pages.medical.tabs.medication")}</TabsTrigger>
          <TabsTrigger value="scheduling">{t("pages.medical.tabs.scheduling")}</TabsTrigger>
          <TabsTrigger value="progress">{t("pages.medical.tabs.progress")}</TabsTrigger>
          <TabsTrigger value="emergency">{t("pages.medical.tabs.emergency")}</TabsTrigger>
        </TabsList>

        <TabsContent value="therapy" className="mt-6">
          <TherapyTypesCard state={state} canManage={canManage} />
        </TabsContent>
        <TabsContent value="plans" className="mt-6">
          <PlanTemplatesCard state={state} canManage={canManage} />
        </TabsContent>
        <TabsContent value="medication" className="mt-6">
          <MedicationCard state={state} canManage={canManage} />
        </TabsContent>
        <TabsContent value="scheduling" className="mt-6">
          <SchedulingCard state={state} canManage={canManage} />
        </TabsContent>
        <TabsContent value="progress" className="mt-6">
          <ProgressCard state={state} canManage={canManage} />
        </TabsContent>
        <TabsContent value="emergency" className="mt-6">
          <EmergencyCard state={state} canManage={canManage} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TherapyTypesCard({ state, canManage }: { state: MedicalSettingsState; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TherapySessionType | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{t("pages.medical.therapy.title")}</CardTitle>
          <CardDescription>{t("pages.medical.therapy.desc")}</CardDescription>
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
              <TableHead>{t("pages.medical.therapy.duration")}</TableHead>
              <TableHead>{t("pages.medical.therapy.frequency")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.therapyTypes.map((t0) => (
              <TableRow key={t0.id}>
                <TableCell>{t0.name}<div className="text-xs text-muted-foreground">{t0.description}</div></TableCell>
                <TableCell>{t0.durationMin} {t("pages.medical.therapy.min")}</TableCell>
                <TableCell>{t0.defaultFrequency}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(t0); setOpen(true); }}>
                        <Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { removeTherapyType(t0.id); toast.success(t("pages.medical.saved")); }}>
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
      <TherapyDialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }} editing={editing} />
    </Card>
  );
}

function TherapyDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: TherapySessionType | null }) {
  const [name, setName] = useState(editing?.name || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [durationMin, setDurationMin] = useState(String(editing?.durationMin ?? 45));
  const [freq, setFreq] = useState<"daily" | "weekly" | "monthly">((editing?.defaultFrequency as any) || "weekly");
  const valid = name.trim().length >= 2 && Number(durationMin) > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? t("common.edit") : t("common.add")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>{t("common.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.common.description")}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t("pages.medical.therapy.duration")}</Label>
              <Input type="number" value={durationMin} onChange={(e) => setDurationMin(e.target.value)} />
            </div>
            <div>
              <Label>{t("pages.medical.therapy.frequency")}</Label>
              <select value={freq} onChange={(e) => setFreq(e.target.value as any)} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                <option value="daily">{t("pages.medical.therapy.freq.daily")}</option>
                <option value="weekly">{t("pages.medical.therapy.freq.weekly")}</option>
                <option value="monthly">{t("pages.medical.therapy.freq.monthly")}</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button disabled={!valid} onClick={() => {
            const item: TherapySessionType = {
              id: editing?.id || uid("th"),
              name: name.trim(),
              description: description.trim() || undefined,
              durationMin: Number(durationMin),
              defaultFrequency: freq,
            };
            upsertTherapyType(item);
            toast.success(t("pages.medical.saved"));
            onOpenChange(false);
          }}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PlanTemplatesCard({ state, canManage }: { state: MedicalSettingsState; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TreatmentPlanTemplate | null>(null);
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle>{t("pages.medical.plans.title")}</CardTitle>
          <CardDescription>{t("pages.medical.plans.desc")}</CardDescription>
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
              <TableHead>{t("pages.medical.plans.assigned")}</TableHead>
              <TableHead>{t("common.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {state.templates.map((tpl) => (
              <TableRow key={tpl.id}>
                <TableCell>
                  {tpl.name}
                  <div className="text-xs text-muted-foreground">{tpl.description}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {t("pages.medical.plans.goals")} {tpl.goals.join(", ")} • {t("pages.medical.plans.interventions")} {tpl.interventions.join(", ")}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{tpl.assignedRole === "doctor" ? t("pages.medical.plans.doctor") : t("pages.medical.plans.therapist")}</Badge>
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(tpl); setOpen(true); }}><Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}</Button>
                      <Button size="sm" variant="destructive" onClick={() => { removeTemplate(tpl.id); toast.success(t("pages.medical.saved")); }}><Trash2 className="ml-1 h-4 w-4" /> {t("common.delete")}</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <PlanDialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }} editing={editing} />
    </Card>
  );
}

function PlanDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: TreatmentPlanTemplate | null }) {
  const [name, setName] = useState(editing?.name || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [assignedRole, setAssignedRole] = useState<"doctor" | "therapist">(editing?.assignedRole || "therapist");
  const [goalText, setGoalText] = useState("");
  const [interText, setInterText] = useState("");
  const [goals, setGoals] = useState<string[]>(editing?.goals || []);
  const [interventions, setInterventions] = useState<string[]>(editing?.interventions || []);
  const valid = name.trim().length >= 2 && goals.length > 0 && interventions.length > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? t("common.edit") : t("common.add")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>{t("common.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.common.description")}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.plans.assigned")}</Label>
            <select value={assignedRole} onChange={(e) => setAssignedRole(e.target.value as any)} className="w-full h-9 rounded-md border bg-background px-3 text-sm">
              <option value="doctor">{t("pages.medical.plans.doctor")}</option>
              <option value="therapist">{t("pages.medical.plans.therapist")}</option>
            </select>
          </div>
          <div>
            <Label>{t("pages.medical.plans.goals")}</Label>
            <div className="flex gap-2">
              <Input value={goalText} onChange={(e) => setGoalText(e.target.value)} placeholder={t("pages.medical.plans.addGoal") as string} />
              <Button onClick={() => { if (goalText.trim()) { setGoals([goalText.trim(), ...goals]); setGoalText(""); } }}>{t("common.add")}</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {goals.map((g, i) => (
                <Badge key={i} onClick={() => setGoals(goals.filter((x) => x !== g))} className="cursor-pointer" variant="secondary">{g}</Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>{t("pages.medical.plans.interventions")}</Label>
            <div className="flex gap-2">
              <Input value={interText} onChange={(e) => setInterText(e.target.value)} placeholder={t("pages.medical.plans.addIntervention") as string} />
              <Button onClick={() => { if (interText.trim()) { setInterventions([interText.trim(), ...interventions]); setInterText(""); } }}>{t("common.add")}</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {interventions.map((g, i) => (
                <Badge key={i} onClick={() => setInterventions(interventions.filter((x) => x !== g))} className="cursor-pointer" variant="secondary">{g}</Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button disabled={!valid} onClick={() => {
            const tpl: TreatmentPlanTemplate = {
              id: editing?.id || uid("tpl"),
              name: name.trim(),
              description: description.trim() || undefined,
              goals,
              interventions,
              assignedRole,
            };
            upsertTemplate(tpl);
            toast.success(t("pages.medical.saved"));
            onOpenChange(false);
          }}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MedicationCard({ state, canManage }: { state: MedicalSettingsState; canManage: boolean }) {
  const [cat, setCat] = useState("");
  const [unit, setUnit] = useState("");
  const [sched, setSched] = useState("");
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("pages.medical.medication.title")}</CardTitle>
        <CardDescription>{t("pages.medical.medication.desc")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-3">
        <div>
          <Label>{t("pages.medical.medication.categories")}</Label>
          <div className="flex gap-2 mt-1">
            <Input value={cat} onChange={(e) => setCat(e.target.value)} placeholder={t("pages.medical.common.addNew") as string} />
            <Button disabled={!cat.trim() || !canManage} onClick={() => { addMedicationCategory(cat.trim()); setCat(""); toast.success(t("pages.medical.saved")); }}>{t("common.add")}</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.medication.categories.map((c) => (
              <Badge key={c} className="cursor-pointer" onClick={() => canManage && removeMedicationCategory(c)} variant="secondary">{c}</Badge>
            ))}
          </div>
        </div>
        <div>
          <Label>{t("pages.medical.medication.units")}</Label>
          <div className="flex gap-2 mt-1">
            <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={t("pages.medical.common.addNew") as string} />
            <Button disabled={!unit.trim() || !canManage} onClick={() => { addDosageUnit(unit.trim()); setUnit(""); toast.success(t("pages.medical.saved")); }}>{t("common.add")}</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.medication.dosageUnits.map((u) => (
              <Badge key={u} className="cursor-pointer" onClick={() => canManage && removeDosageUnit(u)} variant="secondary">{u}</Badge>
            ))}
          </div>
        </div>
        <div>
          <Label>{t("pages.medical.medication.schedules")}</Label>
          <div className="flex gap-2 mt-1">
            <Input value={sched} onChange={(e) => setSched(e.target.value)} placeholder={t("pages.medical.common.addNew") as string} />
            <Button disabled={!sched.trim() || !canManage} onClick={() => { addSchedule(sched.trim()); setSched(""); toast.success(t("pages.medical.saved")); }}>{t("common.add")}</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {state.medication.schedules.map((s) => (
              <Badge key={s} className="cursor-pointer" onClick={() => canManage && removeSchedule(s)} variant="secondary">{s}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SchedulingCard({ state, canManage }: { state: MedicalSettingsState; canManage: boolean }) {
  const rules = state.scheduling;
  const [sessionLength, setSessionLength] = useState(String(rules.sessionLength));
  const [maxPerDay, setMaxPerDay] = useState(String(rules.maxPerDay));
  const [bufferMin, setBufferMin] = useState(String(rules.bufferMin));
  const [allowRecurring, setAllowRecurring] = useState<boolean>(rules.allowRecurring);
  const [hours, setHours] = useState(rules.workingHours);

  function setHour(idx: number, key: "start" | "end", value: string) {
    setHours((prev) => prev.map((h, i) => (i === idx ? { ...h, [key]: value } : h)));
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
            <Input type="number" value={sessionLength} onChange={(e) => setSessionLength(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.scheduling.maxPerDay")}</Label>
            <Input type="number" value={maxPerDay} onChange={(e) => setMaxPerDay(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.scheduling.bufferMin")}</Label>
            <Input type="number" value={bufferMin} onChange={(e) => setBufferMin(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <Checkbox checked={allowRecurring} onCheckedChange={(v) => setAllowRecurring(v === true)} />
            <Label>{t("pages.medical.scheduling.allowRecurring")}</Label>
          </div>
        </div>
        <div>
          <Label className="mb-2 inline-block">{t("pages.medical.scheduling.workingHours")}</Label>
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
                  <TableCell><Input type="time" value={h.start} onChange={(e) => setHour(i, "start", e.target.value)} /></TableCell>
                  <TableCell><Input type="time" value={h.end} onChange={(e) => setHour(i, "end", e.target.value)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end">
          <Button disabled={!canManage} onClick={() => {
            const next: Partial<SchedulingSettings> = {
              sessionLength: Number(sessionLength),
              maxPerDay: Number(maxPerDay),
              bufferMin: Number(bufferMin),
              allowRecurring,
            };
            setSchedulingRules(next);
            setWorkingHours(hours);
            toast.success(t("pages.medical.saved"));
          }}>{t("common.save")}</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function weekdayLabel(d: number) {
  const ar = getLocale() === "ar";
  const daysEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
  return ar ? daysAr[d] : daysEn[d];
}

function ProgressCard({ state, canManage }: { state: MedicalSettingsState; canManage: boolean }) {
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
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.description}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}</Button>
                      <Button size="sm" variant="destructive" onClick={() => { removeCriterion(c.id); toast.success(t("pages.medical.saved")); }}><Trash2 className="ml-1 h-4 w-4" /> {t("common.delete")}</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div>
          <Label className="mb-2 inline-block">{t("pages.medical.progress.reportFreq")}</Label>
          <div className="flex flex-wrap gap-3">
            {["weekly", "monthly", "quarterly"].map((k) => (
              <label key={k} className="flex items-center gap-2">
                <Checkbox checked={!!freqs[k]} onCheckedChange={(v) => toggleFreq(k, v === true)} />
                <span className="text-sm capitalize">{k}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <Button disabled={!canManage} onClick={() => { const keys = Object.keys(freqs).filter((k) => freqs[k]); setReportFrequencies(keys as any); toast.success(t("pages.medical.saved")); }}>{t("common.save")}</Button>
          </div>
        </div>
      </CardContent>
      <CriterionDialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }} editing={editing} />
    </Card>
  );
}

function CriterionDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: ProgressCriterion | null }) {
  const [name, setName] = useState(editing?.name || "");
  const [description, setDescription] = useState(editing?.description || "");
  const valid = name.trim().length >= 2;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? t("common.edit") : t("common.add")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>{t("common.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.common.description")}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button disabled={!valid} onClick={() => {
            const item: ProgressCriterion = { id: editing?.id || uid("cr"), name: name.trim(), description: description.trim() || undefined };
            upsertCriterion(item);
            toast.success(t("pages.medical.saved"));
            onOpenChange(false);
          }}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmergencyCard({ state, canManage }: { state: MedicalSettingsState; canManage: boolean }) {
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
                <TableCell>{p.name}</TableCell>
                <TableCell className="text-muted-foreground">{p.description}</TableCell>
                <TableCell className="text-muted-foreground">{p.steps.join(" → ")}</TableCell>
                <TableCell className="flex items-center gap-2">
                  {canManage && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => { setEditing(p); setOpen(true); }}><Pencil className="ml-1 h-4 w-4" /> {t("common.edit")}</Button>
                      <Button size="sm" variant="destructive" onClick={() => { removeProtocol(p.id); toast.success(t("pages.medical.saved")); }}><Trash2 className="ml-1 h-4 w-4" /> {t("common.delete")}</Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <ProtocolDialog open={open} onOpenChange={(v) => { if (!v) setEditing(null); setOpen(v); }} editing={editing} />
    </Card>
  );
}

function ProtocolDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: EmergencyProtocol | null }) {
  const [name, setName] = useState(editing?.name || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [step, setStep] = useState("");
  const [steps, setSteps] = useState<string[]>(editing?.steps || []);
  const valid = name.trim().length >= 2 && steps.length > 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? t("common.edit") : t("common.add")}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div>
            <Label>{t("common.name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.common.description")}</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <Label>{t("pages.medical.emergency.steps")}</Label>
            <div className="flex gap-2">
              <Input value={step} onChange={(e) => setStep(e.target.value)} placeholder={t("pages.medical.emergency.addStep") as string} />
              <Button onClick={() => { if (step.trim()) { setSteps([step.trim(), ...steps]); setStep(""); } }}>{t("common.add")}</Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {steps.map((s, i) => (
                <Badge key={i} className="cursor-pointer" onClick={() => setSteps(steps.filter((x) => x !== s))} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("common.cancel")}</Button>
          <Button disabled={!valid} onClick={() => {
            const p: EmergencyProtocol = { id: editing?.id || uid("ep"), name: name.trim(), description: description.trim() || undefined, steps };
            upsertProtocol(p);
            toast.success(t("pages.medical.saved"));
            onOpenChange(false);
          }}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
