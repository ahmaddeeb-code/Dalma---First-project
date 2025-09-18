import { Link, NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, HeartHandshake, LayoutDashboard, LogOut, ShieldCheck, UserCircle2, Users2, FileBarChart2, HandHeart, Users } from "lucide-react";
import { ReactNode, useMemo, useSyncExternalStore } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { getCurrentUser, getCurrentUserId, logout, subscribeAuth } from "@/store/auth";
import { loadACL } from "@/store/acl";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";

const navItems = [
  { to: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/beneficiaries", label: "المستفيدون", icon: Users2 },
  { to: "/employees", label: "الموظفون", icon: Users },
  { to: "/family", label: "العائلة", icon: UserCircle2 },
  { to: "/reports", label: "التقارير", icon: FileBarChart2 },
  { to: "/donations", label: "التبرعات", icon: HandHeart },
  { to: "/admin/access-control", label: "التحكم بالصلاحيات", icon: ShieldCheck },
];

function useAuthUserId() {
  return useSyncExternalStore(
    (cb) => subscribeAuth(cb),
    () => getCurrentUserId(),
    () => getCurrentUserId(),
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const userId = useAuthUserId();
  const user = useMemo(() => getCurrentUser(), [userId]);
  const roles = useMemo(() => {
    if (!user) return [] as string[];
    const acl = loadACL();
    return user.roleIds.map((id) => acl.roles.find((r) => r.id === id)?.name || id);
  }, [user]);
  const { pathname } = useLocation();

  return (
    <SidebarProvider>
      <Sidebar side="right" className="border-l">
        <SidebarHeader>
          <Link to="/" className="flex items-center justify-end gap-2 px-2">
            <span className="font-extrabold tracking-tight">منصة دلما الذكية</span>
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center text-white shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </Link>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>التنقل</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((n) => {
                  const Icon = n.icon;
                  const active = pathname === n.to;
                  return (
                    <SidebarMenuItem key={n.to}>
                      <SidebarMenuButton asChild isActive={active}>
                        <NavLink to={n.to} className="flex items-center gap-2">
                          <span className="truncate">{n.label}</span>
                          <Icon />
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="mt-auto">
          <Button asChild className="w-full">
            <Link to="/donations"><HeartHandshake className="ml-2" />تبرع الآن</Link>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground">مرحبا {user ? user.name : "بالضيف"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="الإشعارات">
                <Bell />
              </Button>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary"><UserCircle2 className="ml-2" /> {user.name}</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {roles.length ? <DropdownMenuItem disabled>الأدوار: {roles.join("، ")}</DropdownMenuItem> : null}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { logout(); window.location.reload(); }}>
                      <LogOut className="ml-2 h-4 w-4" /> تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary"><UserCircle2 className="ml-2" /> تسجيل الدخول</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuLabel>اختر الدور</DropdownMenuLabel>
                    <DropdownMenuItem asChild><Link to="/login/admin">مدير النظام</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/login/staff">موظف</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/login/family">عائلة</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link to="/login/beneficiary">مستفيد</Link></DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>
        <main className="container py-6">{children}</main>
        <footer className="mt-8 border-t">
          <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} مركز دلما. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-foreground">الخصوصية</Link>
              <Link to="/security" className="hover:text-foreground">الأمان</Link>
              <Link to="/contact" className="hover:text-foreground">تواصل</Link>
            </div>
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
