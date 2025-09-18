type Frequency = "daily" | "weekly" | "monthly";

export type TherapySessionType = {
  id: string;
  name: string;
  description?: string;
  durationMin: number;
  defaultFrequency: Frequency;
};

export type TreatmentPlanTemplate = {
  id: string;
  name: string;
  description?: string;
  goals: string[];
  interventions: string[];
  assignedRole: "doctor" | "therapist";
};

export type MedicationSettings = {
  categories: string[];
  dosageUnits: string[];
  schedules: string[];
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
  name: string;
  description?: string;
};
export type ProgressSettings = {
  criteria: ProgressCriterion[];
  reportFrequencies: ("weekly" | "monthly" | "quarterly")[];
};

export type EmergencyProtocol = {
  id: string;
  name: string;
  description?: string;
  steps: string[];
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

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

function seed(): MedicalSettingsState {
  return {
    therapyTypes: [
      {
        id: uid("th"),
        name: "Physiotherapy",
        description: "Physical rehab",
        durationMin: 60,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: "Occupational Therapy",
        description: "Daily living skills",
        durationMin: 45,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: "Speech Therapy",
        description: "Communication skills",
        durationMin: 45,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: "Psychotherapy",
        description: "Mental health support",
        durationMin: 60,
        defaultFrequency: "weekly",
      },
      {
        id: uid("th"),
        name: "Medical Consultation",
        description: "Doctor visit",
        durationMin: 30,
        defaultFrequency: "monthly",
      },
    ],
    templates: [
      {
        id: uid("tpl"),
        name: "Autism - Communication Focus",
        description: "Improve receptive/expressive language",
        goals: ["Increase vocabulary by 20%", "Improve turn-taking"],
        interventions: ["ABA sessions", "Speech articulation drills"],
        assignedRole: "therapist",
      },
    ],
    medication: {
      categories: ["Tablet", "Injection", "Syrup", "Drops", "Capsule"],
      dosageUnits: ["mg", "ml", "drops", "capsules"],
      schedules: ["Before meal", "After meal", "Morning", "Night"],
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
        { id: uid("cr"), name: "Mobility" },
        { id: uid("cr"), name: "Communication" },
        { id: uid("cr"), name: "Cognitive" },
        { id: uid("cr"), name: "Social Skills" },
      ],
      reportFrequencies: ["weekly", "monthly", "quarterly"],
    },
    emergencyProtocols: [
      {
        id: uid("ep"),
        name: "Epilepsy Response",
        description: "Seizure first-aid steps",
        steps: [
          "Keep airway clear",
          "Turn on side",
          "Do not restrain",
          "Time the seizure",
        ],
        tags: ["epilepsy", "urgent"],
      },
      {
        id: uid("ep"),
        name: "Allergy Alert",
        description: "Anaphylaxis response",
        steps: ["EpiPen if prescribed", "Call emergency", "Monitor breathing"],
        tags: ["allergy", "urgent"],
      },
    ],
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
    cache = JSON.parse(raw) as MedicalSettingsState;
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

export function addMedicationCategory(name: string) {
  const s = load();
  if (!s.medication.categories.includes(name))
    save({
      ...s,
      medication: {
        ...s.medication,
        categories: [name, ...s.medication.categories],
      },
    });
}
export function removeMedicationCategory(name: string) {
  const s = load();
  save({
    ...s,
    medication: {
      ...s.medication,
      categories: s.medication.categories.filter((c) => c !== name),
    },
  });
}
export function addDosageUnit(u: string) {
  const s = load();
  if (!s.medication.dosageUnits.includes(u))
    save({
      ...s,
      medication: {
        ...s.medication,
        dosageUnits: [u, ...s.medication.dosageUnits],
      },
    });
}
export function removeDosageUnit(u: string) {
  const s = load();
  save({
    ...s,
    medication: {
      ...s.medication,
      dosageUnits: s.medication.dosageUnits.filter((x) => x !== u),
    },
  });
}
export function addSchedule(v: string) {
  const s = load();
  if (!s.medication.schedules.includes(v))
    save({
      ...s,
      medication: {
        ...s.medication,
        schedules: [v, ...s.medication.schedules],
      },
    });
}
export function removeSchedule(v: string) {
  const s = load();
  save({
    ...s,
    medication: {
      ...s.medication,
      schedules: s.medication.schedules.filter((x) => x !== v),
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

export { uid, load as loadMedical, save as saveMedical };
