type Frequency = "daily" | "weekly" | "monthly";

type Locale = "en" | "ar";

export type Localized = { en: string; ar: string };
export type Labeled = { id: string; label: Localized };

export type TherapySessionType = {
  id: string;
  name: Localized;
  description?: Localized;
  durationMin: number;
  defaultFrequency: Frequency;
};

export type TreatmentPlanTemplate = {
  id: string;
  name: Localized;
  description?: Localized;
  goals: Record<Locale, string[]>;
  interventions: Record<Locale, string[]>;
  assignedRole: "doctor" | "therapist";
};

export type MedicationSettings = {
  categories: Labeled[];
  dosageUnits: Labeled[];
  schedules: Labeled[];
};

export type WorkingHours = { day: number; start: string; end: string };
export type SchedulingSettings = {
  workingHours: WorkingHours[];
  sessionLength: number;
  maxPerDay: number;
  bufferMin: number;
  allowRecurring: boolean;
};

export type ProgressCriterion = {
  id: string;
  name: Localized;
  description?: Localized;
};
export type ProgressSettings = {
  criteria: ProgressCriterion[];
  reportFrequencies: ("weekly" | "monthly" | "quarterly")[];
};

export type EmergencyProtocol = {
  id: string;
  name: Localized;
  description?: Localized;
  steps: Record<Locale, string[]>;
  tags?: string[];
};

export type MedicalSettingsState = {
  therapyTypes: TherapySessionType[];
  templates: TreatmentPlanTemplate[];
  medication: MedicationSettings;
  scheduling: SchedulingSettings;
  progress: ProgressSettings;
  emergencyProtocols: EmergencyProtocol[];
};

const KEY = "dalma_medical_settings_v1";
let cache: MedicalSettingsState | null = null;
const subs = new Set<() => void>();

