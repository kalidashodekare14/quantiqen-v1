"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Check, LogOut, Settings, User } from "lucide-react";

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
import dashboardData from "@/mock-data/dashboard.json";

const LG_BREAKPOINT = "(min-width: 1024px)";

export function UserNav() {
  const router = useRouter();
  const isLg = useMediaQuery(LG_BREAKPOINT);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push(routes.login);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <div className="bg-primary/10 text-primary border-primary flex size-8 cursor-pointer items-center justify-center rounded-full border text-sm font-medium">
            AK
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* TODO: Add org switching when multiple orgs available from API */}
        {!isLg && (
          <>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <Building2 className="text-primary size-4" />
              <span className="flex-1 text-sm font-medium">{dashboardData.organization.name}</span>
              <Check className="text-primary size-4" />
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">Alex Kumar</p>
          <p className="text-muted-foreground text-xs">alex.kumar@acmecorp.com</p>
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
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
