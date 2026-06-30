"use client";

import Link from "next/link";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

export function AppLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="lg" tooltip="QUANTIQEN">
          <Link href="/dashboard">
            <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              Q
            </div>

            <div className="grid flex-1 text-left text-sm lg:text-base leading-tight">
              <span className="truncate font-semibold">QUANTIQEN</span>

              <span className="text-muted-foreground truncate text-xs lg:text-sm">Enterprise Dashboard</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
