import "./global.css";
import { Suspense, lazy } from "react";

import { Toaster } from "@/components/ui/toaster";
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
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LoadingProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* Public auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/login/admin" element={<LoginAdmin />} />
                <Route path="/login/staff" element={<LoginStaff />} />
                <Route path="/login/family" element={<LoginFamily />} />
                <Route
                  path="/login/beneficiary"
                  element={<LoginBeneficiary />}
                />
                <Route path="/first-login" element={<FirstLogin />} />

                {/* Protected routes */}
                <Route element={<RequireAuth />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route
                    path="/admin/access-control"
                    element={<AccessControl />}
                  />
                  <Route
                    path="/admin/translations"
                    element={<Translations />}
                  />
                  <Route
                    path="/admin/medical-settings"
                    element={<MedicalSettings />}
                  />
                  <Route
                    path="/admin/beneficiary-settings"
                    element={<BeneficiarySettings />}
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
                  <Route path="/beneficiaries" element={<Beneficiaries />} />
                  <Route
                    path="/beneficiaries/:id"
                    element={<BeneficiaryProfile />}
                  />
                  <Route path="/employees" element={<Employees />} />
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
                    }
                  />
                  <Route
                    path="/privacy"
                    element={
                      <Placeholder
                        title="Privacy"
                        description="Our commitment to protecting personal and health information."
                      />
                    }
                  />
                  <Route
                    path="/security"
                    element={
                      <Placeholder
                        title="Security"
                        description="Encryption, access controls, and audit logging details."
                      />
                    }
                  />
                  <Route
                    path="/contact"
                    element={
                      <Placeholder
                        title="Contact"
                        description="Reach our technical support and administration team."
                      />
                    }
                  />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </LoadingProvider>
  </QueryClientProvider>
);

export default App;
