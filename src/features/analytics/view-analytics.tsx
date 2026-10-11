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
import AnalyticsSkeleton, { ChartSkeleton } from "./components/AnalyticsSkeleton";

const RiskTrendChart = dynamic(() => import("./components/RiskTrendChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const DecisionTrendChart = dynamic(() => import("./components/DecisionTrendChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const ApiUsageChart = dynamic(() => import("./components/ApiUsageChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const RiskDistributionChart = dynamic(() => import("./components/RiskDistributionChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const SecurityScoreChart = dynamic(() => import("./components/SecurityScoreChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
const DailyDecisionChart = dynamic(() => import("./components/DailyDecisionChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

const ViewAnalytics = () => {
  const [days, setDays] = useState(14);
  const { data, isFetching, isError, refetch } = useAnalytics(days);

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

  if (!data) {
    if (isError) {
      return (
        <div className="flex w-full flex-col gap-6">
          <PageHeader
            title="Analytics"
            subtitle="Security insights and trends"
            action={rangeSelector}
          />
          <div className="bg-card/80 border-foreground/10 flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
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
    return <AnalyticsSkeleton />;
  }

  return (
    <div
      className={`flex w-full flex-col gap-6 transition-opacity duration-200 ${
        isFetching ? "opacity-70" : "opacity-100"
      }`}
      aria-busy={isFetching}
    >
      <PageHeader
        title="Analytics"
        subtitle="Security insights and trends"
        action={rangeSelector}
      />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <RiskTrendChart section={data.riskTrend} subtitle={periodLabel} onRetry={refetch} />
        <DecisionTrendChart section={data.decisionTrend} subtitle={periodLabel} onRetry={refetch} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <ApiUsageChart section={data.apiUsage} subtitle={periodLabel} onRetry={refetch} />
        <SecurityScoreChart
          section={data.securityScoreTimeline}
          subtitle={periodLabel}
          onRetry={refetch}
        />
      </div>

      <RiskDistributionChart
        riskSection={data.riskDistribution}
        assetSection={data.assetsByCategory}
        threatSection={data.threatDistribution}
        onRetry={refetch}
      />

      <DailyDecisionChart
        section={data.dailyDecisionCount}
        subtitle={periodLabel}
        onRetry={refetch}
      />
    </div>
  );
};

export default ViewAnalytics;
