function uid() {
  // Prefer secure UUID when available
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export type Gender = "male" | "female";
export type DisabilityType =
  | "physical"
  | "intellectual"
  | "sensory"
  | "autism"
  | "multiple";
export type BeneficiaryStatus =
  | "active"
  | "under_treatment"
  | "graduated"
  | "inactive";

export type Contact = { phone: string; email?: string; address?: string };
export type Guardian = { name: string; relation: string; phone: string };
export type Medication = { name: string; dosage: string; schedule: string };
export type Appointment = {
  id: string;
  type: string;
  date: string; // ISO
  therapist?: string;
  attended?: boolean;
};
export type DocumentItem = {
  id: string;
  type: string; // e.g. "Medical Report"
  title: string;
  url?: string;
  issuedAt?: string; // ISO
  expiresAt?: string; // ISO
};
export type Payment = { id: string; date: string; amount: number; method: string; note?: string };
export type Message = { id: string; from: "staff" | "guardian" | "system"; content: string; date: string };

export type Beneficiary = {
  id: string;
  name: string;
  photoUrl?: string;
  gender: Gender;
  dob: string; // ISO date
  beneficiaryId: string;
  civilId: string;
  contact: Contact;
  guardian: Guardian;
  medical: {
    disabilityType: DisabilityType;
    history?: string;
    diagnoses?: string[];
    treatments?: string[];
    medications?: Medication[];
    allergies?: string[];
  };
  care: {
    goals: string[];
    assignedDoctor?: string;
    assignedTherapist?: string;
    progress: number; // 0-100
    appointments: Appointment[];
    nextReview?: string; // ISO
  };
  education: {
    programs: string[];
    activities: string[];
  };
  documents: DocumentItem[];
  financial: {
    sponsorship?: string;
    supportPrograms?: string[];
    paymentHistory: Payment[];
  };
  communication: {
    messages: Message[];
    notifications: { id: string; text: string; level: "low" | "medium" | "high" }[];
  };
  emergency: {
    contacts: Guardian[];
    notes?: string;
  };
  status: BeneficiaryStatus;
};

const KEY = "dalma_beneficiaries_v1";
const subs = new Set<() => void>();
let cache: Beneficiary[] | null = null;

function notify() {
  subs.forEach((cb) => cb());
}

export function subscribeBeneficiaries(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

function calcAge(dobIso: string) {
  const dob = new Date(dobIso);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

export function getAge(b: Beneficiary) {
  return calcAge(b.dob);
}

function seed(): Beneficiary[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString();
  const daysFromNow = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  const daysAgo = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return iso(d);
  };

  const b1: Beneficiary = {
    id: uid(),
    name: "Ahmed Khalid",
    gender: "male",
    dob: "2010-06-12",
    beneficiaryId: "B-1001",
    civilId: "1087654321",
    contact: { phone: "+966500000001", email: "ahmed.khalid@example.com", address: "Riyadh" },
    guardian: { name: "Khalid Al Saud", relation: "Father", phone: "+966500000010" },
    medical: {
      disabilityType: "autism",
      history: "Diagnosed with ASD Level 2 in 2016.",
      diagnoses: ["ASD Level 2"],
      treatments: ["ABA therapy", "Speech therapy"],
      medications: [{ name: "Melatonin", dosage: "3mg", schedule: "Before sleep" }],
      allergies: ["Peanuts"],
    },
    care: {
      goals: ["Improve communication by 20%", "Increase attention span to 15 minutes"],
      assignedDoctor: "Dr. Rana Al Harbi",
      assignedTherapist: "Sara Al Qahtani",
      progress: 62,
      appointments: [
        { id: uid(), type: "ABA", date: daysAgo(2), therapist: "Sara Al Qahtani", attended: false },
        { id: uid(), type: "Speech", date: daysFromNow(1), therapist: "Khaled Al Mutairi", attended: undefined },
      ],
      nextReview: daysFromNow(6),
    },
    education: { programs: ["Daycare"], activities: ["Art", "Music"] },
    documents: [
      { id: uid(), type: "Disability Certificate", title: "Disability Certificate 2024", issuedAt: daysAgo(120), expiresAt: daysFromNow(25) },
      { id: uid(), type: "Medical Report", title: "ASD Evaluation Report", issuedAt: daysAgo(40) },
    ],
    financial: {
      sponsorship: "Charity A",
      supportPrograms: ["Gov Support 12"],
      paymentHistory: [
        { id: uid(), date: daysAgo(20), amount: 1200, method: "Bank Transfer", note: "Monthly fee" },
        { id: uid(), date: daysAgo(50), amount: 1200, method: "Bank Transfer" },
      ],
    },
    communication: {
      messages: [
        { id: uid(), from: "staff", content: "Reminder: ABA session tomorrow at 10 AM.", date: iso(today) },
        { id: uid(), from: "guardian", content: "Noted, thank you.", date: iso(today) },
      ],
      notifications: [
        { id: uid(), text: "Missed session on Monday.", level: "medium" },
        { id: uid(), text: "Certificate expiring soon.", level: "high" },
      ],
    },
    emergency: { contacts: [{ name: "Khalid Al Saud", relation: "Father", phone: "+966500000010" }], notes: "Carry EpiPen due to peanut allergy." },
    status: "under_treatment",
  };

  const b2: Beneficiary = {
    id: uid(),
    name: "Mona Saleh",
    gender: "female",
    dob: "2006-11-02",
    beneficiaryId: "B-1002",
    civilId: "1099992222",
    contact: { phone: "+966500000002", email: "mona.saleh@example.com", address: "Jeddah" },
    guardian: { name: "Saleh Mohammed", relation: "Father", phone: "+966500000011" },
    medical: {
      disabilityType: "physical",
      history: "Spinal cord injury (2019).",
      diagnoses: ["SCI"],
      treatments: ["Physiotherapy"],
      medications: [{ name: "Ibuprofen", dosage: "200mg", schedule: "PRN" }],
      allergies: [],
    },
    care: {
      goals: ["Improve mobility with wheelchair transfers", "Upper body strength training"],
      assignedDoctor: "Dr. Ahmed Al Omran",
      assignedTherapist: "Latifa Al Dossary",
      progress: 78,
      appointments: [
        { id: uid(), type: "Physiotherapy", date: daysFromNow(2), therapist: "Latifa Al Dossary" },
        { id: uid(), type: "Occupational", date: daysFromNow(10), therapist: "Noura Al Yamani" },
      ],
      nextReview: daysFromNow(14),
    },
    education: { programs: ["Workshops", "Recreation"], activities: ["Swimming"] },
    documents: [
      { id: uid(), type: "Medical Report", title: "Physio Progress", issuedAt: daysAgo(10) },
    ],
    financial: {
      sponsorship: "Self-funded",
      supportPrograms: ["NGO-Assist"],
      paymentHistory: [{ id: uid(), date: daysAgo(5), amount: 1500, method: "Card" }],
    },
    communication: {
      messages: [{ id: uid(), from: "system", content: "Therapy schedule updated.", date: iso(today) }],
      notifications: [{ id: uid(), text: "Upcoming review in 2 weeks.", level: "low" }],
    },
    emergency: { contacts: [{ name: "Huda Al Naim", relation: "Mother", phone: "+966500000012" }], notes: "Wheelchair accessible transport needed." },
    status: "active",
  };

  const b3: Beneficiary = {
    id: uid(),
    name: "Yousef Ali",
    gender: "male",
    dob: "1999-03-22",
    beneficiaryId: "B-1003",
    civilId: "1077711111",
    contact: { phone: "+966500000003", email: "yousef.ali@example.com", address: "Dammam" },
    guardian: { name: "Ali Mohammed", relation: "Father", phone: "+966500000013" },
    medical: {
      disabilityType: "sensory",
      history: "Hearing impairment since birth.",
      diagnoses: ["Severe hearing loss"],
      treatments: ["Audiology"],
      medications: [],
      allergies: ["Penicillin"],
    },
    care: {
      goals: ["Improve sign language vocabulary"],
      assignedDoctor: "Dr. Sami Al Harthy",
      assignedTherapist: "Omar Al Essa",
      progress: 54,
      appointments: [
        { id: uid(), type: "Audiology", date: daysAgo(1), therapist: "Omar Al Essa", attended: true },
        { id: uid(), type: "Speech", date: daysFromNow(7), therapist: "Amal Al Yamani" },
      ],
      nextReview: daysFromNow(30),
    },
    education: { programs: ["Daycare"], activities: ["Sign Language Club"] },
    documents: [
      { id: uid(), type: "Disability Certificate", title: "Certificate 2023", issuedAt: daysAgo(320), expiresAt: daysFromNow(40) },
    ],
    financial: {
      sponsorship: "Gov Support 8",
      supportPrograms: ["Gov Support 8"],
      paymentHistory: [],
    },
    communication: {
      messages: [],
      notifications: [{ id: uid(), text: "Document nearing expiry in 40 days.", level: "medium" }],
    },
    emergency: { contacts: [{ name: "Ali Mohammed", relation: "Father", phone: "+966500000013" }], notes: "Avoid penicillin." },
    status: "graduated",
  };

  return [b1, b2, b3];
}

function load(): Beneficiary[] {
  if (cache) return cache;
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    cache = s;
    return s;
  }
  try {
    const data = JSON.parse(raw) as Beneficiary[];
    cache = data;
    return data;
  } catch {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    cache = s;
    return s;
  }
}

function save(list: Beneficiary[]) {
  cache = list;
  localStorage.setItem(KEY, JSON.stringify(list));
  notify();
}

export function listBeneficiaries() {
  return load();
}

export function getBeneficiary(id: string) {
  return load().find((b) => b.id === id) || null;
}

export function upsertBeneficiary(b: Beneficiary) {
  const arr = load();
  const idx = arr.findIndex((x) => x.id === b.id);
  if (idx === -1) arr.unshift(b);
  else arr[idx] = b;
  save([...arr]);
}

export function removeBeneficiary(id: string) {
  save(load().filter((b) => b.id !== id));
}

export function newBeneficiary(partial: Partial<Beneficiary>): Beneficiary {
  const b: Beneficiary = {
    id: uid(),
    name: partial.name || "",
    gender: partial.gender || "male",
    dob: partial.dob || "2010-01-01",
    beneficiaryId: partial.beneficiaryId || `B-${Math.floor(Math.random() * 9000 + 1000)}`,
    civilId: partial.civilId || "",
    contact: partial.contact || { phone: "" },
    guardian: partial.guardian || { name: "", relation: "", phone: "" },
    medical: partial.medical || { disabilityType: "physical" },
    care: partial.care || { goals: [], progress: 0, appointments: [] },
    education: partial.education || { programs: [], activities: [] },
    documents: partial.documents || [],
    financial: partial.financial || { paymentHistory: [] },
    communication: partial.communication || { messages: [], notifications: [] },
    emergency: partial.emergency || { contacts: [] },
    status: partial.status || "active",
  };
  return b;
}

export type BeneficiaryQuery = {
  search?: string;
  disability?: DisabilityType | "all";
  status?: BeneficiaryStatus | "all";
  program?: string | "all";
  therapist?: string | "all";
  ageMin?: number;
  ageMax?: number;
};

export function queryBeneficiaries(q: BeneficiaryQuery): Beneficiary[] {
  const data = load();
  const search = (q.search || "").toLowerCase().trim();
  return data.filter((b) => {
    if (search) {
      const hay = [b.name, b.beneficiaryId, b.civilId, b.guardian.name, b.care.assignedDoctor, b.care.assignedTherapist]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(search)) return false;
    }
    if (q.disability && q.disability !== "all" && b.medical.disabilityType !== q.disability) return false;
    if (q.status && q.status !== "all" && b.status !== q.status) return false;
    if (q.program && q.program !== "all" && !b.education.programs.includes(q.program)) return false;
    if (q.therapist && q.therapist !== "all" && b.care.assignedTherapist !== q.therapist) return false;
    const age = getAge(b);
    if (q.ageMin != null && age < q.ageMin) return false;
    if (q.ageMax != null && age > q.ageMax) return false;
    return true;
  });
}

