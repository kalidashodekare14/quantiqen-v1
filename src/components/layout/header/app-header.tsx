"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

import { PageTitle } from "./page-title";
import { ThemeToggle } from "@/components/theme";

export function AppHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 flex h-16 items-center justify-between border-b px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <Separator orientation="vertical" className="h-5" />

        <PageTitle />
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* Notification */}
        {/* User Dropdown */}
      </div>
    </header>
  );
}
