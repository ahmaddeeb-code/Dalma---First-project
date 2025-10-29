 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/client/App.tsx b/client/App.tsx
index 3b522c8866b421969f15596d4783b0dab60b5743..11ee729641c601c910622f774ce635e5397f0b0e 100644
--- a/client/App.tsx
+++ b/client/App.tsx
@@ -5,50 +5,51 @@ import { Toaster } from "@/components/ui/toaster";
 import { Toaster as Sonner } from "@/components/ui/sonner";
 import { TooltipProvider } from "@/components/ui/tooltip";
 import { LoadingProvider } from "@/components/ui/loading";
 import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import AppLayout from "@/components/layout/AppLayout";
 import PageSkeleton from "@/components/skeletons/PageSkeleton";
 import Index from "./pages/Index";
 import NotFound from "./pages/NotFound";
 const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
 const AccessControl = lazy(() => import("./pages/AccessControl"));
 const Placeholder = lazy(() => import("./pages/_Placeholder"));
 const Beneficiaries = lazy(() => import("@/pages/Beneficiaries"));
 const BeneficiaryProfile = lazy(() => import("@/pages/beneficiaries/Profile"));
 const Employees = lazy(() => import("@/pages/Employees"));
 const Translations = lazy(() => import("@/pages/Translations"));
 const MedicalSettings = lazy(() => import("@/pages/MedicalSettings"));
 const BeneficiarySettings = lazy(() => import("@/pages/BeneficiarySettings"));
 const OrganizationSettings = lazy(() => import("@/pages/OrganizationSettings"));
 const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"));
 const FamilyProfiles = lazy(() => import("@/pages/FamilyProfiles"));
 const DepartmentsPage = lazy(() => import("@/pages/admin/Departments"));
 const RoomBuildingManagement = lazy(
   () => import("@/pages/RoomBuildingManagement"),
 );
