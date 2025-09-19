import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type UserRow = {
  id: string;
  name: string;
  email: string;
  failedAttempts: number;
  lockedUntil: string | null;
  twoFactor: boolean;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/admin/users");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle2fa(id: string, val: boolean) {
    try {
      const r = await fetch(`/api/auth/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactor: val }),
      });
      const d = await r.json();
      if (d.ok) {
        toast.success("Updated");
        load();
      } else toast.error("Failed");
    } catch {
      toast.error("Failed");
    }
  }

  async function resetLock(id: string) {
    try {
      const r = await fetch(`/api/auth/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetLock: true }),
      });
      const d = await r.json();
      if (d.ok) {
        toast.success("Unlocked");
        load();
      } else toast.error("Failed");
    } catch {
      toast.error("Failed");
    }
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Users & Security</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-4 p-3 rounded-md border"
                >
                  <div>
                    <div className="font-medium">
                      {u.name}{" "}
                      <span className="text-xs text-muted-foreground">
                        {u.email}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Failed attempts: {u.failedAttempts}{" "}
                      {u.lockedUntil
                        ? `· Locked until ${new Date(u.lockedUntil).toLocaleString()}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">2FA</span>
                      <Switch
                        checked={u.twoFactor}
                        onCheckedChange={(v) => toggle2fa(u.id, !!v)}
                      />
                    </div>
                    <Button variant="outline" onClick={() => resetLock(u.id)}>
                      Reset Lock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
