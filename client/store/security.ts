import { loadACL, type Role } from "./acl";

export type PasswordPolicy = {
  minLength: number;
  requireUpper: boolean;
  requireLower: boolean;
  requireNumber: boolean;
  requireSpecial: boolean;
  expirationDays: number; // 0 = never
};

export type AuthSettings = {
  twoFactor: boolean;
  sessionTimeoutMin: number;
  autoLogout: boolean;
  passwordPolicy: PasswordPolicy;
};

export type RolePermission = {
  roleId: string;
  view: boolean;
  edit: boolean;
  del: boolean;
  export: boolean;
};

export type SensitiveAccess = {
  financialVisibleTo: string[]; // roleIds
  medicalVisibleTo: string[]; // roleIds
};

export type AuditEntry = {
  id: string;
  at: string; // ISO
  userId?: string | null;
  action: string; // create|edit|delete|login|export|anonymize|backup
  entity?: string;
  entityId?: string;
  oldValue?: any;
  newValue?: any;
};

export type DataProtection = {
  encryptSensitive: boolean;
  backupFrequency: "daily" | "weekly" | "monthly";
  backupRetentionDays: number;
  retentionYears: number; // archive after X years
};

export type Compliance = {
  gdpr: boolean;
  hipaa: boolean;
  consentRequired: boolean;
};

export type SecurityState = {
  auth: AuthSettings;
  rolePerms: RolePermission[];
  sensitive: SensitiveAccess;
  audits: AuditEntry[];
  data: DataProtection;
  compliance: Compliance;
};

const KEY = "dalma_security_settings_v1";
let cache: SecurityState | null = null;
const subs = new Set<() => void>();

export function subscribeSecurity(cb: () => void) { subs.add(cb); return () => subs.delete(cb); }
function notify(){ subs.forEach((cb)=>cb()); }
export function uid(prefix="sec"){ return `${prefix}_${Math.random().toString(36).slice(2,8)}${Date.now().toString(36)}`; }

function seed(): SecurityState {
  const roles: Role[] = loadACL().roles;
  const perms: RolePermission[] = roles.map((r) => ({ roleId: r.id, view: true, edit: r.id === "r_admin", del: r.id === "r_admin", export: true }));
  return {
    auth: {
      twoFactor: false,
      sessionTimeoutMin: 30,
      autoLogout: true,
      passwordPolicy: { minLength: 8, requireUpper: true, requireLower: true, requireNumber: true, requireSpecial: false, expirationDays: 90 },
    },
    rolePerms: perms,
    sensitive: { financialVisibleTo: ["r_admin"], medicalVisibleTo: ["r_admin","r_doctor","r_therapist"] },
    audits: [],
    data: { encryptSensitive: false, backupFrequency: "weekly", backupRetentionDays: 60, retentionYears: 5 },
    compliance: { gdpr: false, hipaa: false, consentRequired: true },
  };
}

function load(): SecurityState {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (!raw) { cache = seed(); localStorage.setItem(KEY, JSON.stringify(cache)); return cache; }
  try { cache = JSON.parse(raw) as SecurityState; return cache!; } catch { cache = seed(); localStorage.setItem(KEY, JSON.stringify(cache)); return cache; }
}
function save(state: SecurityState){ cache = state; localStorage.setItem(KEY, JSON.stringify(state)); notify(); }

export function getSecurity(){ return load(); }
export function updateAuth(auth: Partial<AuthSettings>){ const s=load(); save({ ...s, auth: { ...s.auth, ...auth, passwordPolicy: { ...s.auth.passwordPolicy, ...(auth as any)?.passwordPolicy } } }); }
export function setPasswordPolicy(p: Partial<PasswordPolicy>){ const s=load(); save({ ...s, auth: { ...s.auth, passwordPolicy: { ...s.auth.passwordPolicy, ...p } } }); }
export function upsertRolePerm(rp: RolePermission){ const s=load(); const i=s.rolePerms.findIndex(x=>x.roleId===rp.roleId); const next=[...s.rolePerms]; if(i>=0) next[i]=rp; else next.push(rp); save({ ...s, rolePerms: next }); }
export function setSensitiveAccess(sa: Partial<SensitiveAccess>){ const s=load(); save({ ...s, sensitive: { ...s.sensitive, ...sa } }); }
export function addAudit(entry: Omit<AuditEntry,"id"|"at">){ const s=load(); const e: AuditEntry = { id: uid("log"), at: new Date().toISOString(), ...entry }; save({ ...s, audits: [e, ...s.audits].slice(0, 5000) }); }
export function clearAudits(){ const s=load(); save({ ...s, audits: [] }); }
export function setDataProtection(dp: Partial<DataProtection>){ const s=load(); save({ ...s, data: { ...s.data, ...dp } }); }
export function setCompliance(c: Partial<Compliance>){ const s=load(); save({ ...s, compliance: { ...s.compliance, ...c } }); }

export function exportAudits(): string { return JSON.stringify(load().audits, null, 2); }
