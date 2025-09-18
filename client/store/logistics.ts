type Locale = "en" | "ar";
export type Localized = { en: string; ar: string };
export type WithId = { id: string };
export type Building = {
  id: string;
  name: Localized;
  address?: Localized;
  floors: number;
  capacity: number;
  description?: Localized;
  photo?: string;
};
export type RoomType = "therapy" | "dormitory" | "medical" | "office" | "recreational";
export type Room = {
  id: string;
  buildingId: string;
  name: Localized;
  floor: number;
  type: RoomType;
  capacity: number;
  accessibility: Localized[]; // tags
  assigned?: Localized; // staff/department free text
  active: boolean;
};
export type Recurrence = { type: "none" | "weekly"; days?: number[] };
export type RoomSchedule = {
  id: string;
  roomId: string;
  title: Localized;
  kind: "therapy" | "medical" | "activity";
  start: string; // ISO
  end: string; // ISO
  recurrence: Recurrence;
};
export type EquipmentStatus = "available" | "maintenance" | "in_use";
export type Equipment = { id: string; roomId: string; name: Localized; status: EquipmentStatus };

export type LogisticsState = {
  buildings: Building[];
  rooms: Room[];
  schedules: RoomSchedule[];
  equipment: Equipment[];
};

const KEY = "dalma_logistics_v1";
let cache: LogisticsState | null = null;
const subs = new Set<() => void>();

export function subscribeLogistics(cb: () => void) { subs.add(cb); return () => subs.delete(cb); }
function notify() { subs.forEach((cb) => cb()); }
export function uid(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2,8)}${Date.now().toString(36)}`; }
function L(en: string, ar = ""): Localized { return { en, ar }; }

function seed(): LogisticsState {
  const b1 = { id: uid("b"), name: L("Main Building", "المبنى الرئيسي"), address: L("Street 1", "شارع ١"), floors: 3, capacity: 200, description: L("Primary facility", "المرفق الأساسي"), photo: "" };
  const r1 = { id: uid("r"), buildingId: b1.id, name: L("Therapy Room 101", "غرفة علاج ١٠١"), floor: 1, type: "therapy" as RoomType, capacity: 4, accessibility: [L("Wheelchair" , "كرسي متحرك")], active: true } as Room;
  const r2 = { id: uid("r"), buildingId: b1.id, name: L("Medical Office 201", "مكتب طبي ٢٠١"), floor: 2, type: "medical" as RoomType, capacity: 2, accessibility: [], active: true } as Room;
  const s1: RoomSchedule = { id: uid("s"), roomId: r1.id, title: L("Physio Session", "جلسة علاج طبيعي"), kind: "therapy", start: new Date().toISOString(), end: new Date(Date.now()+60*60*1000).toISOString(), recurrence: { type: "none" } };
  const e1: Equipment = { id: uid("e"), roomId: r1.id, name: L("Treadmill", "جهاز مشي"), status: "available" };
  return { buildings: [b1], rooms: [r1, r2], schedules: [s1], equipment: [e1] };
}

function load(): LogisticsState {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (!raw) { cache = seed(); localStorage.setItem(KEY, JSON.stringify(cache)); return cache; }
  try { cache = JSON.parse(raw) as LogisticsState; return cache!; } catch { cache = seed(); localStorage.setItem(KEY, JSON.stringify(cache)); return cache; }
}
function save(state: LogisticsState) { cache = state; localStorage.setItem(KEY, JSON.stringify(state)); notify(); }

export function getLogistics(): LogisticsState { return load(); }

function upsert<T extends WithId>(arr: T[], item: T): T[] { const i = arr.findIndex(x=>x.id===item.id); if (i>=0) { const c=[...arr]; c[i]=item; return c; } return [item, ...arr]; }
function removeById<T extends WithId>(arr: T[], id: string): T[] { return arr.filter(x=>x.id!==id); }

export function upsertBuilding(b: Building) { const s=load(); save({ ...s, buildings: upsert(s.buildings, b) }); }
export function removeBuilding(id: string) {
  const s=load();
  const rooms = s.rooms.filter(r=>r.buildingId===id).map(r=>r.id);
  save({ ...s, buildings: removeById(s.buildings, id), rooms: s.rooms.filter(r=>r.buildingId!==id), schedules: s.schedules.filter(sc=>!rooms.includes(sc.roomId)), equipment: s.equipment.filter(eq=>!rooms.includes(eq.roomId)) });
}

export function upsertRoom(r: Room) { const s=load(); save({ ...s, rooms: upsert(s.rooms, r) }); }
export function removeRoom(id: string) { const s=load(); save({ ...s, rooms: removeById(s.rooms, id), schedules: s.schedules.filter(sc=>sc.roomId!==id), equipment: s.equipment.filter(eq=>eq.roomId!==id) }); }

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) { return aStart < bEnd && aEnd > bStart; }
function dayOfWeek(d: Date) { return d.getDay(); }

export function hasScheduleConflict(candidate: RoomSchedule, list = load().schedules): boolean {
  const cStart = new Date(candidate.start); const cEnd = new Date(candidate.end);
  for (const s of list) {
    if (s.roomId !== candidate.roomId || s.id === candidate.id) continue;
    const sStart = new Date(s.start); const sEnd = new Date(s.end);
    // Non-repeating vs non-repeating
    if (candidate.recurrence.type === "none" && s.recurrence.type === "none") {
      if (overlaps(cStart, cEnd, sStart, sEnd)) return true;
    } else {
      // weekly simple check: if any weekday matches and time overlaps
      const cDays = candidate.recurrence.type === "weekly" ? (candidate.recurrence.days || []) : [dayOfWeek(cStart)];
      const sDays = s.recurrence.type === "weekly" ? (s.recurrence.days || []) : [dayOfWeek(sStart)];
      const anyDay = cDays.some(d=>sDays.includes(d));
      if (anyDay) {
        const ct0 = new Date(0,0,0,cStart.getHours(), cStart.getMinutes());
        const ct1 = new Date(0,0,0,cEnd.getHours(), cEnd.getMinutes());
        const st0 = new Date(0,0,0,sStart.getHours(), sStart.getMinutes());
        const st1 = new Date(0,0,0,sEnd.getHours(), sEnd.getMinutes());
        if (overlaps(ct0, ct1, st0, st1)) return true;
      }
    }
  }
  return false;
}

export function upsertSchedule(sc: RoomSchedule): { ok: boolean; reason?: string } {
  const s=load();
  if (hasScheduleConflict(sc, s.schedules)) return { ok: false, reason: "conflict" };
  save({ ...s, schedules: upsert(s.schedules, sc) });
  return { ok: true };
}
export function removeSchedule(id: string) { const s=load(); save({ ...s, schedules: removeById(s.schedules, id) }); }

export function upsertEquipment(eq: Equipment) { const s=load(); save({ ...s, equipment: upsert(s.equipment, eq) }); }
export function removeEquipment(id: string) { const s=load(); save({ ...s, equipment: removeById(s.equipment, id) }); }
