import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  CalendarClock,
  FileText,
  HandHeart,
  Lock,
  MessagesSquare,
  Stethoscope,
  Users,
} from "lucide-react";

export default function Index() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-10 md:p-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary ring-1 ring-primary/20">
            End-to-end care for people with disabilities
          </div>
          <h1 className="mt-4 text-4xl md:text-5xl font-extrabold tracking-tight">
منصة دلما الذكية
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A unified, cloud-based system connecting beneficiaries, employees,
            administrators, and families—delivering transparent, efficient, and
            sustainable services.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/admin">Explore Admin Dashboard</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/donations">Support with a Donation</Link>
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Active Beneficiaries</p>
              <p className="text-2xl font-semibold">1,248</p>
            </div>
            <div>
              <p className="text-muted-foreground">Monthly Appointments</p>
              <p className="text-2xl font-semibold">8,532</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg. Satisfaction</p>
              <p className="text-2xl font-semibold">96%</p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" />
      </section>

      {/* Portals */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight">
          Portals for every stakeholder
        </h2>
        <p className="mt-2 text-muted-foreground max-w-3xl">
          Beneficiary, Employee, Admin, and Family portals streamline daily
          operations—registration, records, therapies, attendance, and secure
          communication.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <PortalCard
            icon={<Stethoscope className="h-5 w-5" />}
            title="Beneficiary Portal"
            bullets={[
              "Registration & profiles",
              "Upload documents",
              "Appointments & therapies",
              "Status tracking",
            ]}
            to="/beneficiaries"
          />
          <PortalCard
            icon={<Users className="h-5 w-5" />}
            title="Employee Portal"
            bullets={[
              "Tasks & notes",
              "Clock in/out & field",
              "Access records",
              "Incident reports",
            ]}
            to="/employees"
          />
          <PortalCard
            icon={<Activity className="h-5 w-5" />}
            title="Admin Dashboard"
            bullets={[
              "KPI analytics",
              "Roles & permissions",
              "Budgets & finance",
              "Audit logs",
            ]}
            to="/admin"
          />
          <PortalCard
            icon={<HandHeart className="h-5 w-5" />}
            title="Family System"
            bullets={[
              "Health status",
              "Attendance & progress",
              "Alerts & schedules",
              "Direct messaging",
            ]}
            to="/family"
          />
        </div>
      </section>

      {/* Real-time Monitoring & Alerts */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Real-time Monitoring</CardTitle>
            <CardDescription>
              Visual indicators for medical, psychological, and functional
              status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <StatusBar label="Medical" value={86} color="bg-primary" />
              <StatusBar
                label="Psychological"
                value={91}
                color="bg-secondary"
              />
              <StatusBar label="Functional" value={78} color="bg-success" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Updated live from check-ins, therapy completion, and device
              integrations.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-warning" /> Smart Notifications
            </CardTitle>
            <CardDescription>
              Priority-based alerts for emergencies, absences, and schedule
              changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>Emergency flag raised (Ward B)</span>
                <span className="rounded bg-destructive/15 text-destructive px-2 py-0.5">
                  Urgent
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>3 absences detected</span>
                <span className="rounded bg-warning/15 text-warning px-2 py-0.5">
                  Medium
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Schedule updated for therapies</span>
                <span className="rounded bg-info/15 text-info px-2 py-0.5">
                  Low
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Security & Compliance */}
      <section>
        <h2 className="text-2xl font-bold tracking-tight">
          Security, accessibility, and trust
        </h2>
        <p className="mt-2 text-muted-foreground max-w-3xl">
          Advanced security with data encryption, 2FA, audit logs, and full
          accessibility. Cloud ready and scalable with integrations into
          national systems and medical devices.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={<Lock className="h-4 w-4" />}
            title="Advanced Security"
            text="Encryption at rest & in transit, 2FA, and role-based access."
          />
          <Feature
            icon={<MessagesSquare className="h-4 w-4" />}
            title="Unified Communication"
            text="Internal messaging, file sharing, and family updates."
          />
          <Feature
            icon={<CalendarClock className="h-4 w-4" />}
            title="Scheduling & Reminders"
            text="Therapies, health checks, and appointment reminders."
          />
          <Feature
            icon={<FileText className="h-4 w-4" />}
            title="Reports & Exports"
            text="KPI tracking with export to Excel & PDF."
          />
        </div>
      </section>

      <section className="rounded-xl border p-8 text-center">
        <h3 className="text-xl font-semibold">
          Ready to modernize your center?
        </h3>
        <p className="mt-2 text-muted-foreground">
          Let’s digitize operations and elevate quality of care—together.
        </p>
        <div className="mt-4">
          <Button asChild size="lg">
            <Link to="/admin">Launch the Dashboard</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function PortalCard({
  icon,
  title,
  bullets,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  bullets: string[];
  to: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{bullets[0]}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {bullets.slice(1).map((b) => (
            <li key={b} className="list-disc list-inside">
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-4">
          <Button asChild variant="secondary" size="sm">
            <Link to={to}>Open</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}%</p>
      </div>
      <div className="mt-2 h-2 w-full rounded bg-muted">
        <div
          className={`h-full rounded ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border p-5">
      <div className="inline-flex items-center gap-2 rounded bg-accent px-2 py-1 text-xs">
        {icon} <span>{title}</span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
