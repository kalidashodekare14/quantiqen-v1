"use client";

import { PageHeader } from "@/components/shared/PageHeader";
import { RequireRole } from "@/components/auth/RequireRole";
import PlatformStatusCard from "./components/PlatformStatusCard";
import SystemHealthCard from "./components/SystemHealthCard";
import DlqSection from "./components/DlqSection";
import IncidentsSection from "./components/IncidentsSection";

const ViewPlatformOps = () => {
  return (
    <RequireRole
      allowedRoles={["CUSTOMER_ADMIN"]}
      fallback={
        <div className="text-muted-foreground py-12 text-center">
          Platform Ops requires CUSTOMER_ADMIN role.
        </div>
      }
    >
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Platform Ops"
          subtitle="Platform status, health, dead letter queue, and incidents"
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <PlatformStatusCard />
          <SystemHealthCard />
        </div>

        <DlqSection />

        <IncidentsSection />
      </div>
    </RequireRole>
  );
};

export default ViewPlatformOps;
