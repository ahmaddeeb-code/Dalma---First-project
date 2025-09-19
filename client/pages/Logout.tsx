import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ShieldCheck } from "lucide-react";
import { t } from "@/i18n";
import { logout } from "@/store/auth";
import { useQueryClient } from "@tanstack/react-query";

export default function Logout() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [phase, setPhase] = useState<"clearing" | "done">("clearing");

  useEffect(() => {
    // Clear session and caches in a microtask to allow paint of UI
    const id = requestAnimationFrame(() => {
      try {
        // Clear auth/session
        logout();
        // Remove transient auth artifacts
        try { localStorage.removeItem("auth_otp_v1"); } catch {}
        // Clear in-memory cached data
        qc.clear();
        // Clear sessionStorage entirely (non-persistent sensitive data)
        try { sessionStorage.clear(); } catch {}
      } finally {
        setPhase("done");
        // Redirect to login shortly after
        setTimeout(() => navigate("/login", { replace: true }), 900);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [navigate, qc]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <div className="container max-w-lg mx-auto">
        <Card className="backdrop-blur-xl bg-white/90 shadow-2xl border-0 rounded-3xl overflow-hidden">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary grid place-items-center text-white shadow-lg">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <CardTitle className="mt-4 text-2xl font-bold">
              {t("brand")} – {phase === "clearing" ? (t("header.signOut") || "Signing out") : ("Done")}
            </CardTitle>
            <CardDescription>
              {phase === "clearing" ? ("Clearing your session…") : ("You have successfully logged out.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span>{phase === "clearing" ? ("Loading content…") : ("Redirecting to sign in…")}</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </span>
            </div>
            <div className="mt-6 flex justify-center">
              <Button variant="secondary" onClick={() => navigate("/login", { replace: true })}>
                {t("header.signIn") || "Sign in"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
