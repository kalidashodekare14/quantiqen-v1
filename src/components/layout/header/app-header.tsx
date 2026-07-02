"use client";

import { Building2, ChevronDown, Search } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

import { NotificationBell } from "./notification-bell";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "@/components/theme";
import dashboardData from "@/mock-data/dashboard.json";

export function AppHeader() {
  return (
    <header className="bg-background border-border sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-6">
      <div className="flex items-center gap-1">
        <SidebarTrigger />

        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="size-4" />
          <span className="hidden sm:inline">{dashboardData.organization.name}</span>
          <ChevronDown className="text-muted-foreground size-3.5" />
        </Button>
      </div>

      <div className="mx-auto hidden w-full max-w-sm md:block">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-muted border-input focus:border-primary text-foreground placeholder:text-muted-foreground w-full rounded-xl border px-3 py-1.5 pl-9 text-sm transition-colors outline-none focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
          {dashboardData.organization.plan} Plan
        </span>

        <ThemeToggle />
        <NotificationBell />
        <UserNav />
      </div>
    </header>
  );
}
