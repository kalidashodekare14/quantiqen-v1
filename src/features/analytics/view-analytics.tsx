"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAnalytics } from "./hooks/useAnalytics";
import AnalyticsSkeleton from "./components/AnalyticsSkeleton";

const RiskTrendChart = dynamic(
  () => import("./components/RiskTrendChart"),
  { ssr: false, loading: () => <div className="bg-card/80 border border-foreground/10 rounded-xl p-4 h-64 animate-pulse" /> }
);
const DecisionTrendChart = dynamic(
  () => import("./components/DecisionTrendChart"),
  { ssr: false, loading: () => <div className="bg-card/80 border border-foreground/10 rounded-xl p-4 h-64 animate-pulse" /> }
);
const ApiUsageChart = dynamic(
  () => import("./components/ApiUsageChart"),
  { ssr: false, loading: () => <div className="bg-card/80 border border-foreground/10 rounded-xl p-4 h-64 animate-pulse" /> }
);
const RiskDistributionChart = dynamic(
  () => import("./components/RiskDistributionChart"),
  { ssr: false, loading: () => <div className="bg-card/80 border border-foreground/10 rounded-xl p-4 h-64 animate-pulse" /> }
);
const SecurityScoreChart = dynamic(
  () => import("./components/SecurityScoreChart"),
  { ssr: false, loading: () => <div className="bg-card/80 border border-foreground/10 rounded-xl p-4 h-64 animate-pulse" /> }
);
const DailyDecisionChart = dynamic(
  () => import("./components/DailyDecisionChart"),
  { ssr: false, loading: () => <div className="bg-card/80 border border-foreground/10 rounded-xl p-4 h-64 animate-pulse" /> }
);

const ViewAnalytics = () => {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isError) return null;
  if (!data) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Analytics"
        subtitle="Security insights and trends"
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <RiskTrendChart data={data.riskTrend} />
        <DecisionTrendChart data={data.decisionTrend} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ApiUsageChart data={data.apiUsage} />
        <SecurityScoreChart data={data.securityScoreTimeline} />
      </div>

      <RiskDistributionChart
        riskDistribution={data.riskDistribution}
        assetsByCategory={data.assetsByCategory}
        threatDistribution={data.threatDistribution}
      />

      <DailyDecisionChart data={data.dailyDecisionCount} />
    </div>
  );
};

export default ViewAnalytics;