export function computeAlerts() {
  const now = new Date();
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  const missed: { id: string; text: string; level: "high" | "medium" | "low" }[] = [];
  const expiring: { id: string; text: string; level: "high" | "medium" | "low" }[] = [];
  const reviews: { id: string; text: string; level: "high" | "medium" | "low" }[] = [];
  for (const b of load()) {
    for (const ap of b.care.appointments) {
      const d = new Date(ap.date);
      if (d < now && ap.attended === false) {
        missed.push({ id: b.id, text: `${b.name}: Missed ${ap.type} session`, level: "medium" });
      }
    }
    for (const doc of b.documents) {
      if (!doc.expiresAt) continue;
      const d = new Date(doc.expiresAt);
      if (d <= soon) {
        const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const lvl: "high" | "medium" | "low" = diff <= 7 ? "high" : "medium";
        expiring.push({ id: b.id, text: `${b.name}: ${doc.title} expires in ${diff} days`, level: lvl });
      }
    }
    if (b.care.nextReview) {
      const d = new Date(b.care.nextReview);
      const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diff <= 14 && diff >= 0) {
        reviews.push({ id: b.id, text: `${b.name}: Review in ${diff} days`, level: diff <= 7 ? "medium" : "low" });
      }
    }
  }
  return { missed, expiring, reviews };
}

export { subscribeBeneficiaries as subscribe };
