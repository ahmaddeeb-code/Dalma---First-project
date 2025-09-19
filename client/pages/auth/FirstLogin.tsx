import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserById, updateUser } from "@/store/acl";
import { setUserPassword, login } from "@/store/auth";
import { t } from "@/i18n";

export default function FirstLogin() {
  const nav = useNavigate();
  const loc = useLocation();
  const userId = (loc.state as any)?.userId as string | undefined;
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function submit() {
    setErr(null);
    if (pw1.length < 6) { setErr("Password too short"); return; }
    if (pw1 !== pw2) { setErr("Passwords do not match"); return; }
    if (!userId) { setErr("Missing user"); return; }
    setUserPassword(userId, pw1);
    updateUser(userId, { mustChangePassword: false, defaultPassword: undefined });
    const u = getUserById(userId);
    if (u) login(u, true);
    nav("/", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>{t("login.changePassword") || "Change your password"}</CardTitle>
          <CardDescription>{t("login.firstLoginPrompt") || "For security, please set a new password."}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <label className="text-sm">{t("login.newPassword") || "New password"}</label>
              <Input type="password" value={pw1} onChange={(e) => setPw1(e.target.value)} />
            </div>
            <div>
              <label className="text-sm">{t("login.confirmPassword") || "Confirm password"}</label>
              <Input type="password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <div className="pt-2">
              <Button className="w-full" onClick={submit}>{t("common.save") || "Save"}</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
