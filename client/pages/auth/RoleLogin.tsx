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

  const signInSelected = () => {
    const user = acl.users.find((u) => u.id === selectedUserId);
    if (!user) return;
    login(user);
    window.location.assign(redirectPath);
  };

  const createAndSignIn = () => {
    const u: User = {
      id: uid("u"),
      name: name.trim(),
      email: email.trim(),
      roleIds: [roleId],
      privilegeIds: [],
    };
    const updated = { ...acl, users: upsert(acl.users, u) };
    saveACL(updated);
    setAcl(updated);
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
            <Button
              className="w-full"
              disabled={!selectedUserId}
              onClick={signInSelected}
            >
              Sign in
            </Button>
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
