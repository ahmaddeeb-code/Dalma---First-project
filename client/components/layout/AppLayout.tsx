import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bell, HeartHandshake, LayoutDashboard, ShieldCheck } from "lucide-react";
import { ReactNode } from "react";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/admin", label: "Admin" },
  { to: "/beneficiaries", label: "Beneficiaries" },
  { to: "/employees", label: "Employees" },
  { to: "/family", label: "Family" },
  { to: "/reports", label: "Reports" },
  { to: "/donations", label: "Donations" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
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
