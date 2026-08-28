"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useProfile } from "@/features/profile/hooks/useProfile";

import { AppLogo } from "./app-logo";
import { NavMain } from "./nav-main";

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppSidebar() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();

  const displayName = profile?.displayName ?? user?.user_id ?? "User";
  const role = user?.role ?? "";
  const initials = getInitials(profile?.displayName ?? user?.user_id);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        <NavMain />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="group-data-[collapsible=icon]:size-10!">
              <Avatar size="sm">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                {isLoading ? (
                  <>
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="mt-1 h-3 w-16 rounded" />
                  </>
                ) : (
                  <>
                    <span className="truncate font-semibold">{displayName}</span>
                    <span className="text-muted-foreground truncate text-xs">{role}</span>
                  </>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
