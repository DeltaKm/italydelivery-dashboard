"use client";

import { useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Truck,
  Store,
  Network,
  Users,
  UserRound,
  LogOut,
  Menu,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/session-constants";

type NavItem = {
  key: string;
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const NAV_ITEMS: NavItem[] = [
  {
    key: "overview",
    href: "/dashboard",
    label: "Panoramica",
    icon: LayoutDashboard,
    roles: ["ADMIN", "LOGISTICS", "BUSINESS"],
  },
  {
    key: "deliveries",
    href: "/dashboard/deliveries",
    label: "Consegne",
    icon: Truck,
    roles: ["ADMIN", "LOGISTICS", "BUSINESS"],
  },
  {
    key: "stats",
    href: "/dashboard/stats",
    label: "Statistiche",
    icon: BarChart3,
    roles: ["ADMIN", "LOGISTICS", "BUSINESS"],
  },
  {
    key: "businesses",
    href: "/dashboard/businesses",
    label: "Attività",
    icon: Store,
    roles: ["ADMIN", "LOGISTICS"],
  },
  {
    key: "logistics",
    href: "/dashboard/logistics",
    label: "Logistics",
    icon: Network,
    roles: ["ADMIN"],
  },
  {
    key: "raiders",
    href: "/dashboard/raiders",
    label: "Raider",
    icon: Users,
    roles: ["ADMIN", "LOGISTICS", "BUSINESS"],
  },
  {
    key: "users",
    href: "/dashboard/users",
    label: "Utenti",
    icon: UserRound,
    roles: ["ADMIN"],
  },
];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Amministratore",
  LOGISTICS: "Logistics",
  BUSINESS: "Attività",
  USER: "Utente",
  RAIDER: "Raider",
};

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

function NavLinks({ items, pathname, onNavigate }: {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-1 px-3">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.key}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 flex-col bg-sidebar md:flex">
        <div className="flex h-14 items-center justify-center border-b border-sidebar-border px-4 text-lg font-semibold text-sidebar-foreground">
          ItalyDelivery
        </div>
        <div className="flex-1 overflow-y-auto py-3">
          <NavLinks items={items} pathname={pathname} />
        </div>
      </aside>

      {/* Sheet per mobile: nessun trigger fluttuante automatico, lo controllo io */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
          <SheetHeader className="border-b border-sidebar-border bg-sidebar">
            <SheetTitle className="text-sidebar-foreground">ItalyDelivery</SheetTitle>
          </SheetHeader>
          <div className="flex-1 bg-sidebar py-3">
            <NavLinks items={items} pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-2 border-b bg-background px-3 md:justify-end md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Apri menu"
          >
            <Menu className="size-5" />
          </Button>

          <div className="flex items-center gap-2">
            {role === "BUSINESS" || role === "LOGISTICS" ? (
              <Link href="/dashboard/profile">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <UserRound className="size-4" />
                  <span className="hidden sm:inline">{ROLE_LABEL[role]}</span>
                </Button>
              </Link>
            ) : (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {ROLE_LABEL[role]}
              </span>
            )}
            <Button variant="outline" size="sm" className="gap-1.5" onClick={handleLogout}>
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Esci</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-3 md:p-6">{children}</main>
      </div>
    </div>
  );
}
