"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { navigationItems } from "@/constants/navigation";
import { useRole } from "@/hooks/use-role";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const AUDIT_LOG_ROLES = ["CUSTOMER_ADMIN", "ANALYST", "AUDITOR"] as const;

function isChildVisible(href: string, hasAnyRole: (roles: string[]) => boolean): boolean {
  if (href.endsWith("/audit-log")) {
    return hasAnyRole([...AUDIT_LOG_ROLES]);
  }
  return true;
}

export function NavMain() {
  const pathname = usePathname();
  const { hasAnyRole } = useRole();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  const [orgOpen, setOrgOpen] = useState(() => pathname.startsWith("/organization"));

  if (pathname.startsWith("/organization") && !orgOpen) {
    setOrgOpen(true);
  }

  const visibleItems = navigationItems.filter(
    (item) => !item.children || item.children.some((c) => isChildVisible(c.href, hasAnyRole)),
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>

      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isOrganizationActive =
              item.href === "/organization" && pathname.startsWith("/organization");

            if (hasChildren) {
              const visibleChildren = item.children!.filter((c) =>
                isChildVisible(c.href, hasAnyRole),
              );

              if (isCollapsed) {
                return (
                  <Popover key={item.href}>
                    <PopoverTrigger asChild>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={isOrganizationActive}
                          tooltip={item.title}
                        >
                          <Icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </PopoverTrigger>
                    <PopoverContent
                      side="right"
                      align="start"
                      sideOffset={8}
                      className="w-56 p-1"
                    >
                      <div className="text-muted-foreground mb-1 px-2 py-1.5 text-xs font-medium">
                        {item.title}
                      </div>
                      <SidebarMenu>
                        {visibleChildren.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <SidebarMenuItem key={child.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(child.href)}
                              >
                                <Link
                                  href={child.href}
                                  className="data-active:bg-primary/10! data-active:text-primary!"
                                >
                                  <ChildIcon />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </PopoverContent>
                  </Popover>
                );
              }

              return (
                <Collapsible
                  key={item.href}
                  open={orgOpen}
                  onOpenChange={setOrgOpen}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isOrganizationActive}
                        tooltip={item.title}
                      >
                        <Icon />
                        <span className="text-sm lg:text-base">{item.title}</span>
                        <ChevronDown className="ml-auto size-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {visibleChildren.map((child) => {
                          const ChildIcon = child.icon;
                          return (
                            <SidebarMenuSubItem key={child.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive(child.href)}
                              >
                                <Link
                                  href={child.href}
                                  className="data-active:bg-primary/10! data-active:text-primary!"
                                >
                                  <ChildIcon />
                                  <span>{child.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            }

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.title}>
                  <Link
                    href={item.href}
                    className="data-active:bg-primary/10! data-active:text-primary!"
                  >
                    <Icon />
                    <span className="text-sm lg:text-base">{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
