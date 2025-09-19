import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Bell,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCircle2,
  Users2,
  FileBarChart2,
  HandHeart,
  Users,
  Languages,
  Building2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  ArrowUp,
  Twitter,
  Github,
  Mail,
} from "lucide-react";
import {
  ReactNode,
  useEffect,
  useMemo,
  useSyncExternalStore,
  useState,
} from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCurrentUser,
  getCurrentUserId,
  logout,
  subscribeAuth,
} from "@/store/auth";
import { loadACL } from "@/store/acl";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getLocale, setLocale, subscribeLocale, t } from "@/i18n";
import { usePageLoading } from "@/hooks/use-page-loading";

const groups = [
  {
    labelKey: "nav.home",
    items: [
      { to: "/admin", key: "nav.admin", icon: LayoutDashboard },
      { to: "/reports", key: "nav.reports", icon: FileBarChart2 },
    ],
  },
  {
    labelKey: "nav.management",
    items: [
      { to: "/beneficiaries", key: "nav.beneficiaries", icon: Users2 },
      { to: "/employees", key: "nav.employees", icon: Users },
      { to: "/admin/families", key: "nav.families", icon: UserCircle2 },
      { to: "/admin/logistics", key: "nav.logistics", icon: Building2 },
      { to: "/donations", key: "nav.donations", icon: HandHeart },
    ],
  },
  {
    labelKey: "nav.settings",
    items: [
      {
        to: "/admin/access-control",
        key: "nav.accessControl",
        icon: ShieldCheck,
      },
      {
        to: "/admin/medical-settings",
        key: "nav.medicalSettings",
        icon: ShieldCheck,
      },
      {
        to: "/admin/beneficiary-settings",
        key: "nav.beneficiarySettings",
        icon: ShieldCheck,
      },
      {
        to: "/admin/organization-settings",
        key: "nav.organizationSettings",
        icon: ShieldCheck,
      },
      {
        to: "/admin/security-settings",
        key: "nav.securitySettings",
        icon: ShieldCheck,
      },
      { to: "/admin/translations", key: "nav.translations", icon: Languages },
    ],
  },
] as const;

function useAuthUserId() {
  return useSyncExternalStore(
    (cb) => subscribeAuth(cb),
    () => getCurrentUserId(),
    () => getCurrentUserId(),
  );
}

