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
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
  Heart,
  Globe,
  ArrowRight,
} from "lucide-react";
import { t } from "@/i18n";
import { useEffect, useState } from "react";

export default function Index() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="space-y-24">
      {/* Enhanced Hero Section */}
      <section className={`relative overflow-hidden rounded-3xl border border-border/50 glass-card p-12 md:p-20 transition-all duration-1000 ${isVisible ? 'animate-fade-in-scale' : 'opacity-0'}`}>
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-2 text-sm font-medium border border-primary/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="gradient-text">{t("home.hero.badge")}</span>
          </div>
          <h1 className="mt-6 text-5xl md:text-7xl font-extrabold tracking-tight text-shadow-lg">
            <span className="gradient-text">{t("home.hero.title")}</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-2xl">
            {t("home.hero.desc")}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="btn-modern rounded-xl shadow-xl bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light border-0 text-white font-semibold px-8 py-6 text-lg">
              <Link to="/admin" className="flex items-center gap-2">
                {t("home.hero.ctaAdmin")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="btn-modern rounded-xl shadow-lg border border-border/50 backdrop-blur-sm px-8 py-6 text-lg font-semibold">
              <Link to="/donations" className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" />
                {t("home.hero.ctaDonate")}
              </Link>
            </Button>
          </div>
          
          {/* Enhanced Metrics */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="stats-card glass-card rounded-2xl p-6 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("home.metrics.active")}
                </p>
              </div>
              <p className="text-3xl font-bold gradient-text">1,248</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">+12% this month</span>
              </div>
            </div>
            <div className="stats-card glass-card rounded-2xl p-6 border border-border/50 hover:border-secondary/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/10">
                  <CalendarClock className="h-5 w-5 text-secondary" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("home.metrics.monthly")}
                </p>
              </div>
              <p className="text-3xl font-bold gradient-text">8,532</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">+8% this month</span>
              </div>
            </div>
            <div className="stats-card glass-card rounded-2xl p-6 border border-border/50 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/10">
                  <Heart className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  {t("home.metrics.satisfaction")}
                </p>
              </div>
              <p className="text-3xl font-bold gradient-text">96%</p>
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">+2% this month</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full animated-gradient opacity-20 blur-3xl float" />
        <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-gradient-to-r from-secondary/30 to-primary/30 blur-3xl float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/4 h-4 w-4 bg-primary rounded-full animate-pulse" />
        <div className="absolute top-1/4 left-1/3 h-2 w-2 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </section>

      {/* Enhanced Portals Section */}
      <section className="animate-slide-in-top" style={{ animationDelay: '200ms' }}>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight gradient-text mb-4">
            {t("home.portals.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("home.portals.desc")}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <PortalCard
            icon={<Stethoscope className="h-6 w-6" />}
            title={t("home.portals.beneficiary.title")}
            bullets={[
              t("home.portals.beneficiary.bullets.0"),
              t("home.portals.beneficiary.bullets.1"),
              t("home.portals.beneficiary.bullets.2"),
              t("home.portals.beneficiary.bullets.3"),
            ]}
            to="/beneficiaries"
            gradient="from-blue-500/20 to-blue-600/20"
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          />
          <PortalCard
            icon={<Users className="h-6 w-6" />}
            title={t("home.portals.employee.title")}
            bullets={[
              t("home.portals.employee.bullets.0"),
              t("home.portals.employee.bullets.1"),
              t("home.portals.employee.bullets.2"),
              t("home.portals.employee.bullets.3"),
            ]}
            to="/employees"
            gradient="from-emerald-500/20 to-emerald-600/20"
            iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <PortalCard
            icon={<Activity className="h-6 w-6" />}
            title={t("home.portals.admin.title")}
            bullets={[
              t("home.portals.admin.bullets.0"),
              t("home.portals.admin.bullets.1"),
              t("home.portals.admin.bullets.2"),
              t("home.portals.admin.bullets.3"),
            ]}
            to="/admin"
            gradient="from-purple-500/20 to-purple-600/20"
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
          />
          <PortalCard
            icon={<HandHeart className="h-6 w-6" />}
            title={t("home.portals.family.title")}
            bullets={[
              t("home.portals.family.bullets.0"),
              t("home.portals.family.bullets.1"),
              t("home.portals.family.bullets.2"),
              t("home.portals.family.bullets.3"),
            ]}
            to="/family"
            gradient="from-rose-500/20 to-rose-600/20"
            iconBg="bg-gradient-to-br from-rose-500 to-rose-600"
          />
        </div>
      </section>

      {/* Enhanced Real-time Monitoring & Alerts */}
      <section className="grid gap-8 lg:grid-cols-3 animate-slide-in-top" style={{ animationDelay: '400ms' }}>
        <Card className="lg:col-span-2 card-hover glass-card border border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              {t("home.monitor.title")}
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {t("home.monitor.desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 md:grid-cols-3">
              <EnhancedStatusBar
                label={t("home.monitor.medical")}
                value={86}
                color="from-primary to-primary-light"
                icon={<Stethoscope className="h-4 w-4" />}
              />
              <EnhancedStatusBar
                label={t("home.monitor.psychological")}
                value={91}
                color="from-secondary to-secondary-light"
                icon={<Heart className="h-4 w-4" />}
              />
              <EnhancedStatusBar
                label={t("home.monitor.functional")}
                value={78}
                color="from-emerald-500 to-emerald-400"
                icon={<Zap className="h-4 w-4" />}
              />
            </div>
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Updated live from check-ins, therapy completion, and device integrations.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover glass-card border border-border/50 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/10">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              </div>
              {t("home.notifications.title")}
            </CardTitle>
            <CardDescription>{t("home.notifications.desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-destructive/5 to-destructive/10 border border-destructive/20">
                <span className="text-sm font-medium">{t("home.notifications.urgentFlag")}</span>
                <span className="badge-modern bg-gradient-to-r from-destructive to-destructive-light text-white shadow-sm">
                  {t("home.notifications.urgent")}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-amber-500/5 to-amber-500/10 border border-amber-500/20">
                <span className="text-sm font-medium">{t("home.notifications.absences")}</span>
                <span className="badge-modern bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-sm">
                  {t("home.notifications.medium")}
                </span>
              </li>
              <li className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-blue-500/5 to-blue-500/10 border border-blue-500/20">
                <span className="text-sm font-medium">{t("home.notifications.schedule")}</span>
                <span className="badge-modern bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-sm">
                  {t("home.notifications.low")}
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Enhanced Security & Compliance */}
      <section className="animate-slide-in-top" style={{ animationDelay: '600ms' }}>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight gradient-text mb-4">
            {t("home.security.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("home.security.desc")}
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <EnhancedFeature
            icon={<Lock className="h-5 w-5" />}
            title={t("home.security.features.advanced.title")}
            text={t("home.security.features.advanced.text")}
            gradient="from-blue-500/20 to-blue-600/20"
          />
          <EnhancedFeature
            icon={<MessagesSquare className="h-5 w-5" />}
            title={t("home.security.features.comms.title")}
            text={t("home.security.features.comms.text")}
            gradient="from-emerald-500/20 to-emerald-600/20"
          />
          <EnhancedFeature
            icon={<CalendarClock className="h-5 w-5" />}
            title={t("home.security.features.schedule.title")}
            text={t("home.security.features.schedule.text")}
            gradient="from-purple-500/20 to-purple-600/20"
          />
          <EnhancedFeature
            icon={<FileText className="h-5 w-5" />}
            title={t("home.security.features.reports.title")}
            text={t("home.security.features.reports.text")}
            gradient="from-rose-500/20 to-rose-600/20"
          />
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="glass-card rounded-3xl border border-border/50 p-12 text-center relative overflow-hidden animate-slide-in-top" style={{ animationDelay: '800ms' }}>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 px-4 py-2 text-sm font-medium border border-primary/20 backdrop-blur-sm mb-6">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="gradient-text">Get Started Today</span>
          </div>
          <h3 className="text-3xl font-bold gradient-text mb-4">{t("home.cta.title")}</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t("home.cta.desc")}</p>
          <Button asChild size="lg" className="btn-modern rounded-xl shadow-xl bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light border-0 text-white font-semibold px-8 py-6 text-lg">
            <Link to="/admin" className="flex items-center gap-2">
              {t("home.cta.button")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <div className="absolute -top-20 -right-20 h-40 w-40 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full blur-3xl" />
      </section>
    </div>
  );
}

function PortalCard({
  icon,
  title,
  bullets,
  to,
  gradient,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  bullets: string[];
  to: string;
  gradient: string;
  iconBg: string;
}) {
  return (
    <Card className={`h-full card-hover glass-card border border-border/50 rounded-2xl overflow-hidden bg-gradient-to-br ${gradient}`}>
      <CardHeader className="space-y-4 pb-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconBg} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <CardTitle className="text-xl font-bold mb-2">{title}</CardTitle>
          <CardDescription className="text-base leading-relaxed">{bullets[0]}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3 text-sm text-muted-foreground mb-6">
          {bullets.slice(1).map((b, i) => (
            <li key={b} className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Button asChild variant="secondary" size="sm" className="btn-modern w-full rounded-xl shadow-md">
          <Link to={to} className="flex items-center justify-center gap-2">
            {t("home.portals.open")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function EnhancedStatusBar({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-muted-foreground">{icon}</div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>
        <p className="text-lg font-bold">{value}%</p>
      </div>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out shadow-sm`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function EnhancedFeature({
  icon,
  title,
  text,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  gradient: string;
}) {
  return (
    <div className={`glass-card rounded-2xl p-6 border border-border/50 card-hover bg-gradient-to-br ${gradient}`}>
      <div className="inline-flex items-center gap-3 rounded-xl bg-background/50 backdrop-blur-sm px-3 py-2 text-sm font-medium border border-border/30 mb-4">
        <div className="text-primary">{icon}</div>
        <span className="font-semibold">{title}</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    </div>
  );
}
