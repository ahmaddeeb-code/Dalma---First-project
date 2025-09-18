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
  const ar = document.documentElement.getAttribute("dir") === "rtl";
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{ar ? "لوحة التحكم" : "Admin Dashboard"}</h1>
          <p className="text-muted-foreground mt-1">
            {ar ? "نظرة فورية على المستفيدين والموظفين والخدمات والتنبيهات." : "Real-time view over beneficiaries, staff, services and alerts."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <a href="/admin/access-control">
              <Users className="ml-2" /> {ar ? "التحكم بالصلاحيات" : "Access Control"}
            </a>
          </Button>
          <Button>
            <FileChartColumn className="ml-2" /> {ar ? "تصدير تقرير" : "Export Report"}
          </Button>
          <Button variant="secondary">
            <Bell className="ml-2" /> {ar ? "مركز التنبيهات" : "Notification Center"}
          </Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>المستفيدون</CardDescription>
            <CardTitle className="flex items-baseline gap-2">
              1,248 <Badge variant="secondary">+٢٤ اليوم</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-2 w-full rounded bg-muted">
              <div className="h-full w-3/4 rounded bg-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              سكنية ٤٥٪ · نهارية ٤٠٪ · منزلية ١٥٪
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>مواعيد اليوم</CardDescription>
            <CardTitle className="flex items-baseline gap-2">342</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4" /> 89% نسبة الحضور
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>استغلال الموظفين</CardDescription>
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
            <CardDescription>مؤشر الجودة</CardDescription>
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
            <CardTitle>المستفيدون حسب الفئة</CardTitle>
            <CardDescription>
              توزيع الخدمات السكنية والنهارية والمنزلية.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">سكنية</p>
                <p className="text-2xl font-semibold">560</p>
                <div className="mt-2 h-2 rounded bg-muted">
                  <div className="h-full w-[45%] rounded bg-primary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">نهارية</p>
                <p className="text-2xl font-semibold">499</p>
                <div className="mt-2 h-2 rounded bg-muted">
                  <div className="h-full w-[40%] rounded bg-secondary" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">منزلية</p>
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
              <AlertTriangle className="text-warning" /> تنبيهات عاجلة
            </CardTitle>
            <CardDescription>تنبيهات حرجة بالوقت الحقيقي.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span>دواء فائت (غرفة ٢٠٣)</span>
                <span className="rounded bg-warning/15 text-warning px-2 py-0.5">
                  عالي
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>��أخير النقل (٥ مستفيدين)</span>
                <span className="rounded bg-warning/15 text-warning px-2 py-0.5">
                  متوسط
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>إعادة جدولة علاج</span>
                <span className="rounded bg-info/15 text-info px-2 py-0.5">
                  معلومة
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>أداء الفريق</CardTitle>
            <CardDescription>
              الحضور والملاحظات وتقرير الحوادث.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Users className="h-4 w-4" /> 92% on-time clock-ins · 18 field
            visits
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>مراجعات قادمة</CardTitle>
            <CardDescription>
              تقييمات طبية ونفسية لهذا الأسبوع.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <CalendarCheck className="h-4 w-4" /> 54 تقييمات مجدولة
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ملخص الإشعارات</CardTitle>
            <CardDescription>تنبيهات ورسائل تلقائية.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" /> ١٢ عاجلة · ٣٦ عادية · ١٢٨ معلومات
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
