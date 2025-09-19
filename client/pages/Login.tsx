import React, { useEffect, useRef, useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);

  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const navigate = useNavigate();
  const loc = useLocation();
  const from = (loc.state as any)?.from || "/admin";

  const [mfaPending, setMfaPending] = useState(false);
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState("");

  const mounted = useRef(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => (mounted.current = true));
    return () => cancelAnimationFrame(id);
  }, []);

  function validateIdentifier(v: string) {
    if (!v.trim()) return "Required";
    if (v.includes("@")) {
      // simple email check
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      return ok ? null : "Invalid email format";
    }
    return null; // username allowed
  }

  function validatePassword(v: string) {
    if (!v) return "Required";
    if (v.length < 4) return "Too short";
    return null;
  }

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const idErr = validateIdentifier(identifier);
    const pwErr = validatePassword(password);
    setIdentifierError(idErr);
    setPasswordError(pwErr);
    if (idErr || pwErr) return;

    setLoading(true);
    const res = await authenticate(identifier, password, remember);
    setLoading(false);
    if (!res.ok) {
      toast.error(res.error || "Invalid credentials");
      return;
    }
    if ((res as any).mfa) {
      setMfaPending(true);
      setMfaUserId((res as any).userId || null);
      if ((res as any).demoCode) toast.success(`OTP: ${(res as any).demoCode}`);
      return;
    }
    toast.success(t("login.success") || "Welcome");
    navigate(from, { replace: true });
  };

  const submitMfa = async () => {
    if (!mfaUserId) return;
    const v = await verifyOTP(mfaUserId, mfaCode);
    if (!v.ok) {
      toast.error(v.error || "Invalid code");
      return;
    }
    try {
      const r = await fetch(`/api/auth/admin/users`);
      const list = await r.json();
      const user = list.find((x:any)=> x.id === mfaUserId);
      if (user) {
        doLogin({ id: user.id, name: user.name, email: user.email } as any, remember);
        toast.success(t("login.success") || "Welcome");
        navigate(from, { replace: true });
      }
    } catch (e) {
      toast.error('Failed to finalize login');
    }
  };

  const onForgot = async () => {
    if (!identifier) {
      toast.error(t("login.enterEmail") || "Enter email to reset");
      return;
    }
    const r = forgotPassword(identifier);
    if (r.ok) {
      toast.success((t("login.resetSent") || "Reset sent") + `: ${r.token}`);
    } else {
      toast.error(t("login.resetFailed") || "Reset failed");
    }
  };

  const idIdentifier = "login-identifier";
  const idPassword = "login-password";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex items-center justify-center p-6">
      <div className={"container max-w-5xl mx-auto transition-opacity duration-500 " + (mounted.current ? "opacity-100" : "opacity-0") }>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="hidden md:flex flex-col items-center justify-center space-y-6">
            <img src="/placeholder.svg" alt="Illustration" className="w-64 h-64 object-contain rounded-lg shadow-lg" />
            <div className="text-center">
              <h3 className="text-2xl font-semibold">{t("brand")}</h3>
              <p className="text-sm text-muted-foreground mt-2">{t("login.welcome")}</p>
            </div>
          </div>

          <Card className="w-full shadow-xl rounded-xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center text-white shadow-md">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
                </div>
                <div>
                  <CardTitle className="text-lg">{t("login.title")}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">{t("login.welcome")}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4" aria-describedby="login-errors">
                {!mfaPending ? (
                <>
                <div>
                  <label htmlFor={idIdentifier} className="text-sm block">{t("login.email")}</label>
                  <Input id={idIdentifier} value={identifier} onChange={(e)=>{ setIdentifier(e.target.value); if (identifierError) setIdentifierError(validateIdentifier(e.target.value)); }} placeholder={t("login.emailPlaceholder") || "you@example.com"} aria-invalid={!!identifierError} aria-describedby={identifierError ? "identifier-error" : undefined} />
                  {identifierError && <div id="identifier-error" role="alert" aria-live="assertive" className="text-xs text-destructive mt-1">{identifierError}</div>}
                </div>

                <div>
                  <label htmlFor={idPassword} className="text-sm block">{t("login.password")}</label>
                  <div className="relative">
                    <Input id={idPassword} type={showPassword ? "text" : "password"} value={password} onChange={(e)=>{ setPassword(e.target.value); if (passwordError) setPasswordError(validatePassword(e.target.value)); }} placeholder={t("login.passwordPlaceholder") || "••••••••"} aria-invalid={!!passwordError} aria-describedby={passwordError ? "password-error" : undefined} />
                    <button type="button" onClick={()=>setShowPassword(s=>!s)} aria-label={showPassword?"Hide password":"Show password"} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground">
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {passwordError && <div id="password-error" role="alert" aria-live="assertive" className="text-xs text-destructive mt-1">{passwordError}</div>}
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <Checkbox checked={remember} onCheckedChange={(v)=>setRemember(!!v)} />
                    <span className="text-sm">{t("login.remember")}</span>
                  </label>
                  <button type="button" className="text-sm text-primary underline" onClick={onForgot}>{t("login.forgot")}</button>
                </div>

                <div>
                  <Button type="submit" className="w-full" loading={loading} aria-live="polite">{t("login.login")}</Button>
                </div>
                </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground">Enter the OTP sent to your registered contact.</div>
                    <Input value={mfaCode} onChange={(e)=>setMfaCode(e.target.value)} placeholder="123456" />
                    <div className="flex gap-2">
                      <Button onClick={submitMfa} className="flex-1">Verify</Button>
                      <Button variant="ghost" onClick={()=>{ setMfaPending(false); setMfaUserId(null); }}>{t("cancel")}</Button>
                    </div>
                  </div>
                )}

                <div id="login-errors" aria-live="polite" />
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
