import React from "react";

function scorePassword(pw: string) {
  let score = 0;
  if (!pw) return 0;
  // length
  if (pw.length >= 8) score += 1;
  if (pw.length >= 12) score += 1;
  // variety
  if (/[a-z]/.test(pw)) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  return Math.min(score, 6);
}

export default function PasswordStrength({ value }: { value: string }) {
  const score = scorePassword(value);
  const percent = Math.round((score / 6) * 100);
  const color =
    score <= 2
      ? "bg-destructive"
      : score <= 4
        ? "bg-amber-500"
        : "bg-emerald-500";
  return (
    <div className="space-y-1">
      <div className="h-2 w-full bg-muted rounded overflow-hidden">
        <div className={`${color} h-full`} style={{ width: `${percent}%` }} />
      </div>
      <div className="text-xs text-muted-foreground flex items-center justify-between">
        <span>{percent}%</span>
        <span>{score <= 2 ? "Weak" : score <= 4 ? "Medium" : "Strong"}</span>
      </div>
    </div>
  );
}