function notify() {
  subs.forEach((cb) => cb());
}
export function subscribeMedical(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

function L(en: string, ar = ""): Localized {
  return { en, ar };
}

function seed(): MedicalSettingsState {
  return {
    therapyTypes: [
      {
        id: uid("th"),
        name: L("Physiotherapy", "العلاج الطبيعي"),
        description: L("Physical rehab", "تأهيل بدني"),
        durationMin: 60,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: L("Occupational Therapy", "العلاج الوظيفي"),
        description: L("Daily living skills", "مهارات الحياة اليومية"),
        durationMin: 45,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: L("Speech Therapy", "علاج النطق"),
        description: L("Communication skills", "مهارات التواصل"),
        durationMin: 45,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: L("Psychotherapy", "العلاج النفسي"),
        description: L("Mental health support", "دعم الصحة النفسية"),
        durationMin: 60,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: L("Medical Consultation", "استشارة طبية"),
        description: L("Doctor visit", "زيارة الطبيب"),
        durationMin: 30,
        defaultFrequency: "monthly",
      },
    ],
    templates: [
      {
        id: uid("tpl"),
        name: L("Autism - Communication Focus", "التوحّد — تركيز على التواصل"),
        description: L(
          "Improve receptive/expressive language",
          "تحسين اللغة الاستقبالية/التعبيرية",
        ),
        goals: {
          en: ["Increase vocabulary by 20%", "Improve turn-taking"],
          ar: ["زيادة المفردات ٢٠٪", "تحسين تبادل الأدوار"],
        },
        interventions: {
          en: ["ABA sessions", "Speech articulation drills"],
          ar: ["جلسات تحليل السلوك", "تمارين النطق"],
        },
        assignedRole: "therapist",
      },
    ],
    medication: {
      categories: ["Tablet", "Injection", "Syrup", "Drops", "Capsule"].map(
        (x) => ({ id: uid("mc"), label: L(x) }),
      ),
      dosageUnits: ["mg", "ml", "drops", "capsules"].map((x) => ({
        id: uid("du"),
        label: L(x),
      })),
      schedules: ["Before meal", "After meal", "Morning", "Night"].map((x) => ({
        id: uid("ms"),
        label: L(x),
      })),
    },
    scheduling: {
      workingHours: [
        { day: 0, start: "09:00", end: "17:00" },
        { day: 1, start: "09:00", end: "17:00" },
        { day: 2, start: "09:00", end: "17:00" },
        { day: 3, start: "09:00", end: "17:00" },
        { day: 4, start: "09:00", end: "15:00" },
      ],
      sessionLength: 45,
      maxPerDay: 6,
      bufferMin: 10,
      allowRecurring: true,
    },
    progress: {
      criteria: [
        { id: uid("cr"), name: L("Mobility", "الحركة") },
        { id: uid("cr"), name: L("Communication", "التواصل") },
        { id: uid("cr"), name: L("Cognitive", "المعرفي") },
        { id: uid("cr"), name: L("Social Skills", "المهارات الاجتماعية") },
      ],
      reportFrequencies: ["weekly", "monthly", "quarterly"],
    },
    emergencyProtocols: [
      {
        id: uid("ep"),
        name: L("Epilepsy Response", "استجابة نوبات الصرع"),
        description: L("Seizure first-aid steps", "خطوات الإسعاف الأولي"),
        steps: {
          en: [
            "Keep airway clear",
            "Turn on side",
            "Do not restrain",
            "Time the seizure",
          ],
          ar: [],
        },
        tags: ["epilepsy", "urgent"],
      },
      {
        id: uid("ep"),
        name: L("Allergy Alert", "إنذار الحساسية"),
        description: L("Anaphylaxis response", "استجابة التأق"),
        steps: {
          en: ["EpiPen if prescribed", "Call emergency", "Monitor breathing"],
          ar: [],
        },
        tags: ["allergy", "urgent"],
      },
    ],
  };
}

function ensureLocalized(v: any): Localized {
  if (!v) return { en: "", ar: "" };
  if (typeof v === "string") return { en: v, ar: "" };
  const en = typeof v.en === "string" ? v.en : "";
  const ar = typeof v.ar === "string" ? v.ar : "";
  return { en, ar };
}

function migrate(raw: any): MedicalSettingsState {
  const s = raw || {};
  const therapyTypes: TherapySessionType[] = (s.therapyTypes || []).map(
    (t: any) => ({
      id: t.id || uid("th"),
      name: ensureLocalized(t.name),
      description:
        t.description !== undefined
          ? ensureLocalized(t.description)
          : undefined,
      durationMin: Number(t.durationMin || 45),
      defaultFrequency: (t.defaultFrequency || "weekly") as Frequency,
    }),
  );

  const toLabeled = (arr: any[], pfx: string): Labeled[] =>
    (arr || []).map((x: any) =>
      typeof x === "string"
        ? { id: uid(pfx), label: ensureLocalized(x) }
        : { id: x.id || uid(pfx), label: ensureLocalized(x.label || x) },
    );

  const medication: MedicationSettings = {
    categories: toLabeled(s.medication?.categories || [], "mc"),
    dosageUnits: toLabeled(s.medication?.dosageUnits || [], "du"),
    schedules: toLabeled(s.medication?.schedules || [], "ms"),
  };

  const toLocaleArray = (v: any): Record<Locale, string[]> => {
    if (Array.isArray(v)) return { en: v.map(String), ar: [] };
    return {
      en: Array.isArray(v?.en) ? v.en.map(String) : [],
      ar: Array.isArray(v?.ar) ? v.ar.map(String) : [],
    };
  };

  const templates: TreatmentPlanTemplate[] = (s.templates || []).map(
    (t: any) => ({
      id: t.id || uid("tpl"),
      name: ensureLocalized(t.name),
      description:
        t.description !== undefined
          ? ensureLocalized(t.description)
          : undefined,
      goals: toLocaleArray(t.goals),
      interventions: toLocaleArray(t.interventions),
      assignedRole: (t.assignedRole || "therapist") as "doctor" | "therapist",
    }),
  );

  const progress: ProgressSettings = {
    criteria: (s.progress?.criteria || []).map((c: any) => ({
      id: c.id || uid("cr"),
      name: ensureLocalized(c.name),
      description:
        c.description !== undefined
          ? ensureLocalized(c.description)
          : undefined,
    })),
    reportFrequencies: Array.isArray(s.progress?.reportFrequencies)
      ? s.progress.reportFrequencies
      : ["weekly", "monthly", "quarterly"],
  };

  const toSteps = (v: any): Record<Locale, string[]> => {
    if (Array.isArray(v)) return { en: v.map(String), ar: [] };
    return {
      en: Array.isArray(v?.en) ? v.en.map(String) : [],
      ar: Array.isArray(v?.ar) ? v.ar.map(String) : [],
    };
  };

  const emergencyProtocols: EmergencyProtocol[] = (
    s.emergencyProtocols || []
  ).map((p: any) => ({
    id: p.id || uid("ep"),
    name: ensureLocalized(p.name),
    description:
      p.description !== undefined ? ensureLocalized(p.description) : undefined,
    steps: toSteps(p.steps),
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
  }));

  const scheduling: SchedulingSettings = {
    workingHours: Array.isArray(s.scheduling?.workingHours)
      ? s.scheduling.workingHours.map((h: any) => ({
          day: Number(h.day || 0),
          start: String(h.start || "09:00"),
          end: String(h.end || "17:00"),
        }))
      : seed().scheduling.workingHours,
    sessionLength: Number(s.scheduling?.sessionLength ?? 45),
    maxPerDay: Number(s.scheduling?.maxPerDay ?? 6),
    bufferMin: Number(s.scheduling?.bufferMin ?? 10),
    allowRecurring: Boolean(s.scheduling?.allowRecurring ?? true),
  };

  return {
    therapyTypes,
    templates,
    medication,
    scheduling,
    progress,
    emergencyProtocols,
  };
}

function load(): MedicalSettingsState {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    cache = seed();
    localStorage.setItem(KEY, JSON.stringify(cache));
    return cache;
  }
  try {
    const parsed = JSON.parse(raw);
    const migrated = migrate(parsed);
    cache = migrated;
    // Persist migration if structure changed
    localStorage.setItem(KEY, JSON.stringify(cache));
    return cache!;
  } catch {
    cache = seed();
    localStorage.setItem(KEY, JSON.stringify(cache));
    return cache;
  }
}

