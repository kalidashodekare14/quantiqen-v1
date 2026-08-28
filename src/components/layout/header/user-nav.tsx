"use client";

import Link from "next/link";
import { Building2, Check, Loader2, LogOut, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { routes } from "@/constants/routes";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useAuth } from "@/lib/auth-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/features/profile/hooks/useProfile";
import dashboardData from "@/mock-data/dashboard.json";

const LG_BREAKPOINT = "(min-width: 1024px)";

function getInitials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserNav() {
  const isLg = useMediaQuery(LG_BREAKPOINT);
  const { user, logout, isLoggingOut } = useAuth();
  const { data: profile, isLoading } = useProfile();

  const displayName = profile?.displayName ?? user?.user_id ?? "User";
  const email = profile?.email ?? "";
  const orgName = profile?.organizationName ?? "";
  const initials = getInitials(profile?.displayName ?? user?.user_id);

  const handleLogout = async () => {
    await logout();
  };

  if (isLoading) {
    return <Skeleton className="size-8 rounded-full" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="bg-primary/10 text-primary border-primary flex size-8 cursor-pointer items-center justify-center rounded-full border text-sm font-medium">
            {initials}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {!isLg && orgName && (
          <>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Building2 className="text-primary size-4" />
              <span className="flex-1 text-sm font-medium">{orgName}</span>
              <Check className="text-primary size-4" />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          {email && (
            <p className="text-muted-foreground text-xs">{email}</p>
          )}
          {!isLg && (
            <span className="bg-primary/10 text-primary mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] leading-normal font-medium">
              {dashboardData.organization.plan} Plan
            </span>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={routes.profile} className="cursor-pointer">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={routes.settings} className="cursor-pointer">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          {isLoggingOut ? <Loader2 className="animate-spin" /> : <LogOut />}
          {isLoggingOut ? "Logging out..." : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
