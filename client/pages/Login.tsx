import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useLoadingForm, useLoadingApi } from "@/components/ui/loading";
import {
  authenticate,
  forgotPassword,
  verifyOTP,
  login as doLogin,
} from "@/store/auth";
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
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
      const user = list.find((x: any) => x.id === mfaUserId);
      if (user) {
        doLogin(
          { id: user.id, name: user.name, email: user.email } as any,
          remember,
        );
        toast.success(t("login.success") || "Welcome");
        navigate(from, { replace: true });
      }
    } catch (e) {
      toast.error("Failed to finalize login");
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
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-cyan-400/20 to-blue-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div
          className={
            "container max-w-6xl mx-auto transition-all duration-700 ease-out transform " +
            (mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")
          }
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero Section */}
            <div className="hidden lg:flex flex-col items-center justify-center space-y-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-2xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/50">
                  <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
                    <svg
                      width="80"
                      height="80"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="M2 17l10 5 10-5"></path>
                      <path d="M2 12l10 5 10-5"></path>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                  {t("brand")}
                </h1>
                <p className="text-lg text-slate-600 max-w-md">
                  {t("login.welcome")}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Secure & Trusted Platform
                </div>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <Card className="backdrop-blur-xl bg-white/90 shadow-2xl border-0 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/20 pointer-events-none"></div>

                <CardHeader className="relative z-10 pb-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white shadow-lg transform hover:scale-110 transition-transform duration-300">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 12l2 2 4-4"></path>
                        <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                        <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                      </svg>
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-slate-800">
                        {t("login.title")}
                      </CardTitle>
                      <CardDescription className="text-slate-600 mt-1">
                        {t("login.welcome")}
                      </CardDescription>
                    </div>
                  </div>

                  {/* Mobile brand for small screens */}
                  <div className="lg:hidden text-center mb-6">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {t("brand")}
                    </h2>
                  </div>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <form
                    onSubmit={onSubmit}
                    className="space-y-6"
                    aria-describedby="login-errors"
                  >
                    {!mfaPending ? (
                      <>
                        {/* Email Field */}
                        <div className="space-y-2">
                          <label
                            htmlFor={idIdentifier}
                            className="text-sm font-medium text-slate-700 block"
                          >
                            {t("login.email")}
                          </label>
                          <div className="relative group">
                            <Input
                              id={idIdentifier}
                              value={identifier}
                              onChange={(e) => {
                                setIdentifier(e.target.value);
                                if (identifierError)
                                  setIdentifierError(
                                    validateIdentifier(e.target.value),
                                  );
                              }}
                              placeholder={
                                t("login.emailPlaceholder") || "you@example.com"
                              }
                              aria-invalid={!!identifierError}
                              aria-describedby={
                                identifierError ? "identifier-error" : undefined
                              }
                              className="h-12 pl-4 pr-4 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-slate-300 placeholder:text-slate-400"
                            />
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>
                          </div>
                          {identifierError && (
                            <div
                              id="identifier-error"
                              role="alert"
                              aria-live="assertive"
                              className="text-sm text-red-600 flex items-center gap-2 animate-in slide-in-from-left-2 duration-300"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                              </svg>
                              {identifierError}
                            </div>
                          )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                          <label
                            htmlFor={idPassword}
                            className="text-sm font-medium text-slate-700 block"
                          >
                            {t("login.password")}
                          </label>
                          <div className="relative group">
                            <Input
                              id={idPassword}
                              type={showPassword ? "text" : "password"}
                              value={password}
                              onChange={(e) => {
                                setPassword(e.target.value);
                                if (passwordError)
                                  setPasswordError(
                                    validatePassword(e.target.value),
                                  );
                              }}
                              placeholder={
                                t("login.passwordPlaceholder") || "••••••••"
                              }
                              aria-invalid={!!passwordError}
                              aria-describedby={
                                passwordError ? "password-error" : undefined
                              }
                              className="h-12 pl-4 pr-12 border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 hover:border-slate-300 placeholder:text-slate-400"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors duration-200 rounded-lg hover:bg-slate-100"
                            >
                              {showPassword ? (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                  <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                              ) : (
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              )}
                            </button>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-cyan-500/0 group-focus-within:from-blue-500/5 group-focus-within:via-purple-500/5 group-focus-within:to-cyan-500/5 transition-all duration-300 pointer-events-none"></div>
                          </div>
                          {passwordError && (
                            <div
                              id="password-error"
                              role="alert"
                              aria-live="assertive"
                              className="text-sm text-red-600 flex items-center gap-2 animate-in slide-in-from-left-2 duration-300"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                              </svg>
                              {passwordError}
                            </div>
                          )}
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                              checked={remember}
                              onCheckedChange={(v) => setRemember(!!v)}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                              {t("login.remember")}
                            </span>
                          </label>
                          <button
                            type="button"
                            className="text-sm text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 font-medium"
                            onClick={onForgot}
                          >
                            {t("login.forgot")}
                          </button>
                        </div>

                        {/* Sign In Button */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            className="w-full h-12 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 border-0"
                            disabled={loading}
                            aria-live="polite"
                          >
                            {loading ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Signing in...
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                  <polyline points="10,17 15,12 10,7"></polyline>
                                  <line x1="15" y1="12" x2="3" y2="12"></line>
                                </svg>
                                {t("login.login")}
                              </div>
                            )}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-6 animate-in fade-in duration-500">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="2"
                            >
                              <path d="M9 12l2 2 4-4"></path>
                              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"></path>
                              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"></path>
                            </svg>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-800 mb-2">
                            Verify Your Identity
                          </h3>
                          <p className="text-sm text-slate-600">
                            Enter the OTP sent to your registered contact.
                          </p>
                        </div>

                        <Input
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value)}
                          placeholder="Enter 6-digit code"
                          className="h-12 text-center text-lg font-mono tracking-widest border-2 border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                          maxLength={6}
                        />

                        <div className="flex gap-3">
                          <Button
                            onClick={submitMfa}
                            className="flex-1 h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl"
                          >
                            Verify & Continue
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setMfaPending(false);
                              setMfaUserId(null);
                            }}
                            className="h-12 border-2 hover:bg-slate-50 rounded-xl"
                          >
                            {t("cancel")}
                          </Button>
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
      </div>
    </div>
  );
}
