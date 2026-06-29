"use client";

import { useAnalytics } from "./hooks/useAnalytics";
import RiskTrendChart from "./components/RiskTrendChart";
import DecisionTrendChart from "./components/DecisionTrendChart";
import ApiUsageChart from "./components/ApiUsageChart";
import RiskDistributionChart from "./components/RiskDistributionChart";
import SecurityScoreChart from "./components/SecurityScoreChart";
import DailyDecisionChart from "./components/DailyDecisionChart";

const ViewAnalytics = () => {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) return null;
  if (isError) return null;
  if (!data) return null;

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-card-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Security insights and trends
        </p>
      </div>

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
