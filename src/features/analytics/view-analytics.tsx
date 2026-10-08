"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [days, setDays] = useState(14);
  const { data, isLoading, isError, refetch } = useAnalytics(days);

  const periodLabel = `Last ${days} days`;

  const rangeSelector = (
    <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
      <SelectTrigger className="w-40" aria-label="Select time range">
        <SelectValue placeholder="Range" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7">Last 7 days</SelectItem>
        <SelectItem value="14">Last 14 days</SelectItem>
        <SelectItem value="30">Last 30 days</SelectItem>
      </SelectContent>
    </Select>
  );

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title="Analytics"
          subtitle="Security insights and trends"
          action={rangeSelector}
        />
        <div className="bg-card/80 border border-foreground/10 flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-muted-foreground text-sm">
            Unable to load analytics data. Please try again.
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Analytics"
        subtitle="Security insights and trends"
        action={rangeSelector}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <RiskTrendChart data={data.riskTrend} subtitle={periodLabel} />
        <DecisionTrendChart data={data.decisionTrend} subtitle={periodLabel} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ApiUsageChart data={data.apiUsage} subtitle="Last 14 days" />
        <SecurityScoreChart data={data.securityScoreTimeline} subtitle={periodLabel} />
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
