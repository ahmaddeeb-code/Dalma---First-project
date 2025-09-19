import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatsCard,
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

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title={t("pages.admin.tiles.beneficiaries.title")}
          value="1,248"
          description={
            ar
              ? "سكنية ٤٥٪ · نهارية ٤٠٪ · منزلية ١٥٪"
              : "Residential 45% · Daycare 40% · Home-based 15%"
          }
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
          gradient="from-blue-500/10 via-blue-500/5 to-transparent"
        />
        <StatsCard
          title={t("pages.admin.tiles.appointments.title")}
          value="342"
          description={ar ? "89% نسبة الحضور" : "89% attendance rate"}
          icon={<CalendarCheck className="h-5 w-5" />}
          gradient="from-emerald-500/10 via-emerald-500/5 to-transparent"
        />
        <StatsCard
          title={t("pages.admin.tiles.staffUtil.title")}
          value="72%"
          description={t("pages.admin.tiles.staffUtil.note")}
          icon={<Activity className="h-5 w-5" />}
          gradient="from-purple-500/10 via-purple-500/5 to-transparent"
        />
        <StatsCard
          title={t("pages.admin.tiles.quality.title")}
          value="96%"
          description={t("pages.admin.tiles.quality.desc")}
          icon={<Activity className="h-5 w-5" />}
          trend={{ value: 4, isPositive: true }}
          gradient="from-rose-500/10 via-rose-500/5 to-transparent"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card variant="modern" className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileChartColumn className="h-5 w-5 text-primary" />
              {t("pages.admin.chart.title")}
            </CardTitle>
            <CardDescription>{t("pages.admin.chart.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("pages.admin.chart.labels.residential")}
                </p>
                <p className="text-2xl font-bold">560</p>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[45%] rounded-full bg-primary transition-all duration-500" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/5 to-secondary/10 border border-secondary/20">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("pages.admin.chart.labels.daycare")}
                </p>
                <p className="text-2xl font-bold">499</p>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[40%] rounded-full bg-secondary transition-all duration-500" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border border-emerald-500/20">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("pages.admin.chart.labels.home")}
                </p>
                <p className="text-2xl font-bold">189</p>
                <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[15%] rounded-full bg-emerald-500 transition-all duration-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card variant="modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {t("pages.admin.alerts.title")}
            </CardTitle>
            <CardDescription>{t("pages.admin.alerts.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-red-500/5 to-red-500/10 border border-red-500/20">
                <span className="text-sm font-medium">
                  {t("pages.admin.alerts.items.missedMedication")}
                </span>
                <Badge className="bg-red-500 text-white hover:bg-red-500">
                  {t("pages.admin.alerts.levels.high")}
                </Badge>
              </li>
              <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium">
                  {t("pages.admin.alerts.items.transportDelay")}
                </span>
                <Badge className="bg-amber-500 text-white hover:bg-amber-500">
                  {t("pages.admin.alerts.levels.medium")}
                </Badge>
              </li>
              <li className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                <span className="text-sm font-medium">
                  {t("pages.admin.alerts.items.therapyRescheduled")}
                </span>
                <Badge className="bg-blue-500 text-white hover:bg-blue-500">
                  {t("pages.admin.alerts.levels.info")}
                </Badge>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card variant="modern" hover>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" />
              {t("pages.admin.team.title")}
            </CardTitle>
            <CardDescription>{t("pages.admin.team.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("pages.admin.team.summary")}
            </p>
          </CardContent>
        </Card>
        <Card variant="modern" hover>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarCheck className="h-5 w-5 text-primary" />
              {t("pages.admin.reviews.title")}
            </CardTitle>
            <CardDescription>{t("pages.admin.reviews.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("pages.admin.reviews.summary")}
            </p>
          </CardContent>
        </Card>
        <Card variant="modern" hover>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-primary" />
              {t("pages.admin.notifSummary.title")}
            </CardTitle>
            <CardDescription>
              {t("pages.admin.notifSummary.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t("pages.admin.notifSummary.summary")}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
