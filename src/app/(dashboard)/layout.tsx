import { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import { AppHeader, AppSidebar } from "@/components/layout";
import { AuthGuard } from "@/components/auth/AuthGuard";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset className="min-w-0">
          <AppHeader />

          <main className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
