import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  loadACL,
  saveACL,
  type Role,
  type User,
  uid,
  upsert,
} from "@/store/acl";
import { login } from "@/store/auth";

export default function RoleLogin({
  roleId,
  title,
  redirectPath,
}: {
  roleId: string;
  title: string;
  redirectPath: string;
}) {
  const [acl, setAcl] = useState(() => loadACL());
  const role = useMemo(
    () => acl.roles.find((r) => r.id === roleId) as Role | undefined,
    [acl.roles, roleId],
  );
  const users = useMemo(
    () => acl.users.filter((u) => u.roleIds.includes(roleId)),
    [acl.users, roleId],
  );

  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(
    users[0]?.id,
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [enable2fa, setEnable2fa] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaUserId, setMfaUserId] = useState<string | null>(null);

  const signInSelected = () => {
    const user = acl.users.find((u) => u.id === selectedUserId);
    if (!user) return;
    const { authenticate } = require("@/store/auth");
    const res = authenticate(user.email || user.name, password, true);
    if (!res.ok) {
      alert(res.error || "Invalid credentials");
      return;
    }
    if ((res as any).mfa) {
      setMfaPending(true);
      setMfaUserId((res as any).userId);
      // show demo code in alert for development
      if ((res as any).demoCode) alert(`OTP: ${(res as any).demoCode}`);
      return;
    }
    login(user);
    window.location.assign(redirectPath);
  };

  const submitMfa = () => {
    if (!mfaUserId) return;
    const { verifyOTP } = require("@/store/auth");
    const v = verifyOTP(mfaUserId, mfaCode);
    if (!v.ok) { alert(v.error); return; }
    const u = acl.users.find((x) => x.id === mfaUserId);
    if (u) { login(u); window.location.assign(redirectPath); }
  };

  const createAndSignIn = () => {
    const u: User = {
      id: uid("u"),
      name: name.trim(),
      email: email.trim(),
      roleIds: [roleId],
      privilegeIds: [],
      active: true,
      failedAttempts: 0,
      lockedUntil: null,
      twoFactor: enable2fa,
    };
    const updated = { ...acl, users: upsert(acl.users, u) };
    saveACL(updated);
    setAcl(updated);
    if (createPassword) {
      const { setUserPassword } = require("@/store/auth");
      setUserPassword(u.id, createPassword);
    }
    login(u);
    window.location.assign(redirectPath);
  };

  if (!role)
    return (
      <div className="mx-auto max-w-lg text-center">
        <p className="text-muted-foreground">Role not found.</p>
      </div>
    );

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Sign in as an existing {role.name} or create a new account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select existing user</Label>
            <Select
              value={selectedUserId}
              onValueChange={(v) => setSelectedUserId(v)}
            >
              <SelectTrigger>
                <SelectValue placeholder={`Choose a ${role.name}`} />
              </SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} — {u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            </div>
            <div className="mt-2">
              <Button
                className="w-full"
                disabled={!selectedUserId || !password}
                onClick={signInSelected}
              >
                Sign in
              </Button>
            </div>

            {mfaPending && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Enter OTP</p>
                <div className="flex gap-2">
                  <Input value={mfaCode} onChange={(e)=>setMfaCode(e.target.value)} placeholder="123456" />
                  <Button onClick={submitMfa}>Verify</Button>
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">
              Or create a new {role.name}
            </p>
            <div className="grid gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="createPassword">Password</Label>
                <Input id="createPassword" type="password" value={createPassword} onChange={(e)=>setCreatePassword(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={enable2fa} onCheckedChange={(v)=>setEnable2fa(!!v)} />
                <span className="text-sm">Enable 2FA (OTP)</span>
              </div>
              <Button
                className="w-full"
                onClick={createAndSignIn}
                disabled={!name.trim() || !email.trim()}
              >
                Create account & sign in
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