+const AhmadPage = lazy(() => import("@/pages/Ahmad"));
 import LoginAdmin from "./pages/auth/LoginAdmin";
 import LoginStaff from "./pages/auth/LoginStaff";
 import LoginFamily from "./pages/auth/LoginFamily";
 import LoginBeneficiary from "./pages/auth/LoginBeneficiary";
 import Login from "./pages/Login";
 import ResetPassword from "./pages/ResetPassword";
 import FirstLogin from "./pages/auth/FirstLogin";
 const Logout = lazy(() => import("./pages/Logout"));
 import RequireAuth from "@/components/auth/RequireAuth";
 const AdminUsers = lazy(() => import("./pages/admin/Users"));
 
 const queryClient = new QueryClient({
   defaultOptions: {
     queries: {
       staleTime: 60_000,
       gcTime: 5 * 60_000,
       refetchOnWindowFocus: false,
       refetchOnReconnect: false,
       refetchOnMount: false,
       retry: 1,
     },
     mutations: {
       retry: 0,
     },
   },
@@ -99,50 +100,51 @@ const App = () => (
                   />
                   <Route
                     path="/admin/organization-settings"
                     element={<OrganizationSettings />}
                   />
                   <Route
                     path="/admin/security-settings"
                     element={<SecuritySettings />}
                   />
                   <Route path="/admin/families" element={<FamilyProfiles />} />
                   <Route
                     path="/admin/departments"
                     element={<DepartmentsPage />}
                   />
                   <Route path="/admin/users" element={<AdminUsers />} />
                   <Route
                     path="/admin/room-buildings"
                     element={<RoomBuildingManagement />}
                   />
                   <Route path="/beneficiaries" element={<Beneficiaries />} />
                   <Route
                     path="/beneficiaries/:id"
                     element={<BeneficiaryProfile />}
                   />
                   <Route path="/employees" element={<Employees />} />
+                  <Route path="/ahmad" element={<AhmadPage />} />
                   <Route
                     path="/family"
                     element={
                       <Placeholder
                         title="Family System"
                         description="Track health status, attendance, and communicate with specialists."
                       />
                     }
                   />
                   <Route
                     path="/reports"
                     element={
                       <Placeholder
                         title="Evaluation & Reports"
                         description="Generate KPIs, compare performance, and export to Excel/PDF."
                       />
                     }
                   />
                   <Route
                     path="/donations"
                     element={
                       <Placeholder
                         title="Payments & Donations"
                         description="Secure donations, receipts, and financial transparency."
                       />
diff --git a/client/components/layout/AppLayout.tsx b/client/components/layout/AppLayout.tsx
index 48eb944e306331d040129b96c3837ca16c9c8c8d..494052ff184ca5889a642cda42c78c924c7a12a9 100644
--- a/client/components/layout/AppLayout.tsx
+++ b/client/components/layout/AppLayout.tsx
@@ -50,50 +50,51 @@ import { loadACL } from "@/store/acl";
 import ChangePasswordDialog from "@/components/auth/ChangePasswordDialog";
 import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarGroupLabel,
   SidebarHeader,
   SidebarInset,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
   SidebarProvider,
   SidebarSeparator,
   SidebarTrigger,
 } from "@/components/ui/sidebar";
 import { getLocale, setLocale, subscribeLocale, t } from "@/i18n";
 
 const groups = [
   {
     labelKey: "nav.home",
     items: [
       { to: "/admin", key: "nav.admin", icon: LayoutDashboard },
       { to: "/reports", key: "nav.reports", icon: FileBarChart2 },
+      { to: "/ahmad", key: "nav.ahmad", icon: Sparkles },
     ],
   },
   {
     labelKey: "nav.management",
     items: [
       { to: "/beneficiaries", key: "nav.beneficiaries", icon: Users2 },
       { to: "/employees", key: "nav.employees", icon: Users },
       { to: "/admin/families", key: "nav.families", icon: UserCircle2 },
       { to: "/admin/departments", key: "nav.departments", icon: Building2 },
       {
         to: "/admin/room-buildings",
         key: "nav.roomsBuildings",
         icon: Building2,
       },
       { to: "/donations", key: "nav.donations", icon: HandHeart },
     ],
   },
   {
     labelKey: "nav.settings",
     items: [
       {
         to: "/admin/access-control",
         key: "nav.accessControl",
         icon: ShieldCheck,
       },
diff --git a/client/i18n.ts b/client/i18n.ts
index b909ab94ae789d70de23a1a0ddd3006107c0ccc6..9f35e487123cbaa49222f76ad9444d151f05b90f 100644
--- a/client/i18n.ts
+++ b/client/i18n.ts
@@ -14,50 +14,51 @@ export function getLocale(): Locale {
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
+      ahmad: "Ahmad",
       reports: "Reports",
       donations: "Donations",
       accessControl: "Access Control",
       medicalSettings: "Medical Settings",
       beneficiarySettings: "Beneficiary Settings",
       logistics: "Logistics",
       roomsBuildings: "Rooms & Buildings",
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
@@ -480,50 +481,51 @@ const messages = {
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
     brand: "من��ة دلما الذكية",
     nav: {
       home: "الرئيسية",
       admin: "لوحة التحكم",
       beneficiaries: "المستفيدون",
       employees: "الموظفون",
       family: "العائلة",
+      ahmad: "أحمد",
       reports: "التقارير",
       donations: "التبرعات",
       accessControl: "التحكم بالصلاحيات",
       medicalSettings: "إعدادات طبية",
       beneficiarySettings: "إعدادات المستفيد",
       logistics: "الخدمات اللوجستية",
       roomsBuildings: "الغرف والمباني",
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
diff --git a/client/pages/Ahmad.tsx b/client/pages/Ahmad.tsx
new file mode 100644
index 0000000000000000000000000000000000000000..330b7acae1954521ee2c8e5308c4cec24fe1e398
--- /dev/null
+++ b/client/pages/Ahmad.tsx
@@ -0,0 +1,64 @@
+import { Link } from "react-router-dom";
+import { Button } from "@/components/ui/button";
+import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
+import { Sparkles, ArrowRight, BookOpenCheck, HeartHandshake } from "lucide-react";
+
+export default function Ahmad() {
+  return (
+    <div className="mx-auto flex max-w-5xl flex-col gap-10 animate-fade-up">
+      <header className="rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-10 shadow-lg">
+        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
+          <Sparkles className="h-4 w-4" />
+          <span>Celebrating Ahmad</span>
+        </div>
+        <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
+          Ahmad&apos;s Impact Hub
+        </h1>
+        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
+          Explore initiatives, milestones, and community moments dedicated to Ahmad.
+        </p>
+        <div className="mt-6 flex flex-wrap items-center gap-3">
+          <Button asChild size="lg" className="rounded-xl">
+            <Link to="/admin" className="flex items-center gap-2">
+              Go to Admin
+              <ArrowRight className="h-4 w-4" />
+            </Link>
+          </Button>
+          <Button asChild variant="secondary" size="lg" className="rounded-xl">
+            <Link to="/">
+              Back to Home
+            </Link>
+          </Button>
+        </div>
+      </header>
+
+      <section className="grid gap-6 md:grid-cols-2">
+        <Card className="border border-border/60">
+          <CardHeader>
+            <CardTitle className="flex items-center gap-3 text-xl">
+              <BookOpenCheck className="h-6 w-6 text-primary" />
+              Learning Journey
+            </CardTitle>
+          </CardHeader>
+          <CardContent className="space-y-3 text-muted-foreground">
+            <p>Track workshops, sessions, and achievements inspired by Ahmad&apos;s vision.</p>
+            <p>Share resources and insights that help others follow the same path.</p>
+          </CardContent>
+        </Card>
+
+        <Card className="border border-border/60">
+          <CardHeader>
+            <CardTitle className="flex items-center gap-3 text-xl">
+              <HeartHandshake className="h-6 w-6 text-secondary" />
+              Community Highlights
+            </CardTitle>
+          </CardHeader>
+          <CardContent className="space-y-3 text-muted-foreground">
+            <p>Celebrate stories of collaboration and support made possible through Ahmad.</p>
+            <p>Highlight events, volunteers, and partners who keep the spirit alive.</p>
+          </CardContent>
+        </Card>
+      </section>
+    </div>
+  );
+}
 
EOF
)
