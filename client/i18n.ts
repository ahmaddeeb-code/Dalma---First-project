export type Locale = "en" | "ar";

const LOCALE_KEY = "app_locale_v1";

const subs = new Set<() => void>();

export function subscribeLocale(cb: () => void) {
  subs.add(cb);
  return () => subs.delete(cb);
}

export function getLocale(): Locale {
  const v = localStorage.getItem(LOCALE_KEY);
  return (v === "en" || v === "ar" ? v : "en") as Locale;
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
      medicalSettings: "Medical Settings",
      beneficiarySettings: "Beneficiary Settings",
      logistics: "Logistics",
      organizationSettings: "Organization Settings",
      securitySettings: "Security",
      families: "Family Profiles",
      translations: "Translations",
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
    footer: {
      copyright: "© {{year}} DALMA Center. All rights reserved.",
      privacy: "Privacy",
      security: "Security",
      contact: "Contact",
    },
    common: {
      search: "Search",
      filters: "Filters",
      role: "Role",
      roles: "Roles",
      privilege: "Privilege",
      privileges: "Privileges",
      actions: "Actions",
      name: "Name",
      email: "Email",
      departmentTitle: "Department/Title",
      total: "Total",
      doctors: "Doctors",
      therapists: "Therapists",
      add: "Add",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
      active: "Active",
      status: "Status",
      missing: "Missing",
      needsReview: "Needs review",
      export: "Export",
      import: "Import",
      readOnly: "Read-only access",
      moreCount: "+{{count}} more",
      all: "All",
      pageSize: "Page size",
      filtered: "Filtered",
      fullDataset: "Full dataset",
      format: "Format",
    },
    pages: {
      employees: {
        title: "Employee Management",
        desc: "Add employees and assign roles & privileges (e.g., Doctors, Therapists)",
        addEmployee: "Add Employee",
        cards: { total: "Total", doctors: "Doctors", therapists: "Therapists" },
        table: {
          title: "Employees",
          desc: "Click edit to update roles and privileges",
        },
        filters: { searchPlaceholder: "Name, email, department..." },
        confirmDeleteTitle: "Delete employee?",
        confirmDeleteMsg: "This user will be removed from the system.",
        deleted: "Deleted",
      },
      accessControl: {
        title: "Access Control",
        subtitle: "Manage users, roles and privileges securely.",
        tabs: { users: "Users", roles: "Roles", privs: "Privileges" },
        users: {
          title: "Users",
          desc: "Create accounts and assign roles/privileges.",
          headers: {
            name: "Name",
            email: "Email",
            roles: "Roles",
            effectivePrivs: "Effective Privileges",
            actions: "Actions",
          },
          new: "New User",
          edit: "Edit User",
          delete: "Delete",
          deleted: "Deleted",
          form: {
            name: "Name",
            email: "Email",
            roles: "Roles",
            directPrivs: "Direct Privileges",
          },
        },
        roles: {
          title: "Roles",
          desc: "Roles bundle privileges for easier assignment.",
          headers: {
            name: "Name",
            privs: "Privileges",
            users: "Users",
            actions: "Actions",
          },
          new: "New Role",
          edit: "Edit Role",
          delete: "Delete",
          form: {
            name: "Name",
            description: "Description",
            privs: "Privileges",
          },
        },
        privileges: {
          title: "Privileges",
          desc: "Atomic permissions assigned to roles or directly to users.",
          headers: {
            name: "Name",
            category: "Category",
            usedInRoles: "Used in roles",
            usedInUsers: "Used in users",
            actions: "Actions",
          },
          new: "New Privilege",
          edit: "Edit Privilege",
          delete: "Delete",
          form: {
            name: "Name",
            description: "Description",
            category: "Category",
            placeholder: "e.g., Records, Administration, Reporting",
          },
        },
      },
      medical: {
        title: "Medical & Treatment Settings",
        subtitle:
          "Configure therapy types, templates, meds, scheduling, progress, and emergency protocols.",
        saved: "Saved",
        tabs: {
          therapy: "Therapy Types",
          plans: "Treatment Plans",
          medication: "Medication",
          scheduling: "Scheduling",
          progress: "Progress Tracking",
          emergency: "Emergency & Notes",
        },
        common: { description: "Description", addNew: "Add new" },
        therapy: {
          title: "Therapy Session Types",
          desc: "Manage categories, durations, and default frequency.",
          duration: "Duration",
          frequency: "Default Frequency",
          min: "min",
          freq: { daily: "Daily", weekly: "Weekly", monthly: "Monthly" },
        },
        plans: {
          title: "Treatment Plan Templates",
          desc: "Standardized goals and interventions.",
          assigned: "Assigned to",
          doctor: "Doctor",
          therapist: "Therapist",
          goals: "Goals:",
          interventions: "Interventions:",
          addGoal: "Add goal",
          addIntervention: "Add intervention",
        },
        medication: {
          title: "Medication Settings",
          desc: "Categories, dosage units, and standard schedules.",
          categories: "Categories",
          units: "Dosage Units",
          schedules: "Schedules",
        },
        scheduling: {
          title: "Appointment Scheduling",
          desc: "Working hours and booking rules.",
          sessionLength: "Session length (min)",
          maxPerDay: "Max sessions/day",
          bufferMin: "Buffer (min)",
          allowRecurring: "Enable recurring appointments",
          workingHours: "Working hours (by day)",
          day: "Day",
          start: "Start",
          end: "End",
        },
        progress: {
          title: "Progress Tracking",
          desc: "Evaluation criteria and report frequency.",
          reportFreq: "Report frequencies",
        },
        emergency: {
          title: "Emergency & Special Notes",
          desc: "Configure emergency protocols and notes.",
          steps: "Protocol steps",
          addStep: "Add step",
        },
      },
      translations: {
        title: "Translations Management",
        desc: "Manage translations by English keys and check completeness",
        totalKeys: "Total keys",
        missing: "Missing",
        needsReview: "Needs review",
        tableTitle: "Translations",
        tableDesc: "Search and edit Arabic",
        onlyMissing: "Only missing/review",
        placeholder: "Search by key or text",
        export: "Export",
        import: "Import",
        fileInvalid: "Invalid file",
        importedN: "Imported {{count}}",
        saved: "Saved",
      },
      beneficiaries: {
        title: "Beneficiary Management",
        desc: "List of beneficiaries with search, filters, and quick access to profiles",
        stats: {
          total: "Total",
          active: "Active",
          under: "Under Treatment",
          graduated: "Graduated",
        },
        filters: {
          search: "Search",
          disability: "Disability",
          status: "Status",
          program: "Program",
          therapist: "Therapist",
          sortBy: "Sort by",
          sortDir: "Direction",
          minAge: "Min Age",
          maxAge: "Max Age",
          searchPlaceholder: "Name, ID, guardian...",
          asc: "Asc",
          desc: "Desc",
          all: "All",
        },
        actions: {
          add: "Add Beneficiary",
          notify: "Send Notification",
          export: "Export",
          archive: "Archive",
          clear: "Clear",
          open: "Open",
        },
        table: {
          beneficiary: "Beneficiary",
          age: "Age",
          disability: "Disability",
          programs: "Programs",
          therapist: "Therapist",
          status: "Status",
          profile: "Profile",
        },
        badges: {
          active: "Active",
          underTreatment: "Under treatment",
          graduated: "Graduated",
          inactive: "Inactive",
        },
        alerts: {
          title: "Alerts",
          desc: "Missed sessions, upcoming reviews, expiring documents",
          missed: "Missed",
          review: "Review",
          expiring: "Expiring",
          none: "No alerts",
        },
      },
      admin: {
        title: "Admin Dashboard",
        subtitle:
          "Real-time view over beneficiaries, staff, services and alerts.",
        buttons: {
          accessControl: "Access Control",
          exportReport: "Export Report",
          notifications: "Notification Center",
        },
        tiles: {
          beneficiaries: { title: "Beneficiaries", deltaToday: "+24 today" },
          appointments: { title: "Appointments Today" },
          staffUtil: {
            title: "Staff Utilization",
            note: "Target 75% · Overtime 6%",
          },
          quality: {
            title: "Quality KPI",
            desc: "Based on therapy completion, incident rate, and satisfaction surveys.",
          },
        },
        chart: {
          title: "Beneficiaries by Category",
          desc: "Distribution across Residential, Daycare, and Home-based services.",
          labels: {
            residential: "Residential",
            daycare: "Daycare",
            home: "Home-based",
          },
        },
        alerts: {
          title: "Urgent Alerts",
          desc: "Real-time critical notifications.",
          items: {
            missedMedication: "Missed medication (Room 203)",
            transportDelay: "Transport delay (5 beneficiaries)",
            therapyRescheduled: "Therapy rescheduled",
          },
          levels: { high: "High", medium: "Medium", info: "Info" },
        },
        team: {
          title: "Team Performance",
          desc: "Attendance, notes, and incident reporting.",
          summary: "92% on-time clock-ins · 18 field visits",
        },
        reviews: {
          title: "Upcoming Reviews",
          desc: "Medical and psychological assessments this week.",
          summary: "54 scheduled reviews",
        },
        notifSummary: {
          title: "Notifications Summary",
          desc: "Automated alerts and messages.",
          summary: "12 urgent · 36 normal · 128 info",
        },
      },
    },
    home: {
      hero: {
        badge: "End-to-end care for people with disabilities",
        title: "DALMA Smart Platform",
        desc: "A unified, cloud-based system connecting beneficiaries, employees, administrators, and families—delivering transparent, efficient, and sustainable services.",
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
        desc: "Beneficiary, Employee, Admin, and Family portals streamline daily operations—registration, records, therapies, attendance, and secure communication.",
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
        updated:
          "Updated live from check-ins, therapy completion, and device integrations.",
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
        desc: "Advanced security with data encryption, 2FA, audit logs, and full accessibility. Cloud ready and scalable with integrations into national systems and medical devices.",
        features: {
          advanced: {
            title: "Advanced Security",
            text: "Encryption at rest & in transit, 2FA, and role-based access.",
          },
          comms: {
            title: "Unified Communication",
            text: "Internal messaging, file sharing, and family updates.",
          },
          schedule: {
            title: "Scheduling & Reminders",
            text: "Therapies, health checks, and appointment reminders.",
          },
          reports: {
            title: "Reports & Exports",
            text: "KPI tracking with export to Excel & PDF.",
          },
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
      medicalSettings: "إعدادات طبية",
      beneficiarySettings: "إعدادات المستفيد",
      logistics: "الخدمات اللوجستية",
      organizationSettings: "إعدادات المؤسسة",
      securitySettings: "الأمان",
      families: "ملفات العائلات",
      translations: "الترجمات",
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
    footer: {
      copyright: "© {{year}} مركز دلما. جميع الحقوق محفوظة.",
      privacy: "الخصوصية",
      security: "الأمان",
      contact: "تواصل",
    },
    common: {
      search: "بحث",
      filters: "الفلاتر",
      role: "الدور",
      roles: "الأدوار",
      privilege: "الصلاحية",
      privileges: "الصلاحيات",
      actions: "إجراءات",
      name: "الاسم",
      email: "البريد",
      departmentTitle: "القسم/المسمى",
      total: "إجمالي",
      doctors: "الأطباء",
      therapists: "المعالجون",
      add: "إضافة",
      edit: "تعديل",
      delete: "حذف",
      cancel: "إلغاء",
      save: "حفظ",
      active: "نشط",
      status: "الحالة",
      missing: "مفقود",
      needsReview: "بحاجة لمراجعة",
      export: "تصدير",
      import: "استيراد",
      readOnly: "صلاحية القراءة فقط",
      moreCount: "+{{count}} المزيد",
      all: "الكل",
      pageSize: "حجم الصفحة",
      filtered: "المجموعة المفلترة",
      fullDataset: "كامل البيانات",
      format: "تنسيق",
    },
    pages: {
      employees: {
        title: "إدارة الموظفين",
        desc: "إضافة الموظفين وتعيين الأدوار والصلاحيات (مثل الأطباء والمعالجين)",
        addEmployee: "إضافة موظف",
        cards: { total: "إجمالي", doctors: "الأطباء", therapists: "المعالجون" },
        table: {
          title: "الموظفون",
          desc: "انقر تعديل لتحديث الأدوار والصلاحيات",
        },
        filters: { searchPlaceholder: "اسم، بريد، قسم..." },
        confirmDeleteTitle: "حذف الموظف؟",
        confirmDeleteMsg: "سيتم حذف هذا المستخدم من النظام.",
        deleted: "تم الحذف",
      },
      accessControl: {
        title: "التحكم بالصلاحيات",
        subtitle: "إدارة المستخدمين والأدوار وا��ص��احيات؛ وتعيينها بأمان.",
        tabs: { users: "المستخدمون", roles: "الأدوار", privs: "الصلاحيات" },
        users: {
          title: "المستخدمون",
          desc: "إنشاء الحسابات وتعيين الأدوار/الصلاحيات.",
          headers: {
            name: "الاسم",
            email: "البريد الإلكتروني",
            roles: "الأدوار",
            effectivePrivs: "الصلاحيات الفعلية",
            actions: "إجراءات",
          },
          new: "مستخدم جديد",
          edit: "تعديل مستخدم",
          delete: "حذف",
          deleted: "تم الحذف",
          form: {
            name: "الاسم",
            email: "البريد الإلكتروني",
            roles: "الأدوار",
            directPrivs: "الصلاحيات المباشرة",
          },
        },
        roles: {
          title: "الأدوار",
          desc: "حزم تسهّل إسناد الصلاحيات.",
          headers: {
            name: "الاسم",
            privs: "الصلاحيات",
            users: "المستخدمون",
            actions: "إجراءات",
          },
          new: "دور جديد",
          edit: "تعديل دور",
          delete: "حذف",
          form: { name: "الاسم", description: "الوصف", privs: "الصلاحيات" },
        },
        privileges: {
          title: "الصلاحيات",
          desc: "صلاحيات أساسية تُسند إلى الأدوار أو مباشرة للمستخدمين.",
          headers: {
            name: "الاسم",
            category: "الفئة",
            usedInRoles: "مستخدمة في الأدوار",
            usedInUsers: "مستخدمة في المستخدمين",
            actions: "إجراءات",
          },
          new: "صلاحية جديدة",
          edit: "تعديل صلاحية",
          delete: "حذف",
          form: {
            name: "الاسم",
            description: "الوصف",
            category: "الفئة",
            placeholder: "مثل: السجلات، الإدارة، التقارير",
          },
        },
      },
      medical: {
        title: "إعدادات العلاج والرعاية",
        subtitle:
          "تهيئة أنواع الجلسات، القوالب، الأدوية، الجدولة، التقدم والبروتوكولات.",
        saved: "تم الحفظ",
        tabs: {
          therapy: "أنواع الجلسات",
          plans: "خطط العلاج",
          medication: "الأدوية",
          scheduling: "الجدولة",
          progress: "متابعة التقدم",
          emergency: "الطوارئ والملاحظات",
        },
        common: { description: "الوصف", addNew: "إضافة جديد" },
        therapy: {
          title: "أنواع جلسات العلاج",
          desc: "إدارة الفئات، المدد والتكرار الافتراضي.",
          duration: "المدة",
          frequency: "التكرار الافتراضي",
          min: "د",
          freq: { daily: "يومي", weekly: "أسبوعي", monthly: "شهري" },
        },
        plans: {
          title: "قوالب خطط العلاج",
          desc: "أهداف وتدخلات قياسية.",
          assigned: "مخصص لـ",
          doctor: "طبيب",
          therapist: "معالج",
          goals: "الأهداف:",
          interventions: "التدخلات:",
          addGoal: "إضافة هدف",
          addIntervention: "إضافة تدخل",
        },
        medication: {
          title: "إعدادات الأدوية",
          desc: "الفئات، وحدات ا��جرعات، والجداول القياسية.",
          categories: "الفئات",
          units: "وحدات الجرعة",
          schedules: "الجداول",
        },
        scheduling: {
          title: "جدولة المواعيد",
          desc: "ساعات العمل وقواعد الحجز.",
          sessionLength: "مدة الجلسة (د)",
          maxPerDay: "الحد الأقصى/اليوم",
          bufferMin: "فاصل (د)",
          allowRecurring: "تمكين المواعيد المتكررة",
          workingHours: "ساعات العمل (حسب اليوم)",
          day: "اليوم",
          start: "البداية",
          end: "النهاية",
        },
        progress: {
          title: "متابعة التقدم",
          desc: "معايير التقييم وتكرار التقارير.",
          reportFreq: "تكرار التقارير",
        },
        emergency: {
          title: "الطوارئ والملاحظات الخاصة",
          desc: "تهيئة بروتوكولات الطوارئ وربطها.",
          steps: "خطوات البروتوكول",
          addStep: "إضافة خطوة",
        },
      },
      translations: {
        title: "إدارة الترجمات",
        desc: "تحكم في الترجمات بناءً على المفاتيح الإنجليزية وفحص جميع الترجمات",
        totalKeys: "إجمالي المفاتيح",
        missing: "مفقود",
        needsReview: "بحاجة لمراجعة",
        tableTitle: "الترجمات",
        tableDesc: "ابحث وحرّر العربية",
        onlyMissing: "إظهار الناقصة فقط",
        placeholder: "بحث بالمفتاح أو النص",
        export: "تصدير",
        import: "استيراد",
        fileInvalid: "ملف غير صالح",
        importedN: "تم استيراد {{count}}",
        saved: "تم الحفظ",
      },
      beneficiaries: {
        title: "إدارة المستفيدين",
        desc: "قائمة المستفيدين مع البحث والفلاتر والوصول السريع للملفات",
        stats: {
          total: "إجمالي",
          active: "نشطون",
          under: "تحت العلاج",
          graduated: "متخرجون",
        },
        filters: {
          search: "بحث",
          disability: "نوع الإعاقة",
          status: "الحالة",
          program: "البرنامج",
          therapist: "المعالج",
          sortBy: "ترتيب حسب",
          sortDir: "الاتجاه",
          minAge: "العمر الأدنى",
          maxAge: "ال��مر الأقصى",
          searchPlaceholder: "اسم، رقم هوية، ولي أمر...",
          asc: "تصاعدي",
          desc: "تنازلي",
          all: "الكل",
        },
        actions: {
          add: "إضافة مستفيد",
          notify: "إرسال إشعار",
          export: "تصدير",
          archive: "أرشفة",
          clear: "مسح",
          open: "فتح",
        },
        table: {
          beneficiary: "المستفيد",
          age: "العمر",
          disability: "الإعاقة",
          programs: "البرامج",
          therapist: "المعالج",
          status: "الحالة",
          profile: "الملف",
        },
        badges: {
          active: "نشط",
          underTreatment: "تحت العلاج",
          graduated: "متخرج",
          inactive: "غير نشط",
        },
        alerts: {
          title: "تنبيهات",
          desc: "جلسات فائتة، مراجعات قادمة، مستندات على وشك الانتهاء",
          missed: "جلسة فائتة",
          review: "مراجعة",
          expiring: "قرب الانتهاء",
          none: "لا توجد تنبيهات",
        },
      },
      admin: {
        title: "لوحة التحكم",
        subtitle: "نظرة فورية على المستفيدين والموظفين والخدمات والتنبيهات.",
        buttons: {
          accessControl: "ال��حكم بالصلاحيات",
          exportReport: "تصدير تقرير",
          notifications: "مركز التنبيهات",
        },
        tiles: {
          beneficiaries: { title: "المستفيدون", deltaToday: "+٢٤ اليوم" },
          appointments: { title: "مواعيد اليوم" },
          staffUtil: {
            title: "استغلال الموظفين",
            note: "الهدف ٧٥٪ · وقت إضافي ٦٪",
          },
          quality: {
            title: "مؤشر الجودة",
            desc: "استناداً إلى إكمال العلاج، معدل الحوادث، واستبيانات الرضا.",
          },
        },
        chart: {
          title: "المستفيدون حسب الفئة",
          desc: "توزيع الخدمات السكنية والنهارية والمنزلية.",
          labels: { residential: "سكنية", daycare: "نهارية", home: "منزلية" },
        },
        alerts: {
          title: "تنبيهات عاجلة",
          desc: "تنبيهات حرجة بالوقت الحقيقي.",
          items: {
            missedMedication: "دواء فائت (غرفة ٢٠٣)",
            transportDelay: "تأخير النقل (٥ مستفيدين)",
            therapyRescheduled: "إعادة جدولة علاج",
          },
          levels: { high: "عالي", medium: "متوسط", info: "معلومة" },
        },
        team: {
          title: "أداء الفريق",
          desc: "الحضور والملاحظات وتقرير الحوادث.",
          summary: "٩٢٪ تسجيل حضور في الوقت · ١٨ زيارة ميدانية",
        },
        reviews: {
          title: "مراجعات قادمة",
          desc: "تقييمات طبية ونفسية لهذا الأسبوع.",
          summary: "٥٤ تقييمات مجدولة",
        },
        notifSummary: {
          title: "ملخص الإشعارات",
          desc: "تنبيهات ورسائل تلقائية.",
          summary: "١٢ عاجلة · ٣٦ عادية · ١٢٨ معلومات",
        },
      },
    },
    home: {
      hero: {
        badge: "رعاية شاملة للأشخاص ذوي الإعاقة",
        title: "منصة دلما الذكية",
        desc: "نظا�� موحد قائم على السحابة يربط المستفيدين والموظفين والإداريين والعائلات — يقدم خدمات شفافة وفعالة ومستدامة.",
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
        desc: "بوابات المستفيد والموظف والإدارة والعائلة لتبسيط العمليات اليومية — التسجيل والسجلات والعلاجات والحضور والتواصل الآمن.",
        open: "فتح",
        beneficiary: {
          title: "بوابة المستفيد",
          bullets: [
            "التسجيل والملفات الشخصية",
            "رفع المستندات",
            "المواعيد والعلاجات",
            "تتبع الحالة",
          ],
        },
        employee: {
          title: "بوابة الموظف",
          bullets: [
            "المهام والملاحظات",
            "تسجيل الحضور/الانصراف والميدان",
            "الوصول إلى السجلات",
            "تقارير الحوادث",
          ],
        },
        admin: {
          title: "لوحة التحكم",
          bullets: [
            "تحليلات المؤشرات",
            "الأدوار والصلاحيات",
            "الميزانيات والمالية",
            "سجلات ��لتدقيق",
          ],
        },
        family: {
          title: "نظام العائلة",
          bullets: [
            "الحالة الصحية",
            "الحضور والتقدم",
            "التنبيهات والجداول",
            "رسائل مباشرة",
          ],
        },
      },
      monitor: {
        title: "المراقبة الفورية",
        desc: "مؤشرات مرئية للحالة الطبية والنفسية والوظيفية.",
        medical: "طبي",
        psychological: "نفسي",
        functional: "وظيفي",
        updated:
          "تحديثات مباشرة من تسجيلات الوص��ل وإكمال العلاج والتكامل مع الأجهزة.",
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
        desc: "أمان متقدم مع تشفير البيانات والمصادقة الثنائية وسجلات التدقيق وإمكانية الوصول الكاملة. جاهز للسحابة وقابل للتوسع مع تكاملات للأنظمة الوطنية والأجهزة الطبية.",
        features: {
          advanced: {
            title: "أمان متقدم",
            text: "تشفير أثناء السكون والنقل، مصادقة ثنائية، وصلاحيات حسب الأدوار.",
          },
          comms: {
            title: "اتصال موحد",
            text: "رسائل داخلية، مشاركة ملفات، وتحديثات للعائلة.",
          },
          schedule: {
            title: "الجدولة والتذكيرات",
            text: "العلاجات، الفحوصات الصحية، وتذكير��ت المواعيد.",
          },
          reports: {
            title: "التقارير والتصدير",
            text: "تتبع المؤشرات مع التصدير إلى Excel وPDF.",
          },
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
  ? {
      [K in keyof T]:
        | `${Extract<K, string>}`
        | (T[K] extends object
            ? `${Extract<K, string>}.${Paths<T[K]>}`
            : never);
    }[keyof T]
  : never;

type MessageKey = Paths<typeof messages.en>;

// Runtime translation overrides (persisted)
const OV_KEY = "i18n_overrides_v1";
let ovCache: Partial<Record<Locale, Record<string, string>>> | null = null;
const transSubs = new Set<() => void>();
function loadOv() {
  if (ovCache) return ovCache;
  try {
    const raw = localStorage.getItem(OV_KEY);
    ovCache = raw ? (JSON.parse(raw) as any) : {};
  } catch {
    ovCache = {};
  }
  return ovCache!;
}
function saveOv(v: Partial<Record<any, Record<string, string>>>) {
  ovCache = v as any;
  localStorage.setItem(OV_KEY, JSON.stringify(v));
  transSubs.forEach((cb) => cb());
}
export function subscribeTranslations(cb: () => void) {
  transSubs.add(cb);
  return () => transSubs.delete(cb);
}

// Discovered keys tracking (runtime usage and scans)
const DISC_KEY = "i18n_discovered_v1";
function loadDiscovered(): string[] {
  try {
    const raw = localStorage.getItem(DISC_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}
function saveDiscovered(arr: string[]) {
  localStorage.setItem(DISC_KEY, JSON.stringify(Array.from(new Set(arr))));
}
export function listDiscoveredKeys(): string[] {
  return loadDiscovered();
}
export function addDiscoveredKey(k: string) {
  if (!k) return;
  const cur = loadDiscovered();
  if (!cur.includes(k)) {
    cur.push(k);
    saveDiscovered(cur);
    transSubs.forEach((cb) => cb());
  }
}
export function clearDiscovered() {
  saveDiscovered([]);
}

// Override helpers for external tools
export function listOverrideLocales(): string[] {
  const ov = loadOv();
  return Object.keys(ov || {});
}
export function getOverridesForLocale(locale: string): Record<string, string> {
  const ov = loadOv() as any;
  return (ov && ov[locale]) || {};
}

function flatten(obj: any, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const k of Object.keys(obj)) {
    const val = (obj as any)[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof val === "string") out[key] = val;
    else if (val && typeof val === "object")
      Object.assign(out, flatten(val, key));
  }
  return out;
}

export function listI18nKeys(): string[] {
  const base = Object.keys(flatten(messages.en));
  const ov = loadOv();
  const ovKeys = new Set<string>();
  Object.values(ov || {}).forEach((m) => {
    if (m) Object.keys(m as any).forEach((k) => ovKeys.add(k));
  });
  const disc = listDiscoveredKeys();
  return Array.from(new Set<string>([...base, ...Array.from(ovKeys), ...disc])).sort();
}
export function getBaseMessage(
  locale: Locale,
  key: string,
): string | undefined {
  const parts = key.split(".");
  let obj: any = messages[locale as keyof typeof messages];
  for (const p of parts) {
    obj = obj?.[p];
    if (obj === undefined) return undefined;
  }
  return typeof obj === "string" ? obj : undefined;
}
export function getOverride(locale: Locale, key: string): string | undefined {
  const o = loadOv()[locale];
  return o ? o[key] : undefined;
}
export function setOverride(locale: any, key: string, value: string) {
  const cur = loadOv() as any;
  const bucket = { ...((cur as any)[locale] || {}) };
  bucket[key] = value;
  const next = { ...(cur as any), [locale]: bucket };
  saveOv(next);
}
export function removeOverride(locale: any, key: string) {
  const cur = loadOv() as any;
  const bucket = { ...((cur as any)[locale] || {}) };
  delete bucket[key];
  const next = { ...(cur as any), [locale]: bucket };
  saveOv(next);
}
export function clearOverrides(locale?: Locale) {
  const cur = loadOv();
  if (!locale) saveOv({});
  else {
    const next = { ...cur } as any;
    delete next[locale];
    saveOv(next);
  }
}

export function t(key: MessageKey): string {
  try { addDiscoveredKey(String(key)); } catch {}
  const loc = getLocale();
  const ov = getOverride(loc, key);
  if (typeof ov === "string" && ov.length) return ov;
  const base = getBaseMessage(loc, key);
  if (typeof base === "string") return base;
  const en = getBaseMessage("en", key);
  return typeof en === "string" ? en : (key as string);
}
