import { loadACL, saveACL, type User, upsertUser, getUserById } from "./acl";
import { addAudit } from "./security";

const AUTH_KEY = "auth_user_id_v1";
const REMEMBER_KEY = "auth_remember_v1";
const RESET_KEY = "auth_password_resets_v1";

const subscribers = new Set<() => void>();
function emit() {
  subscribers.forEach((cb) => cb());
}
export function subscribeAuth(cb: () => void) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

export function getCurrentUserId(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function getCurrentUser(): User | null {
  const id = getCurrentUserId();
  if (!id) return null;
  const { users } = loadACL();
  return users.find((u) => u.id === id) || null;
}

function hashPassword(pw: string) {
  try {
    return btoa(pw);
  } catch {
    return pw;
  }
}

export function setUserPassword(userId: string, password: string) {
  const u = getUserById(userId);
  if (!u) return false;
  u.password = hashPassword(password);
  u.failedAttempts = 0;
  u.lockedUntil = null;
  upsertUser(u);
  return true;
}

export function sendOTP(userId: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date();
  expires.setMinutes(expires.getMinutes() + 5);
  const map = JSON.parse(localStorage.getItem("auth_otp_v1") || "{}") as Record<string, { code:string; expiresAt:string }>;
  map[userId] = { code, expiresAt: expires.toISOString() };
  localStorage.setItem("auth_otp_v1", JSON.stringify(map));
  return code;
}

export async function verifyOTP(userId: string, code: string) {
  try {
    const r = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, code }) });
    const d = await r.json();
    return d;
  } catch (e) {
    // fallback local
    const map = JSON.parse(localStorage.getItem("auth_otp_v1") || "{}") as Record<string, { code:string; expiresAt:string }>;
    const entry = map[userId];
    if (!entry) return { ok: false, error: "No OTP" };
    if (new Date(entry.expiresAt) < new Date()) return { ok: false, error: "Expired" };
    if (entry.code !== code) return { ok: false, error: "Invalid code" };
    delete map[userId];
    localStorage.setItem("auth_otp_v1", JSON.stringify(map));
    return { ok: true };
  }
}

export function login(user: User, remember = false) {
  // Ensure user exists in ACL store
  const acl = loadACL();
  const exists = acl.users.find((u) => u.id === user.id);
  if (!exists) {
    acl.users.push(user);
    saveACL(acl);
  }
  localStorage.setItem(AUTH_KEY, user.id);
  if (remember) localStorage.setItem(REMEMBER_KEY, user.id);
  try {
    addAudit({ userId: user.id, action: "login", entity: "auth" });
  } catch {}
  emit();
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(REMEMBER_KEY);
  try {
    addAudit({ userId: null, action: "logout", entity: "auth" });
  } catch {}
  emit();
}

export async function authenticate(emailOrUsername: string, password: string, remember = false) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: emailOrUsername, password })
    });
    const data = await res.json();
    if (!data.ok) return { ok: false, error: data.error || 'Invalid' };
    if (data.mfa) return { ok: true, mfa: true, userId: data.userId, demoCode: data.demoCode };
    // success: data.user contains id
    const { user } = data;
    if (user && user.id) {
      // set client-side session
      localStorage.setItem(AUTH_KEY, user.id);
      if (remember) localStorage.setItem(REMEMBER_KEY, user.id);
      emit();
      return { ok: true, user };
    }
    return { ok: false, error: 'Invalid response' };
  } catch (e) {
    // fallback to local mode
    console.warn('Auth API error fallback to local', e);
    const acl = loadACL();
    const user = acl.users.find((u) => (u.email && u.email.toLowerCase() === emailOrUsername.toLowerCase()) || u.name.toLowerCase() === emailOrUsername.toLowerCase());
    if (!user) return { ok: false, error: 'User not found' };
    if (user.lockedUntil) {
      const until = new Date(user.lockedUntil);
      if (until > new Date()) return { ok: false, error: 'Account locked. Try later.' };
      user.lockedUntil = null; user.failedAttempts = 0;
    }
    if (hashPassword(password) !== (user.password || '')) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= 5) { const until = new Date(); until.setMinutes(until.getMinutes()+15); user.lockedUntil = until.toISOString(); }
      upsertUser(user);
      return { ok: false, error: 'Invalid credentials' };
    }
    user.failedAttempts = 0; user.lockedUntil = null; upsertUser(user);
    if (user.twoFactor) { const code = sendOTP(user.id); return { ok: true, mfa: true, userId: user.id, demoCode: code }; }
    login(user, remember);
    return { ok: true, user };
  }
}

export function ensureAuthFromRemember() {
  const id = localStorage.getItem(REMEMBER_KEY);
  if (id && !getCurrentUserId()) {
    const u = getUserById(id);
    if (u) localStorage.setItem(AUTH_KEY, u.id);
  }
}

export async function forgotPassword(email: string) {
  try {
    const r = await fetch('/api/auth/forgot', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
    const d = await r.json();
    return d;
  } catch (e) {
    // fallback local
    const acl = loadACL();
    const user = acl.users.find((u) => u.email === email);
    if (!user) return { ok: false };
    const token = Math.random().toString(36).slice(2, 10);
    const resets = JSON.parse(localStorage.getItem(RESET_KEY) || "{}") as Record<string, { email: string; expiresAt: string }>;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    resets[token] = { email, expiresAt: expiresAt.toISOString() };
    localStorage.setItem(RESET_KEY, JSON.stringify(resets));
    return { ok: true, token };
  }
}

export async function verifyResetToken(token: string) {
  try {
    const r = await fetch('/api/auth/verify-token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
    const d = await r.json();
    return d;
  } catch (e) {
    // fallback to local
    const resets = JSON.parse(localStorage.getItem(RESET_KEY) || "{}") as Record<string, { email: string; expiresAt: string }>;
    const entry = resets[token];
    if (!entry) return { ok: false, error: "Invalid token" };
    if (new Date(entry.expiresAt) < new Date()) return { ok: false, error: "Expired" };
    return { ok: true, email: entry.email };
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const r = await fetch('/api/auth/reset', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password: newPassword }) });
    const d = await r.json();
    return d;
  } catch (e) {
    // fallback local
    const data = verifyResetToken(token);
    if (!(data as any).ok) return data as any;
    const resets = JSON.parse(localStorage.getItem(RESET_KEY) || "{}") as Record<string, { email: string; expiresAt: string }>;
    const entry = resets[token];
    const acl = loadACL();
    const user = acl.users.find((u) => u.email === entry.email);
    if (!user) return { ok: false, error: "User not found" };
    user.password = hashPassword(newPassword);
    user.failedAttempts = 0;
    user.lockedUntil = null;
    upsertUser(user);
    delete resets[token];
    localStorage.setItem(RESET_KEY, JSON.stringify(resets));
    return { ok: true };
  }
}

export { subscribeAuth as subscribe };
