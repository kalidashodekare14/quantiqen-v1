"use client";

import KpiGrid from "@/components/shared/KpiGrid";
import StatsRow from "./components/StatsRow";
import WelcomeBar from "./components/WelcomeBar";
import DashboardSkeleton from "./components/DashboardSkeleton";
import { useDashboard } from "./hooks/useDashboard";

const ViewDashboard = () => {
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data) return null;

  return (
    <div>
      <WelcomeBar organization={data.organization} summary={data?.securitySummary} />
      <StatsRow summary={data.securitySummary} />
      <KpiGrid cards={data.kpiCards} />
    </div>
  );
};

export default ViewDashboard;
