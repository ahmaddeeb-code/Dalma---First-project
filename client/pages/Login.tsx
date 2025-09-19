import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { authenticate, forgotPassword, verifyOTP, login as doLogin } from "@/store/auth";
import { t } from "@/i18n";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const loc = useLocation();
  const from = (loc.state as any)?.from || "/admin";

  const [mfaPending, setMfaPending] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    const res = await authenticate(identifier, password, remember);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Invalid credentials");
      return;
    }
    if ((res as any).mfa) {
      // prompt for code
      setMfaPending(true);
      setMfaUserId((res as any).userId || null);
      // show demo code in toast
      if ((res as any).demoCode) toast.success(`OTP: ${(res as any).demoCode}`);
      return;
    }
    toast.success(t("login.success") || "Welcome");
    navigate(from, { replace: true });
  };

  const submitMfa = async () => {
    if (!mfaUserId) return;
    const v = verifyOTP(mfaUserId, mfaCode);
    if (!v.ok) {
      toast.error(v.error || "Invalid code");
      return;
    }
    // finalize login
    const u = require("@/store/acl").getUserById(mfaUserId);
    const { login: doLogin } = require("@/store/auth");
    doLogin(u, remember);
    toast.success(t("login.success") || "Welcome");
    navigate(from, { replace: true });
  };

  const onForgot = async () => {
    if (!identifier) {
      toast.error(t("login.enterEmail") || "Enter email to reset");
      return;
    }
    const r = forgotPassword(identifier);
    if (r.ok) {
      // show token for demo
      toast.success((t("login.resetSent") || "Reset sent") + `: ${r.token}`);
    } else {
      toast.error(t("login.resetFailed") || "Reset failed");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
            </div>
            <div>
              <CardTitle className="text-lg">{t("login.title") || "Sign in"}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">{t("login.welcome") || "Enter your credentials to continue"}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {!mfaPending ? (
            <>
            <div>
              <label className="text-sm">{t("login.email") || "Email or Username"}</label>
              <Input value={identifier} onChange={(e)=>setIdentifier(e.target.value)} placeholder={t("login.emailPlaceholder") || "you@example.com"} />
            </div>
            <div>
              <label className="text-sm">{t("login.password") || "Password"}</label>
              <Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder={t("login.passwordPlaceholder") || "••••••••"} />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <Checkbox checked={remember} onCheckedChange={(v)=>setRemember(!!v)} />
                <span className="text-sm">{t("login.remember") || "Remember me"}</span>
              </label>
              <button type="button" className="text-sm text-primary underline" onClick={onForgot}>{t("login.forgot") || "Forgot?"}</button>
            </div>
            <div>
              <Button type="submit" className="w-full" loading={loading}>{t("login.login") || "Sign in"}</Button>
            </div>
            </>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Enter the OTP sent to your registered contact.</div>
                <Input value={mfaCode} onChange={(e)=>setMfaCode(e.target.value)} placeholder="123456" />
                <div className="flex gap-2">
                  <Button onClick={submitMfa} className="flex-1">Verify</Button>
                  <Button variant="ghost" onClick={()=>{ setMfaPending(false); setMfaUserId(null); }}>{t("cancel")||"Cancel"}</Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
