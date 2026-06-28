"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function AppHeader() {
  return (
    <header className="bg-background/95 sticky top-0 z-50 flex h-16 items-center justify-between border-b px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Theme Toggle */}
        {/* Notification */}
        {/* User Menu */}
      </div>
    </header>
  );
}