function save(state: MedicalSettingsState) {
  cache = state;
  localStorage.setItem(KEY, JSON.stringify(state));
  notify();
}

export function getSettings() {
  return load();
}
export function updateSettings(patch: Partial<MedicalSettingsState>) {
  const s = load();
  save({ ...s, ...patch });
}

function upsertItem<T extends { id: string }>(arr: T[], item: T): T[] {
  const i = arr.findIndex((x) => x.id === item.id);
  if (i >= 0) {
    const clone = [...arr];
    clone[i] = item;
    return clone;
  }
  return [item, ...arr];
}
function removeItem<T extends { id: string }>(arr: T[], id: string): T[] {
  return arr.filter((x) => x.id !== id);
}

export function upsertTherapyType(item: TherapySessionType) {
  const s = load();
  save({ ...s, therapyTypes: upsertItem(s.therapyTypes, item) });
}
export function removeTherapyType(id: string) {
  const s = load();
  save({ ...s, therapyTypes: removeItem(s.therapyTypes, id) });
}

export function upsertTemplate(item: TreatmentPlanTemplate) {
  const s = load();
  save({ ...s, templates: upsertItem(s.templates, item) });
}
export function removeTemplate(id: string) {
  const s = load();
  save({ ...s, templates: removeItem(s.templates, id) });
}

export function addMedicationCategory(label: Localized) {
  const s = load();
  const next: MedicationSettings = {
    ...s.medication,
    categories: [{ id: uid("mc"), label }, ...s.medication.categories],
  };
  save({ ...s, medication: next });
}
export function removeMedicationCategory(id: string) {
  const s = load();
  save({
    ...s,
    medication: {
      ...s.medication,
      categories: s.medication.categories.filter((c) => c.id !== id),
    },
  });
}
export function addDosageUnit(label: Localized) {
  const s = load();
  const next: MedicationSettings = {
    ...s.medication,
    dosageUnits: [{ id: uid("du"), label }, ...s.medication.dosageUnits],
  };
  save({ ...s, medication: next });
}
export function removeDosageUnit(id: string) {
  const s = load();
  save({
    ...s,
    medication: {
      ...s.medication,
      dosageUnits: s.medication.dosageUnits.filter((x) => x.id !== id),
    },
  });
}
export function addSchedule(label: Localized) {
  const s = load();
  const next: MedicationSettings = {
    ...s.medication,
    schedules: [{ id: uid("ms"), label }, ...s.medication.schedules],
  };
  save({ ...s, medication: next });
}
export function removeSchedule(id: string) {
  const s = load();
  save({
    ...s,
    medication: {
      ...s.medication,
      schedules: s.medication.schedules.filter((x) => x.id !== id),
    },
  });
}

export function setWorkingHours(hours: WorkingHours[]) {
  const s = load();
  save({ ...s, scheduling: { ...s.scheduling, workingHours: hours } });
}
export function setSchedulingRules(partial: Partial<SchedulingSettings>) {
  const s = load();
  save({ ...s, scheduling: { ...s.scheduling, ...partial } });
}

export function upsertCriterion(c: ProgressCriterion) {
  const s = load();
  const arr = upsertItem(s.progress.criteria, c);
  save({ ...s, progress: { ...s.progress, criteria: arr } });
}
export function removeCriterion(id: string) {
  const s = load();
  save({
    ...s,
    progress: {
      ...s.progress,
      criteria: s.progress.criteria.filter((x) => x.id !== id),
    },
  });
}
export function setReportFrequencies(
  freqs: ProgressSettings["reportFrequencies"],
) {
  const s = load();
  save({ ...s, progress: { ...s.progress, reportFrequencies: freqs } });
}

export function upsertProtocol(p: EmergencyProtocol) {
  const s = load();
  save({ ...s, emergencyProtocols: upsertItem(s.emergencyProtocols, p) });
}
export function removeProtocol(id: string) {
  const s = load();
  save({ ...s, emergencyProtocols: removeItem(s.emergencyProtocols, id) });
}

export { load as loadMedical, save as saveMedical };
