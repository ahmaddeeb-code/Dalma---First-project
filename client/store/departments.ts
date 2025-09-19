export type Department = { id: string; name: string };

const KEY = "departments_v1";
let cache: Department[] | null = null;
const subs = new Set<() => void>();
function emit() { subs.forEach((cb) => cb()); }
export function subscribeDepartments(cb: () => void) {
  subs.add(cb); return () => subs.delete(cb);
}

const seed: Department[] = [
  { id: "d_admin", name: "Administration" },
  { id: "d_med", name: "Medical" },
  { id: "d_therapy", name: "Therapy" },
  { id: "d_hr", name: "Human Resources" },
  { id: "d_it", name: "IT" },
];

function load(): Department[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) { cache = seed; localStorage.setItem(KEY, JSON.stringify(seed)); return cache; }
    cache = JSON.parse(raw) as Department[];
    return cache;
  } catch {
    cache = seed; localStorage.setItem(KEY, JSON.stringify(seed)); return cache;
  }
}
function save(list: Department[]) {
  cache = list; localStorage.setItem(KEY, JSON.stringify(list)); emit();
}
export function listDepartments() { return load(); }
export function upsertDepartment(dep: Department) {
  const arr = load();
  const idx = arr.findIndex((d) => d.id === dep.id);
  if (idx >= 0) arr[idx] = dep; else arr.push(dep);
  save([...arr]);
}
export function removeDepartment(id: string) {
  save(load().filter((d) => d.id !== id));
}
export function uid(prefix = "dep") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}
