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
import { t } from "@/i18n";

export default function AdminDashboard() {
  const ar = document.documentElement.getAttribute("dir") === "rtl";
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("pages.admin.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("pages.admin.subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <a href="/admin/access-control">
              <Users className="ml-2" />{" "}
              {t("pages.admin.buttons.accessControl")}
            </a>
          </Button>
          <Button>
            <FileChartColumn className="ml-2" />{" "}
            {t("pages.admin.buttons.exportReport")}
          </Button>
          <Button variant="secondary">
            <Bell className="ml-2" /> {t("pages.admin.buttons.notifications")}
          </Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>
              {t("pages.admin.tiles.beneficiaries.title")}
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2">
              1,248{" "}
              <Badge variant="secondary">
                {t("pages.admin.tiles.beneficiaries.deltaToday")}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded bg-muted">
              <div className="h-full w-3/4 rounded bg-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {ar
                ? "سكنية ٤٥٪ · نهارية ٤٠٪ · منزلية ١٥٪"
                : "Residential 45% · Daycare 40% · Home-based 15%"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              {t("pages.admin.tiles.appointments.title")}
            </CardDescription>
            <CardTitle className="flex items-baseline gap-2">342</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4" /> 89% نسبة الحضور
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              {t("pages.admin.tiles.staffUtil.title")}
            </CardDescription>
            <CardTitle>72%</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded bg-muted">
              <div className="h-full w-[72%] rounded bg-secondary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t("pages.admin.tiles.staffUtil.note")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>
              {t("pages.admin.tiles.quality.title")}
            </CardDescription>
            <CardTitle className="flex items-center gap-2">
              96% <Activity className="h-5 w-5 text-success" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {t("pages.admin.tiles.quality.desc")}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("pages.admin.chart.title")}</CardTitle>
            <CardDescription>{t("pages.admin.chart.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("pages.admin.chart.labels.residential")}
                </p>
                <p className="text-2xl font-semibold">560</p>
                <div className="mt-2 h-2 rounded bg-muted">
                  <div className="h-full w-[45%] rounded bg-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("pages.admin.chart.labels.daycare")}
                </p>
                <p className="text-2xl font-semibold">499</p>
                <div className="mt-2 h-2 rounded bg-muted">
                  <div className="h-full w-[40%] rounded bg-secondary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("pages.admin.chart.labels.home")}
                </p>
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
              <AlertTriangle className="text-warning" />{" "}
              {t("pages.admin.alerts.title")}
            </CardTitle>
            <CardDescription>{t("pages.admin.alerts.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>{t("pages.admin.alerts.items.missedMedication")}</span>
                <span className="rounded bg-warning/15 text-warning px-2 py-0.5">
                  {t("pages.admin.alerts.levels.high")}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>{t("pages.admin.alerts.items.transportDelay")}</span>
                <span className="rounded bg-warning/15 text-warning px-2 py-0.5">
                  {t("pages.admin.alerts.levels.medium")}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>{t("pages.admin.alerts.items.therapyRescheduled")}</span>
                <span className="rounded bg-info/15 text-info px-2 py-0.5">
                  {t("pages.admin.alerts.levels.info")}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.admin.team.title")}</CardTitle>
            <CardDescription>{t("pages.admin.team.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> {t("pages.admin.team.summary")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.admin.reviews.title")}</CardTitle>
            <CardDescription>{t("pages.admin.reviews.desc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4" />{" "}
            {t("pages.admin.reviews.summary")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.admin.notifSummary.title")}</CardTitle>
            <CardDescription>
              {t("pages.admin.notifSummary.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" /> {t("pages.admin.notifSummary.summary")}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
