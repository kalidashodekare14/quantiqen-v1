"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

import ChartPanel from "./ChartPanel";
import { tooltipContentStyle, useChartColors } from "../hooks/useChartColors";
import type {
  AssetCategoryPoint,
  RiskDistributionPoint,
  SectionResult,
  ThreatDistributionPoint,
} from "@/types/analytics.types";

interface RiskDistributionChartProps {
  riskSection: SectionResult<RiskDistributionPoint[]>;
  assetSection: SectionResult<AssetCategoryPoint[]>;
  threatSection: SectionResult<ThreatDistributionPoint[]>;
  onRetry?: () => void;
}

const RiskDistributionChart = ({
  riskSection,
  assetSection,
  threatSection,
  onRetry,
}: RiskDistributionChartProps) => {
  const colors = useChartColors();

  const riskData = riskSection.status === "ok" ? riskSection.data : [];
  const assetData = assetSection.status === "ok" ? assetSection.data : [];
  const threatData = threatSection.status === "ok" ? threatSection.data : [];

  const riskColors = [colors.series[3], colors.series[2], colors.series[4], colors.series[1]];
  const assetColors = [
    colors.series[4],
    colors.series[1],
    colors.series[2],
    colors.series[3],
    colors.series[0],
  ];
  const threatColors = [
    colors.series[3],
    colors.series[2],
    colors.series[4],
    colors.series[0],
    colors.series[1],
  ];

  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
      <ChartPanel
        title="Risk Distribution"
        subtitle="Current snapshot"
        status={riskSection.status}
        isEmpty={riskData.length === 0}
        height={200}
        onRetry={onRetry}
      >
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={riskData} cx="50%" cy="50%" innerRadius={0} outerRadius={70} dataKey="value">
              {riskData.map((_, index) => (
                <Cell key={index} fill={riskColors[index % riskColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipContentStyle(colors)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Assets by Category"
        subtitle="Current snapshot"
        status={assetSection.status}
        isEmpty={assetData.length === 0}
        height={200}
        onRetry={onRetry}
      >
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={assetData}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              dataKey="value"
            >
              {assetData.map((_, index) => (
                <Cell key={index} fill={assetColors[index % assetColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipContentStyle(colors)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>

      <ChartPanel
        title="Threat Distribution"
        subtitle="Current snapshot"
        status={threatSection.status}
        isEmpty={threatData.length === 0}
        height={200}
        onRetry={onRetry}
      >
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={threatData}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={70}
              dataKey="value"
            >
              {threatData.map((_, index) => (
                <Cell key={index} fill={threatColors[index % threatColors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipContentStyle(colors)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartPanel>
    </div>
  );
};

export default RiskDistributionChart;
