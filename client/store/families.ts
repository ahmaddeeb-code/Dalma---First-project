export type Gender = "male" | "female";
export type GuardianStatus = "active" | "inactive" | "deceased";
export type FamilyContact = {
  address?: string;
  phone?: string;
  email?: string;
};
export type SocioEconomic = {
  incomeLevel?: string;
  supportPrograms?: string[];
  governmentAid?: string;
};
export type DocItem = {
  id: string;
  title: string;
  url?: string;
  type?: string;
  issuedAt?: string;
};

export type Guardian = {
  id: string;
  fullName: string;
  gender: Gender;
  dob?: string;
  nationalId?: string;
  occupation?: string;
  relation?: string; // general relation
  contact: FamilyContact;
  status: GuardianStatus;
  documents: DocItem[];
};

export type LinkRelation = { guardianId: string; relation: string };
export type FamilyBeneficiaryLink = {
  beneficiaryId: string;
  relations: LinkRelation[];
};

export type Family = {
  id: string; // internal id
  familyId: string; // human id
  name?: string;
  contact: FamilyContact;
  socio?: SocioEconomic;
  notes?: string;
  guardians: Guardian[];
  links: FamilyBeneficiaryLink[];
  documents: DocItem[];
};

const KEY = "dalma_families_v1";
let cache: Family[] | null = null;
const subs = new Set<() => void>();

export function subscribeFamilies(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}
function notify() {
  subs.forEach((cb) => cb());
}
export function uid(prefix = "fam") {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
}

function seed(): Family[] {
  const f1: Family = {
    id: uid(),
    familyId: "F-1001",
    name: "Al Khalid Household",
    contact: {
      address: "Riyadh",
      phone: "+966500000100",
      email: "family1@example.com",
    },
    socio: {
      incomeLevel: "medium",
      supportPrograms: ["Gov Support 12"],
      governmentAid: "Yes",
    },
    notes: "Prefers WhatsApp.",
    guardians: [
      {
        id: uid("g"),
        fullName: "Khalid Al Saud",
        gender: "male",
        dob: "1980-05-10",
        nationalId: "1010101010",
        occupation: "Engineer",
        relation: "Father",
        contact: { phone: "+966500000010", email: "khalid@example.com" },
        status: "active",
        documents: [],
      },
    ],
    links: [],
    documents: [],
  };
  return [f1];
}

function load(): Family[] {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    cache = seed();
    localStorage.setItem(KEY, JSON.stringify(cache));
    return cache;
  }
  try {
    cache = JSON.parse(raw) as Family[];
    return cache!;
  } catch {
    cache = seed();
    localStorage.setItem(KEY, JSON.stringify(cache));
    return cache;
  }
}
function save(list: Family[]) {
  cache = list;
  localStorage.setItem(KEY, JSON.stringify(list));
  notify();
}

export function listFamilies() {
  return load();
}
export function getFamily(id: string) {
  return load().find((f) => f.id === id) || null;
}
export function upsertFamily(f: Family) {
  const arr = load();
  const i = arr.findIndex((x) => x.id === f.id);
  if (i >= 0) arr[i] = f;
  else arr.unshift(f);
  save([...arr]);
}
export function removeFamily(id: string) {
  save(load().filter((f) => f.id !== id));
}

export function addGuardian(familyId: string, g: Guardian) {
  const f = getFamily(familyId);
  if (!f) return;
  f.guardians = [g, ...f.guardians];
  upsertFamily(f);
}
export function upsertGuardian(familyId: string, g: Guardian) {
  const f = getFamily(familyId);
  if (!f) return;
  const i = f.guardians.findIndex((x) => x.id === g.id);
  if (i >= 0) f.guardians[i] = g;
  else f.guardians.unshift(g);
  upsertFamily(f);
}
export function removeGuardian(familyId: string, guardianId: string) {
  const f = getFamily(familyId);
  if (!f) return;
  f.guardians = f.guardians.filter((g) => g.id !== guardianId);
  upsertFamily(f);
}

export function linkBeneficiary(familyId: string, beneficiaryId: string) {
  const f = getFamily(familyId);
  if (!f) return;
  if (!f.links.find((l) => l.beneficiaryId === beneficiaryId))
    f.links.unshift({ beneficiaryId, relations: [] });
  upsertFamily(f);
}
export function unlinkBeneficiary(familyId: string, beneficiaryId: string) {
  const f = getFamily(familyId);
  if (!f) return;
  f.links = f.links.filter((l) => l.beneficiaryId !== beneficiaryId);
  upsertFamily(f);
}
export function setGuardianRelation(
  familyId: string,
  beneficiaryId: string,
  guardianId: string,
  relation: string,
) {
  const f = getFamily(familyId);
  if (!f) return;
  const link = f.links.find((l) => l.beneficiaryId === beneficiaryId);
  if (!link) return;
  const i = link.relations.findIndex((r) => r.guardianId === guardianId);
  if (i >= 0) link.relations[i].relation = relation;
  else link.relations.push({ guardianId, relation });
  upsertFamily(f);
}

export function addFamilyDocument(familyId: string, doc: DocItem) {
  const f = getFamily(familyId);
  if (!f) return;
  f.documents = [doc, ...f.documents];
  upsertFamily(f);
}
export function removeFamilyDocument(familyId: string, docId: string) {
  const f = getFamily(familyId);
  if (!f) return;
  f.documents = f.documents.filter((d) => d.id !== docId);
  upsertFamily(f);
}
