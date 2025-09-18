import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Placeholder from "./pages/_Placeholder";

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
            <Route path="/beneficiaries" element={<Placeholder title="Beneficiary Portal" description="Register, manage profiles, appointments, therapy plans, and status tracking." />} />
            <Route path="/employees" element={<Placeholder title="Employee Portal" description="Tasks, progress notes, attendance, and incident reporting." />} />
            <Route path="/family" element={<Placeholder title="Family System" description="Track health status, attendance, and communicate with specialists." />} />
            <Route path="/reports" element={<Placeholder title="Evaluation & Reports" description="Generate KPIs, compare performance, and export to Excel/PDF." />} />
            <Route path="/donations" element={<Placeholder title="Payments & Donations" description="Secure donations, receipts, and financial transparency." />} />
            <Route path="/privacy" element={<Placeholder title="Privacy" description="Our commitment to protecting personal and health information." />} />
            <Route path="/security" element={<Placeholder title="Security" description="Encryption, access controls, and audit logging details." />} />
            <Route path="/contact" element={<Placeholder title="Contact" description="Reach our technical support and administration team." />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
