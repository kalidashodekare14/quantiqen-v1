"use client";

import KpiGrid from "@/components/shared/KpiGrid";
import StatsRow from "./components/StatsRow";
import WelcomeBar from "./components/WelcomeBar";
import { useDashboard } from "./hooks/useDashboard";

const ViewDashboard = () => {
  const { data, isLoading } = useDashboard();

  //   if (isLoading) return <LoadingSkeleton />
  // if (isError) return <p>Error loading data</p>
  if (!data) return null;

  console.log("checking data", data);
  return (
    <div>
      <WelcomeBar organization={data.organization} summary={data?.securitySummary} />
      <StatsRow summary={data.securitySummary} />
      <KpiGrid cards={data.kpiCards} />
    </div>
  );
};

export default ViewDashboard;
