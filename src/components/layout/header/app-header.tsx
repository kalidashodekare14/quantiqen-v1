"use client";

import { useEffect, useRef, useState } from "react";
import { Building2, ChevronDown, Search, X } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { NotificationBell } from "./notification-bell";
import { UserNav } from "./user-nav";
import { ThemeToggle } from "@/components/theme";
import { useProfile } from "@/features/profile/hooks/useProfile";
import dashboardData from "@/mock-data/dashboard.json";

export function AppHeader() {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading } = useProfile();

  const orgName = profile?.organizationName ?? "";

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <>
      <header className="bg-background border-border sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b px-6">
        <div className="flex items-center gap-1">
          <SidebarTrigger />

          {isLoading ? (
            <Skeleton className="hidden h-8 w-32 rounded-lg lg:block" />
          ) : orgName ? (
            <Button variant="ghost" className="hidden gap-2 lg:flex">
              <Building2 className="size-4" />
              <span>{orgName}</span>
              <ChevronDown className="text-muted-foreground size-3.5" />
            </Button>
          ) : null}
        </div>

        <div className="mx-auto hidden w-full max-w-sm lg:block">
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
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="size-5" />
          </Button>

          <span className="bg-primary/10 text-primary hidden rounded-full px-3 py-1 text-xs font-medium lg:inline">
            {dashboardData.organization.plan} Plan
          </span>

          <ThemeToggle />
          <NotificationBell />
          <UserNav />
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-4 translate-y-0 sm:max-w-lg" showCloseButton={false}>
          <div className="relative">
            <Search className="text-muted-foreground absolute top-8 left-3 size-4 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search decisions, assets, recommendations..."
              className="bg-muted border-input focus:border-primary text-foreground placeholder:text-muted-foreground mt-3 w-full rounded-xl border px-3 py-2 pl-9 text-sm transition-colors outline-none focus:ring-0 focus:outline-none"
            />
          </div>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute top-1 right-0">
              <X className="size-4" />
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
