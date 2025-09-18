export type Locale = "en" | "ar";

const LOCALE_KEY = "app_locale_v1";

const subs = new Set<() => void>();

export function subscribeLocale(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function getLocale(): Locale {
  const v = localStorage.getItem(LOCALE_KEY);
  return (v === "en" || v === "ar" ? v : "ar") as Locale;
}

export function setLocale(locale: Locale) {
  localStorage.setItem(LOCALE_KEY, locale);
  // update document attributes
  const el = document.documentElement;
  el.setAttribute("lang", locale === "ar" ? "ar" : "en");
  el.setAttribute("dir", locale === "ar" ? "rtl" : "ltr");
  subs.forEach((cb) => cb());
}

export function dir(): "rtl" | "ltr" {
  return getLocale() === "ar" ? "rtl" : "ltr";
}

const messages = {
  en: {
    brand: "DALMA Smart Platform",
    nav: {
      home: "Home",
      admin: "Admin",
      beneficiaries: "Beneficiaries",
      employees: "Employees",
      family: "Family",
      reports: "Reports",
      donations: "Donations",
      accessControl: "Access Control",
    },
    header: {
      donate: "Donate",
      dashboard: "Dashboard",
      signIn: "Sign in",
      signOut: "Sign out",
      chooseRole: "Choose role",
      welcome: "Welcome",
      guest: "Guest",
      administrator: "Administrator",
      staff: "Staff",
      family: "Family",
      beneficiary: "Beneficiary",
    },
    home: {
      hero: {
        badge: "End-to-end care for people with disabilities",
        title: "DALMA Smart Platform",
        desc:
          "A unified, cloud-based system connecting beneficiaries, employees, administrators, and families—delivering transparent, efficient, and sustainable services.",
        ctaAdmin: "Explore Admin Dashboard",
        ctaDonate: "Support with a Donation",
      },
      metrics: {
        active: "Active Beneficiaries",
        monthly: "Monthly Appointments",
        satisfaction: "Avg. Satisfaction",
      },
      portals: {
        title: "Portals for every stakeholder",
        desc:
          "Beneficiary, Employee, Admin, and Family portals streamline daily operations—registration, records, therapies, attendance, and secure communication.",
        open: "Open",
        beneficiary: {
          title: "Beneficiary Portal",
          bullets: [
            "Registration & profiles",
            "Upload documents",
            "Appointments & therapies",
            "Status tracking",
          ],
        },
        employee: {
          title: "Employee Portal",
          bullets: [
            "Tasks & notes",
            "Clock in/out & field",
            "Access records",
            "Incident reports",
          ],
        },
        admin: {
          title: "Admin Dashboard",
          bullets: [
            "KPI analytics",
            "Roles & permissions",
            "Budgets & finance",
            "Audit logs",
          ],
        },
        family: {
          title: "Family System",
          bullets: [
            "Health status",
            "Attendance & progress",
            "Alerts & schedules",
            "Direct messaging",
          ],
        },
      },
      monitor: {
        title: "Real-time Monitoring",
        desc: "Visual indicators for medical, psychological, and functional status.",
        medical: "Medical",
        psychological: "Psychological",
        functional: "Functional",
        updated: "Updated live from check-ins, therapy completion, and device integrations.",
      },
      notifications: {
        title: "Smart Notifications",
        desc: "Priority-based alerts for emergencies, absences, and schedule changes.",
        urgentFlag: "Emergency flag raised (Ward B)",
        urgent: "Urgent",
        absences: "3 absences detected",
        medium: "Medium",
        schedule: "Schedule updated for therapies",
        low: "Low",
      },
      security: {
        title: "Security, accessibility, and trust",
        desc:
          "Advanced security with data encryption, 2FA, audit logs, and full accessibility. Cloud ready and scalable with integrations into national systems and medical devices.",
        features: {
          advanced: { title: "Advanced Security", text: "Encryption at rest & in transit, 2FA, and role-based access." },
          comms: { title: "Unified Communication", text: "Internal messaging, file sharing, and family updates." },
          schedule: { title: "Scheduling & Reminders", text: "Therapies, health checks, and appointment reminders." },
          reports: { title: "Reports & Exports", text: "KPI tracking with export to Excel & PDF." },
        },
      },
      cta: {
        title: "Ready to modernize your center?",
        desc: "Let’s digitize operations and elevate quality of care—together.",
        button: "Launch the Dashboard",
      },
    },
  },
  ar: {
    brand: "منصة دلما الذكية",
    nav: {
      home: "الرئيسية",
      admin: "لوحة التحكم",
      beneficiaries: "المستفيدون",
      employees: "الموظفون",
      family: "العائلة",
      reports: "التقارير",
      donations: "التبرعات",
      accessControl: "التحكم بالصلاحيات",
    },
    header: {
      donate: "تبرع",
      dashboard: "لوحة التحكم",
      signIn: "تسجيل الدخول",
      signOut: "تسجيل الخروج",
      chooseRole: "اختر الدور",
      welcome: "مرحبا",
      guest: "بالضيف",
      administrator: "مدير النظام",
      staff: "موظف",
      family: "عائلة",
      beneficiary: "مستفيد",
    },
    home: {
      hero: {
        badge: "رعاية شاملة للأشخاص ذوي الإعاقة",
        title: "منصة دلما الذكية",
        desc:
          "نظام موحد قائم على السحابة يربط المستفيدين والموظفين والإداريين والعائلات — يقدم خدمات شفافة وفعالة ومستدامة.",
        ctaAdmin: "فتح لوحة التحكم",
        ctaDonate: "ادعمنا بالتبرع",
      },
      metrics: {
        active: "المستفيدون النشطون",
        monthly: "المواعيد الشهرية",
        satisfaction: "متوسط الرضا",
      },
      portals: {
        title: "بوابات لجميع الأطراف",
        desc:
          "بوابات المستفيد والموظف والإدارة والعائلة لتبسيط العمليات اليومية — التسجيل والسجلات والعلاجات والحضور والتواصل الآمن.",
        open: "فتح",
        beneficiary: {
          title: "بوابة المستفيد",
          bullets: ["التسجيل والملفات الشخصية", "رفع المستندات", "المواعيد والعلاجات", "تتبع الحالة"],
        },
        employee: {
          title: "بوابة الموظف",
          bullets: ["المهام والملاحظات", "تسجيل الحضور/الانصراف والميدان", "الوصول إلى السجلات", "تقارير الحوادث"],
        },
        admin: {
          title: "لوحة التحكم",
          bullets: ["تحليلات المؤشرات", "الأدوار والصلاحيات", "الميزانيات والمالية", "سجلات التدقيق"],
        },
        family: {
          title: "نظام العائلة",
          bullets: ["الحالة الصحية", "الحضور والتقدم", "التنبيهات والجداول", "رسائل مباشرة"],
        },
      },
      monitor: {
        title: "المراقبة الفورية",
        desc: "مؤشرات مرئية للحالة الطبية والنفسية والوظيفية.",
        medical: "طبي",
        psychological: "نفسي",
        functional: "وظيفي",
        updated: "تحديثات مباشرة من تسجيلات الوص��ل وإكمال العلاج والتكامل مع الأجهزة.",
      },
      notifications: {
        title: "تنبيهات ذكية",
        desc: "تنبيهات ذات أولوية للطوارئ والغيابات وتغييرات الجداول.",
        urgentFlag: "إشارة طوارئ مرفوعة (جناح ب)",
        urgent: "عاجل",
        absences: "تم رصد ٣ غيابات",
        medium: "متوسط",
        schedule: "تم تحديث جدول العلاجات",
        low: "منخفض",
      },
      security: {
        title: "الأمان وإمكانية الوصول والثقة",
        desc:
          "أمان متقدم مع تشفير البيانات والمصادقة الثنائية وسجلات التدقيق وإمكانية الوصول الكاملة. جاهز للسحابة وقابل للتوسع مع تكاملات للأنظمة الوطنية والأجهزة الطبية.",
        features: {
          advanced: { title: "أمان متقدم", text: "تشفير أثناء السكون والنقل، مصادقة ثنائية، وصلاحيات حسب الأدوار." },
          comms: { title: "اتصال موحد", text: "رسائل داخلية، مشاركة ملفات، وتحديثات للعائلة." },
          schedule: { title: "الجدولة والتذكيرات", text: "العلاجات، الفحوصات الصحية، وتذكيرات المواعيد." },
          reports: { title: "التقارير والتصدير", text: "تتبع المؤشرات مع التصدير إلى Excel وPDF." },
        },
      },
      cta: {
        title: "هل أنت مستعد لتحديث مركزك؟",
        desc: "لنقم برقمنة العمليات والارتقاء بجودة الرعاية — معاً.",
        button: "افتح لوحة التحكم",
      },
    },
  },
} as const;

type Paths<T> = T extends object
  ? { [K in keyof T]: `${Extract<K, string>}` | (T[K] extends object ? `${Extract<K, string>}.${Paths<T[K]>}` : never) }[keyof T]
  : never;

type MessageKey = Paths<typeof messages.en>;

export function t(key: MessageKey): string {
  const loc = getLocale();
  const parts = key.split(".");
  let obj: any = messages[loc as keyof typeof messages];
  for (const p of parts) {
    obj = obj?.[p];
    if (obj === undefined) break;
  }
  return typeof obj === "string" ? obj : key;
}
