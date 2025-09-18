export type RequiredFields = {
  name: boolean;
  dob: boolean;
  gender: boolean;
  civilId: boolean;
  guardianName: boolean;
  guardianPhone: boolean;
};

export type CustomField = {
  id: string;
  key: string; // storage key
  label: string;
  type: "text" | "select";
  options?: string[];
  required?: boolean;
};

export type CarePlanTemplate = {
  id: string;
  name: string;
  goals: string[];
  interventions: string[];
  metrics: string[];
};

export type DocumentCategory = {
  id: string;
  name: string;
  expires?: boolean;
  alertBeforeDays?: number; // if expires
};

export type Lists = {
  gender: string[];
  maritalStatus: string[];
  educationLevel: string[];
  supportPrograms: string[];
  sponsorshipTypes: string[];
};

export type ProfileConfig = {
  requirePhoto: boolean;
  guardiansMode: "one" | "multiple";
  emergencyContactsRequired: number; // 0..n
};

export type IdConfig = {
  prefix: string; // e.g., BN-
  includeYear: boolean; // include YYYY
  suffix: string; // e.g., -CEN
  width: number; // zero pad width
  nextSequence: number; // auto-increment
};

export type BeneficiarySettingsState = {
  id: IdConfig;
  required: RequiredFields;
  customFields: CustomField[];
  disabilityCategories: string[];
  carePlanTemplates: CarePlanTemplate[];
  documentCategories: DocumentCategory[];
  profile: ProfileConfig;
  lists: Lists;
};

const KEY = "dalma_beneficiary_settings_v1";
let cache: BeneficiarySettingsState | null = null;
const subs = new Set<() => void>();

export function subscribeBeneficiarySettings(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}
function notify() { subs.forEach((cb) => cb()); }
export function uid(prefix = "f"): string { return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`; }

function seed(): BeneficiarySettingsState {
  return {
    id: { prefix: "BN-", includeYear: false, suffix: "", width: 4, nextSequence: 1 },
    required: { name: true, dob: true, gender: true, civilId: true, guardianName: true, guardianPhone: true },
    customFields: [
      { id: uid("cf"), key: "transportationNeeds", label: "Transportation Needs", type: "text" },
      { id: uid("cf"), key: "communicationPreference", label: "Communication Preference", type: "select", options: ["Phone", "WhatsApp", "Email"], required: false },
    ],
    disabilityCategories: ["Physical", "Intellectual", "Sensory", "Autism", "Multiple"],
    carePlanTemplates: [
      { id: uid("tpl"), name: "Physiotherapy Plan – 12 sessions", goals: ["Improve mobility"], interventions: ["Weekly sessions"], metrics: ["Range of motion"] },
    ],
    documentCategories: [
      { id: uid("dc"), name: "Medical Report", expires: false },
      { id: uid("dc"), name: "Disability Certificate", expires: true, alertBeforeDays: 30 },
      { id: uid("dc"), name: "Prescription", expires: true, alertBeforeDays: 7 },
      { id: uid("dc"), name: "Evaluation Report", expires: false },
    ],
    profile: { requirePhoto: false, guardiansMode: "multiple", emergencyContactsRequired: 1 },
    lists: {
      gender: ["male", "female"],
      maritalStatus: ["single", "married"],
      educationLevel: ["primary", "secondary", "university"],
      supportPrograms: ["Daycare", "Residential", "Home-based"],
      sponsorshipTypes: ["Government", "Private", "Donor"],
    },
  };
}

function load(): BeneficiarySettingsState {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (!raw) { cache = seed(); localStorage.setItem(KEY, JSON.stringify(cache)); return cache; }
  try { cache = JSON.parse(raw) as BeneficiarySettingsState; return cache!; } catch { cache = seed(); localStorage.setItem(KEY, JSON.stringify(cache)); return cache; }
}
function save(state: BeneficiarySettingsState) { cache = state; localStorage.setItem(KEY, JSON.stringify(state)); notify(); }

export function getBeneficiarySettings() { return load(); }
export function updateBeneficiarySettings(patch: Partial<BeneficiarySettingsState>) { const s = load(); save({ ...s, ...patch }); }

export function setRequiredFields(req: Partial<RequiredFields>) { const s = load(); save({ ...s, required: { ...s.required, ...req } }); }
export function addCustomField(f: Omit<CustomField, "id">) { const s = load(); save({ ...s, customFields: [{ ...f, id: uid("cf") }, ...s.customFields] }); }
export function upsertCustomField(f: CustomField) { const s = load(); const i = s.customFields.findIndex(x=>x.id===f.id); const next = [...s.customFields]; if (i>=0) next[i]=f; else next.unshift(f); save({ ...s, customFields: next }); }
export function removeCustomField(id: string) { const s = load(); save({ ...s, customFields: s.customFields.filter(x=>x.id!==id) }); }

export function setIdConfig(cfg: Partial<IdConfig>) { const s = load(); save({ ...s, id: { ...s.id, ...cfg } }); }
export function previewNextBeneficiaryId(): string {
  const { prefix, includeYear, suffix, width, nextSequence } = load().id;
  const year = includeYear ? new Date().getFullYear() : "";
  const num = String(nextSequence).padStart(width, "0");
  return `${prefix}${year ? `${year}-` : ""}${num}${suffix}`;
}
export function generateNextBeneficiaryId(): string {
  const s = load();
  const id = previewNextBeneficiaryId();
  save({ ...s, id: { ...s.id, nextSequence: s.id.nextSequence + 1 } });
  return id;
}

export function setDisabilityCategories(list: string[]) { const s = load(); save({ ...s, disabilityCategories: list }); }
export function addDisabilityCategory(name: string) { const s = load(); if (!s.disabilityCategories.includes(name)) save({ ...s, disabilityCategories: [name, ...s.disabilityCategories] }); }
export function removeDisabilityCategory(name: string) { const s = load(); save({ ...s, disabilityCategories: s.disabilityCategories.filter(x=>x!==name) }); }

export function upsertCarePlan(t: CarePlanTemplate) { const s = load(); const i = s.carePlanTemplates.findIndex(x=>x.id===t.id); const next=[...s.carePlanTemplates]; if(i>=0) next[i]=t; else next.unshift(t); save({ ...s, carePlanTemplates: next }); }
export function removeCarePlan(id: string) { const s = load(); save({ ...s, carePlanTemplates: s.carePlanTemplates.filter(x=>x.id!==id) }); }

export function upsertDocCategory(c: DocumentCategory) { const s = load(); const i = s.documentCategories.findIndex(x=>x.id===c.id); const next=[...s.documentCategories]; if(i>=0) next[i]=c; else next.unshift(c); save({ ...s, documentCategories: next }); }
export function removeDocCategory(id: string) { const s = load(); save({ ...s, documentCategories: s.documentCategories.filter(x=>x.id!==id) }); }

export function setProfileConfig(cfg: Partial<ProfileConfig>) { const s = load(); save({ ...s, profile: { ...s.profile, ...cfg } }); }

export function setList<K extends keyof Lists>(key: K, list: Lists[K]) { const s = load(); save({ ...s, lists: { ...s.lists, [key]: list } }); }
export function addListItem<K extends keyof Lists>(key: K, value: string) { const s = load(); if (!(s.lists[key] as string[]).includes(value)) { const next = [...(s.lists[key] as string[])]; next.unshift(value); save({ ...s, lists: { ...s.lists, [key]: next } }); } }
export function removeListItem<K extends keyof Lists>(key: K, value: string) { const s = load(); const next = (s.lists[key] as string[]).filter(x=>x!==value); save({ ...s, lists: { ...s.lists, [key]: next } }); }
