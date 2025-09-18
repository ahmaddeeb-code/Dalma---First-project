export type WorkingHours = { days: number[]; start: string; end: string };
export type BasicInfo = {
  name: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  timezone?: string;
  language?: "en" | "ar";
  hours: WorkingHours;
};

export type Branch = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  contactPerson?: string;
  assignedStaffIds?: string[];
  assignedBeneficiaryIds?: string[];
};

export type IdFormat = {
  prefix: string;
  includeYear: boolean;
  width: number;
  suffix: string;
  next: number;
};

export type Branding = {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
};

export type Preferences = {
  singleCenterMode: boolean;
  dashboardWidgets: string[];
  modules: Record<string, boolean>; // e.g., finance, notifications, education, logistics, medical
  currency: string;
  country?: string;
  region?: string;
  idFormats: { beneficiary: IdFormat; staff: IdFormat };
};

export type OrgSettingsState = {
  basic: BasicInfo;
  branches: Branch[];
  branding: Branding;
  prefs: Preferences;
};

const KEY = "dalma_org_settings_v1";
let cache: OrgSettingsState | null = null;
const subs = new Set<() => void>();

export function subscribeOrgSettings(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}
function notify() {
  subs.forEach((cb) => cb());
}
export function uid(prefix = "o") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

function seed(): OrgSettingsState {
  return {
    basic: {
      name: "Specialized Care & Treatment Center",
      phone: "+966-0000",
      email: "info@example.org",
      address: "Riyadh",
      timezone: "Asia/Riyadh",
      language: "en",
      hours: { days: [0, 1, 2, 3, 4], start: "09:00", end: "17:00" },
    },
    branches: [
      {
        id: uid("br"),
        name: "Main Center",
        address: "Riyadh",
        phone: "+966-1111",
        contactPerson: "Admin",
      },
    ],
    branding: { primaryColor: "#2563eb", secondaryColor: "#10b981" },
    prefs: {
      singleCenterMode: false,
      dashboardWidgets: ["kpi_beneficiaries", "appointments", "alerts"],
      modules: {
        finance: true,
        notifications: true,
        education: true,
        logistics: true,
        medical: true,
      },
      currency: "SAR",
      country: "SA",
      region: "Riyadh",
      idFormats: {
        beneficiary: {
          prefix: "BN-",
          includeYear: false,
          width: 4,
          suffix: "",
          next: 1,
        },
        staff: {
          prefix: "ST-",
          includeYear: false,
          width: 4,
          suffix: "",
          next: 1,
        },
      },
    },
  };
}

function load(): OrgSettingsState {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    cache = seed();
    localStorage.setItem(KEY, JSON.stringify(cache));
    return cache;
  }
  try {
    cache = JSON.parse(raw) as OrgSettingsState;
    return cache!;
  } catch {
    cache = seed();
    localStorage.setItem(KEY, JSON.stringify(cache));
    return cache;
  }
}
function save(state: OrgSettingsState) {
  cache = state;
  localStorage.setItem(KEY, JSON.stringify(state));
  notify();
}

export function getOrgSettings() {
  return load();
}
export function updateBasic(info: Partial<BasicInfo>) {
  const s = load();
  save({ ...s, basic: { ...s.basic, ...info } });
}
export function updateBranding(b: Partial<Branding>) {
  const s = load();
  save({ ...s, branding: { ...s.branding, ...b } });
}
export function updatePrefs(p: Partial<Preferences>) {
  const s = load();
  save({ ...s, prefs: { ...s.prefs, ...p } });
}

export function upsertBranch(br: Branch) {
  const s = load();
  const i = s.branches.findIndex((x) => x.id === br.id);
  const next = [...s.branches];
  if (i >= 0) next[i] = br;
  else next.unshift(br);
  save({ ...s, branches: next });
}
export function removeBranch(id: string) {
  const s = load();
  save({ ...s, branches: s.branches.filter((x) => x.id !== id) });
}

function renderId(fmt: IdFormat) {
  const year = fmt.includeYear ? `${new Date().getFullYear()}-` : "";
  return `${fmt.prefix}${year}${String(fmt.next).padStart(fmt.width, "0")}${fmt.suffix}`;
}
export function previewId(kind: keyof Preferences["idFormats"]): string {
  const s = load();
  return renderId(s.prefs.idFormats[kind]);
}
export function generateId(kind: keyof Preferences["idFormats"]): string {
  const s = load();
  const id = renderId(s.prefs.idFormats[kind]);
  const nextFmt = {
    ...s.prefs.idFormats[kind],
    next: s.prefs.idFormats[kind].next + 1,
  };
  save({
    ...s,
    prefs: { ...s.prefs, idFormats: { ...s.prefs.idFormats, [kind]: nextFmt } },
  });
  return id;
}
