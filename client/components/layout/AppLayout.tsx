import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, HeartHandshake, LayoutDashboard, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { ReactNode, useMemo, useSyncExternalStore } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCurrentUser, getCurrentUserId, logout, subscribeAuth } from "@/store/auth";
import { loadACL } from "@/store/acl";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/admin", label: "Admin" },
  { to: "/beneficiaries", label: "Beneficiaries" },
  { to: "/employees", label: "Employees" },
  { to: "/family", label: "Family" },
  { to: "/reports", label: "Reports" },
  { to: "/donations", label: "Donations" },
];

function useAuthUser() {
  return useSyncExternalStore(
    (cb) => subscribeAuth(cb),
    () => getCurrentUser(),
    () => getCurrentUser(),
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const user = useAuthUser();
  const roles = useMemo(() => {
    if (!user) return [] as string[];
    const acl = loadACL();
    return user.roleIds.map((id) => acl.roles.find((r) => r.id === id)?.name || id);
  }, [user]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary to-secondary grid place-items-center text-white shadow-glow">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-tight">DALMA Smart Platform</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  cn(
                    "px-3 py-2 text-sm rounded-md transition-colors",
                    isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
                  )
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell />
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/donations"><HeartHandshake className="mr-2" /> Donate</Link>
            </Button>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary"><UserCircle2 className="mr-2" /> {user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles.length ? <DropdownMenuItem disabled>Roles: {roles.join(", ")}</DropdownMenuItem> : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); window.location.reload(); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary"><UserCircle2 className="mr-2" /> Sign in</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Choose role</DropdownMenuLabel>
                  <DropdownMenuItem asChild><Link to="/login/admin">Administrator</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/login/staff">Staff</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/login/family">Family</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/login/beneficiary">Beneficiary</Link></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button asChild variant="secondary" className="ml-1">
              <Link to="/admin"><LayoutDashboard className="mr-2" /> Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-10">{children}</main>

      <footer className="mt-16 border-t">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} DALMA Center. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/security" className="hover:text-foreground">Security</Link>
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
