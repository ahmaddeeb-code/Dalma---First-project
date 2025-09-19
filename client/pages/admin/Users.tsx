import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import ListSkeleton from "@/components/skeletons/ListSkeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UserRow = {
  id: string;
  name: string;
  email: string;
  failedAttempts: number;
  lockedUntil: string | null;
  twoFactor: boolean;
};

async function fetchUsers(): Promise<UserRow[]> {
  const res = await fetch("/api/auth/admin/users");
  if (!res.ok) throw new Error("Failed to load users");
  return res.json();
}

export default function AdminUsers() {
  const qc = useQueryClient();

  const {
    data: users,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const toggle2fa = useMutation({
    mutationFn: async ({ id, val }: { id: string; val: boolean }) => {
      const r = await fetch(`/api/auth/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twoFactor: val }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error("Failed");
      return { id, val };
    },
    onSuccess: ({ id, val }) => {
      qc.setQueryData<UserRow[] | undefined>(["admin-users"], (prev) =>
        prev
          ? prev.map((u) => (u.id === id ? { ...u, twoFactor: val } : u))
          : prev,
      );
      toast.success("Updated");
    },
    onError: () => toast.error("Failed"),
  });

  const resetLock = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const r = await fetch(`/api/auth/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetLock: true }),
      });
      const d = await r.json();
      if (!r.ok || !d.ok) throw new Error("Failed");
      return { id };
    },
    onSuccess: ({ id }) => {
      qc.setQueryData<UserRow[] | undefined>(["admin-users"], (prev) =>
        prev
          ? prev.map((u) =>
              u.id === id ? { ...u, failedAttempts: 0, lockedUntil: null } : u,
            )
          : prev,
      );
      toast.success("Unlocked");
    },
    onError: () => toast.error("Failed"),
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Users & Security</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <ListSkeleton rows={6} />}
          {!isLoading && users && (
            <>
              {isFetching && (
                <div className="text-xs text-muted-foreground mb-2">
                  Loading content…
                </div>
              )}
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
                          onCheckedChange={(v) =>
                            toggle2fa.mutate({ id: u.id, val: !!v })
                          }
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => resetLock.mutate({ id: u.id })}
                      >
                        Reset Lock
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