function useLocale() {
  return useSyncExternalStore(
    (cb) => subscribeLocale(cb),
    () => getLocale(),
    () => getLocale(),
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const userId = useAuthUserId();
  const user = useMemo(() => getCurrentUser(), [userId]);
  const roles = useMemo(() => {
    if (!user) return [] as string[];
    const acl = loadACL();
    return user.roleIds.map(
      (id) => acl.roles.find((r) => r.id === id)?.name || id,
    );
  }, [user]);
  const { pathname } = useLocation();
  const locale = useLocale();

  // Enable page transition loading for non-login pages
  if (!pathname.startsWith('/login')) {
    usePageLoading();
  }
  useEffect(() => {
    const el = document.documentElement;
    const wantDir = locale === "ar" ? "rtl" : "ltr";
    const wantLang = locale === "ar" ? "ar" : "en";
    if (el.getAttribute("dir") !== wantDir) el.setAttribute("dir", wantDir);
    if (el.getAttribute("lang") !== wantLang) el.setAttribute("lang", wantLang);
  }, [locale]);

  const hideChrome = pathname.startsWith("/login");

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (k: string) =>
    setOpenGroups((s) => ({ ...s, [k]: !s[k] }));

  // theme toggle
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // breadcrumb (nice readable path)
  const crumbs = useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((p, i) => ({
      label: p.replace(/-/g, " "),
      to: "/" + parts.slice(0, i + 1).join("/"),
    }));
  }, [pathname]);

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (hideChrome) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="container py-8 flex-grow">{children}</main>

        <footer className="bg-sidebar border border-sidebar-border shadow mt-auto">
          <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center text-white shadow-md">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{t("footer.title")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("footer.subtitle")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("footer.copyright").replace(
                    "{{year}}",
                    String(new Date().getFullYear()),
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/privacy"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  {t("footer.privacy")}
                </Link>
                <Link
                  to="/security"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  {t("footer.security")}
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  {t("footer.contact")}
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="github"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <a href="mailto:hello@example.com" aria-label="email">
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </div>

              <div className="ml-2">
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-primary to-secondary text-white px-4 py-2"
                >
                  <Link to="/donations">{t("donate.now")}</Link>
                </Button>
              </div>

              <div className="ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Language"
                      className="relative hover:bg-accent/50 transition-all duration-200 hover:scale-105 rounded-xl"
                    >
                      <Languages className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="glass-card border border-border/50 shadow-xl"
                  >
                    <DropdownMenuItem
                      onClick={() => setLocale("ar")}
                      className="hover:bg-accent/50 transition-all duration-200"
                    >
                      🇸🇦 العربية
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setLocale("en")}
                      className="hover:bg-accent/50 transition-all duration-200"
                    >
                      🇺🇸 English
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar
        side={locale === "ar" ? "right" : "left"}
        className={cn(
          locale === "ar" ? "border-l" : "border-r",
          "sidebar-enhanced animate-slide-in-left",
        )}
      >
        <SidebarHeader className="p-4">
          <Link to="/" className="flex items-center justify-end gap-3 group">
            <div className="flex flex-col items-end">
              <span className="font-extrabold text-lg tracking-tight gradient-text">
                {t("brand")}
              </span>
              <span className="text-xs text-muted-foreground">
                Smart Platform
              </span>
            </div>
            <div className="relative">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary via-primary-light to-secondary grid place-items-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator className="mx-4" />
        <SidebarContent className="px-2">
          {groups.map((g, groupIndex) => {
            const isOpen = openGroups[g.labelKey] ?? true;
            return (
              <SidebarGroup
                key={g.labelKey}
                className="animate-fade-in-scale"
                style={{ animationDelay: `${groupIndex * 100}ms` }}
              >
                <SidebarGroupLabel
                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-sidebar-accent/50 transition-all duration-200 group cursor-pointer"
                  onClick={() => toggleGroup(g.labelKey)}
                >
                  <span className="text-sm font-medium text-sidebar-foreground/80 group-hover:text-sidebar-foreground">
                    {t(g.labelKey as any)}
                  </span>
                  <div className="p-1 rounded-md transition-all duration-200 group-hover:bg-sidebar-accent">
                    {isOpen ? (
                      <ChevronDown className="h-3 w-3 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-3 w-3 transition-transform duration-200" />
                    )}
                  </div>
                </SidebarGroupLabel>
                {isOpen && (
                  <SidebarGroupContent className="animate-slide-in-top">
                    <SidebarMenu>
                      {g.items.map((n, itemIndex) => {
                        const Icon = n.icon;
                        const active = pathname === n.to;
                        return (
                          <SidebarMenuItem
                            key={n.to}
                            className="animate-fade-in-scale"
                            style={{
                              animationDelay: `${groupIndex * 100 + itemIndex * 50}ms`,
                            }}
                          >
                            <SidebarMenuButton
                              asChild
                              isActive={active}
                              className={cn(
                                "rounded-lg transition-all duration-200 nav-highlight group relative overflow-hidden",
                                active &&
                                  "active bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 shadow-sm",
                              )}
                            >
                              <NavLink
                                to={n.to}
                                className="flex items-center gap-3 px-3 py-2.5"
                              >
                                <div
                                  className={cn(
                                    "p-1.5 rounded-md transition-all duration-200",
                                    active
                                      ? "bg-gradient-to-br from-primary to-secondary text-white shadow-md"
                                      : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground group-hover:bg-sidebar-accent",
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span
                                  className={cn(
                                    "truncate font-medium transition-all duration-200",
                                    active
                                      ? "text-sidebar-foreground"
                                      : "text-sidebar-foreground/70 group-hover:text-sidebar-foreground",
                                  )}
                                >
                                  {t(n.key as any)}
                                </span>
                                {active && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                )}
              </SidebarGroup>
            );
          })}
        </SidebarContent>
        <SidebarFooter className="p-4">
          <Button
            asChild
            className="w-full rounded-xl shadow-lg btn-modern bg-gradient-to-r from-primary to-secondary hover:from-primary-light hover:to-secondary-light border-0 text-white font-medium"
          >
            <Link to="/donations" className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              {t("header.donate")}
              <Sparkles className="h-3 w-3 ml-auto animate-pulse" />
            </Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="bg-sidebar border border-sidebar-border shadow sticky top-0 z-50 group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
          <div className="flex h-16 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-accent/50 transition-all duration-200 hover:scale-105" />
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <nav
                    aria-label="breadcrumb"
                    className="text-sm text-muted-foreground hidden sm:flex items-center gap-2"
                  >
                    <Link to="/" className="hover:underline">
                      {t("home")}
                    </Link>
                    {crumbs.map((c, i) => (
                      <span key={c.to} className="flex items-center gap-2">
                        <span className="text-muted-foreground">/</span>
                        <Link to={c.to} className="hover:underline capitalize">
                          {c.label}
                        </Link>
                      </span>
                    ))}
                  </nav>
                </div>
                <div className="mt-1 hidden md:block">
                  <h2 className="text-base font-semibold">
                    {crumbs.length
                      ? crumbs[crumbs.length - 1]?.label
                      : t("dashboard")}
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
              <div className="hidden md:block w-[320px]">
                <Input placeholder={t("search.placeholder") || "Search..."} />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Language"
                    className="relative hover:bg-accent/50 transition-all duration-200 hover:scale-105 rounded-xl"
                  >
                    <Languages className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="glass-card border border-border/50 shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={() => setLocale("ar")}
                    className="hover:bg-accent/50 transition-all duration-200"
                  >
                    <span className="mr-2">🇸🇦</span>
                    العربية
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocale("en")}
                    className="hover:bg-accent/50 transition-all duration-200"
                  >
                    <span className="mr-2">🇺🇸</span>
                    English
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                size="icon"
                aria-label={t("home.notifications.title")}
                className="relative hover:bg-accent/50 transition-all duration-200 hover:scale-105 rounded-xl"
              >
                <Bell className="h-4 w-4" />
                <div className="notification-dot" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark((s) => !s)}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent/60 border border-border/50"
                    >
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center text-white text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="glass-card border border-border/50 shadow-xl min-w-56"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {roles.length ? (
                      <>
                        <DropdownMenuItem disabled className="text-xs">
                          <div className="flex flex-wrap gap-1">
                            {roles.map((role) => (
                              <span
                                key={role}
                                className="badge-modern bg-primary/10 text-primary border border-primary/20"
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    ) : null}
                    <DropdownMenuItem
                      onClick={() => {
                        logout();
                        window.location.reload();
                      }}
                      className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> {t("header.signOut")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="secondary"
                      className="rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 bg-gradient-to-r from-accent to-accent/80 hover:from-accent hover:to-accent/60 border border-border/50"
                    >
                      <UserCircle2 className="mr-2 h-4 w-4" />
                      {t("header.signIn")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="glass-card border border-border/50 shadow-xl"
                  >
                    <DropdownMenuLabel>
                      {t("header.chooseRole")}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-accent/50 transition-all duration-200"
                    >
                      <Link to="/login/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        {t("header.administrator")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-accent/50 transition-all duration-200"
                    >
                      <Link to="/login/staff">
                        <Users className="mr-2 h-4 w-4" />
                        {t("header.staff")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-accent/50 transition-all duration-200"
                    >
                      <Link to="/login/family">
                        <UserCircle2 className="mr-2 h-4 w-4" />
                        {t("header.family")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="hover:bg-accent/50 transition-all duration-200"
                    >
                      <Link to="/login/beneficiary">
                        <Users2 className="mr-2 h-4 w-4" />
                        {t("header.beneficiary")}
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        <main className="container py-8 animate-slide-in-top">{children}</main>

        <footer className="mt-auto bg-sidebar border border-sidebar-border shadow">
          <div className="container py-6 flex flex-col lg:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary grid place-items-center text-white shadow-md">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{t("footer.title")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("footer.subtitle")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("footer.copyright").replace(
                    "{{year}}",
                    String(new Date().getFullYear()),
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-4">
                <Link
                  to="/privacy"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  {t("footer.privacy")}
                </Link>
                <Link
                  to="/security"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  {t("footer.security")}
                </Link>
                <Link
                  to="/contact"
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  {t("footer.contact")}
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon">
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="twitter"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="github"
                  >
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <a href="mailto:hello@example.com" aria-label="email">
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  onClick={scrollTop}
                  variant="ghost"
                  size="icon"
                  aria-label="Back to top"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>

              <div className="ml-2">
                <Button
                  asChild
                  className="rounded-full bg-gradient-to-r from-primary to-secondary text-white px-4 py-2"
                >
                  <Link to="/donations">{t("donate.now")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
