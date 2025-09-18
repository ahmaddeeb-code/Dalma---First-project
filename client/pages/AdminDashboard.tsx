import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarCheck,
  FileChartColumn,
  Users,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time view over beneficiaries, staff, services and alerts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <FileChartColumn className="mr-2" /> Export Report
          </Button>
          <Button variant="secondary">
            <Bell className="mr-2" /> Notification Center
          </Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Beneficiaries</CardDescription>
            <CardTitle className="flex items-baseline gap-2">
              1,248 <Badge variant="secondary">+24 today</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded bg-muted">
              <div className="h-full w-3/4 rounded bg-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Residential 45% · Daycare 40% · Home-based 15%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Appointments Today</CardDescription>
            <CardTitle className="flex items-baseline gap-2">342</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4" /> 89% attendance rate
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Staff Utilization</CardDescription>
            <CardTitle>72%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded bg-muted">
              <div className="h-full w-[72%] rounded bg-secondary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Target 75% · Overtime 6%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Quality KPI</CardDescription>
            <CardTitle className="flex items-center gap-2">
              96% <Activity className="h-5 w-5 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Based on therapy completion, incident rate, and satisfaction
            surveys.
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Beneficiaries by Category</CardTitle>
            <CardDescription>
              Distribution across Residential, Daycare, and Home-based services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Residential</p>
                <p className="text-2xl font-semibold">560</p>
                <div className="mt-2 h-2 rounded bg-muted">
                  <div className="h-full w-[45%] rounded bg-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Daycare</p>
                <p className="text-2xl font-semibold">499</p>
                <div className="mt-2 h-2 rounded bg-muted">
                  <div className="h-full w-[40%] rounded bg-secondary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Home-based</p>
                <p className="text-2xl font-semibold">189</p>
                <div className="mt-2 h-2 rounded bg-muted">
                  <div className="h-full w-[15%] rounded bg-info" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="text-warning" /> Urgent Alerts
            </CardTitle>
            <CardDescription>Real-time critical notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>Missed medication (Room 203)</span>
                <span className="rounded bg-warning/15 text-warning px-2 py-0.5">
                  High
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Transport delay (5 beneficiaries)</span>
                <span className="rounded bg-warning/15 text-warning px-2 py-0.5">
                  Medium
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>Therapy rescheduled</span>
                <span className="rounded bg-info/15 text-info px-2 py-0.5">
                  Info
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>
              Attendance, notes, and incident reporting.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> 92% on-time clock-ins · 18 field
            visits
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reviews</CardTitle>
            <CardDescription>
              Medical and psychological assessments this week.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4" /> 54 assessments scheduled
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications Summary</CardTitle>
            <CardDescription>Automated alerts and messages.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" /> 12 urgent · 36 normal · 128 info
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
