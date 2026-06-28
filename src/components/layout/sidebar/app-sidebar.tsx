"use client";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";

import { AppLogo } from "./app-logo";
import { NavMain } from "./nav-main";

export function AppSidebar() {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>{/* User Profile */}</SidebarFooter>
    </Sidebar>
  );
}
