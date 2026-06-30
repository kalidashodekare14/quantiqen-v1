"use client";

import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { useAnalytics } from "./hooks/useAnalytics";
import RiskTrendChart from "./components/RiskTrendChart";
import DecisionTrendChart from "./components/DecisionTrendChart";
import ApiUsageChart from "./components/ApiUsageChart";
import RiskDistributionChart from "./components/RiskDistributionChart";
import SecurityScoreChart from "./components/SecurityScoreChart";
import DailyDecisionChart from "./components/DailyDecisionChart";

const ViewAnalytics = () => {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <LoadingSkeleton variant="page" />
      </div>
    );
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
