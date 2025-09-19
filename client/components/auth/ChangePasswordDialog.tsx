import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getCurrentUserId, logout } from "@/store/auth";
import { toast } from "sonner";

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const userId = getCurrentUserId();
  const [current, setCurrent] = useState("");
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  async function submit() {
    setErr(null);
    if (!current) {
      setErr("Current password is required");
      return;
    }
    if (!strong.test(pw1)) {
      setErr("Password must be 8+ chars, include upper, lower, and a number");
      return;
    }
    if (pw1 !== pw2) {
      setErr("Passwords do not match");
      return;
    }
    if (!userId) {
      setErr("Not signed in");
      return;
    }
    try {
      const r = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          currentPassword: current,
          newPassword: pw1,
        }),
      });
      const d = await r.json();
      if (!d.ok) {
        if (d.error === "Incorrect current password")
          setErr("Incorrect current password");
        else if (d.error === "Weak password")
          setErr(
            "Password must be 8+ chars, include upper, lower, and a number",
          );
        else setErr(d.error || "Failed to change password");
        return;
      }
      toast.success("Password changed. Please sign in again.");
      onOpenChange(false);
      logout();
      window.location.assign("/login");
    } catch (e) {
      setErr("Failed to change password");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label requiredMark>Current Password</Label>
            <Input
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label requiredMark>New Password</Label>
            <Input
              type="password"
              value={pw1}
              onChange={(e) => setPw1(e.target.value)}
            />
            <div className="text-xs text-muted-foreground">
              8+ chars, include upper, lower, and a number.
            </div>
          </div>
          <div className="space-y-1">
            <Label requiredMark>Confirm New Password</Label>
            <Input
              type="password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
          </div>
          {err && <div className="text-sm text-red-600">{err}</div>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Change Password</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
