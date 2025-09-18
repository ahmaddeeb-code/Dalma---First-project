import { loadACL, saveACL, type User } from "./acl";

const AUTH_KEY = "auth_user_id_v1";

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

export function login(user: User) {
  // Ensure user exists in ACL store
  const acl = loadACL();
  const exists = acl.users.find((u) => u.id === user.id);
  if (!exists) {
    acl.users.push(user);
    saveACL(acl);
  }
  localStorage.setItem(AUTH_KEY, user.id);
  emit();
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  emit();
}
