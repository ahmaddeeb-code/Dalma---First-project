import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import AccessControl from "./pages/AccessControl";
import Placeholder from "./pages/_Placeholder";
import Beneficiaries from "@/pages/Beneficiaries";
import BeneficiaryProfile from "@/pages/beneficiaries/Profile";
import Employees from "@/pages/Employees";
import Translations from "@/pages/Translations";
import MedicalSettings from "@/pages/MedicalSettings";
import BeneficiarySettings from "@/pages/BeneficiarySettings";
import OrganizationSettings from "@/pages/OrganizationSettings";
import Logistics from "@/pages/Logistics";
import LoginAdmin from "./pages/auth/LoginAdmin";
import LoginStaff from "./pages/auth/LoginStaff";
import LoginFamily from "./pages/auth/LoginFamily";
import LoginBeneficiary from "./pages/auth/LoginBeneficiary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/access-control" element={<AccessControl />} />
            <Route path="/admin/translations" element={<Translations />} />
            <Route
              path="/admin/medical-settings"
              element={<MedicalSettings />}
            />
            <Route path="/admin/beneficiary-settings" element={<BeneficiarySettings />} />
            <Route path="/admin/organization-settings" element={<OrganizationSettings />} />
            <Route path="/admin/logistics" element={<Logistics />} />
            <Route path="/login/admin" element={<LoginAdmin />} />
            <Route path="/login/staff" element={<LoginStaff />} />
            <Route path="/login/family" element={<LoginFamily />} />
            <Route path="/login/beneficiary" element={<LoginBeneficiary />} />
            <Route path="/beneficiaries" element={<Beneficiaries />} />
            <Route path="/beneficiaries/:id" element={<BeneficiaryProfile />} />
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
