"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import ChartCard from "@/components/shared/ChartCard";
import type {
  RiskDistributionPoint,
  AssetCategoryPoint,
  ThreatDistributionPoint,
} from "@/types/analytics.types";

interface RiskDistributionChartProps {
  riskDistribution: RiskDistributionPoint[];
  assetsByCategory: AssetCategoryPoint[];
  threatDistribution: ThreatDistributionPoint[];
}

const RISK_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#34d399"];
const ASSET_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f87171", "#a78bfa"];
const THREAT_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a78bfa", "#60a5fa"];

const tooltipStyle = {
  backgroundColor: "#141820",
  border: "1px solid #2d3748",
  borderRadius: "8px",
  fontSize: "12px",
};

const RiskDistributionChart = ({
  riskDistribution,
  assetsByCategory,
  threatDistribution,
}: RiskDistributionChartProps) => {
  return (
    <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
      <ChartCard title="Risk Distribution" subtitle="By severity level">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={riskDistribution}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={70}
              dataKey="value"
            >
              {riskDistribution.map((_, index) => (
                <Cell
                  key={index}
                  fill={RISK_COLORS[index % RISK_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Assets by Category" subtitle="By asset type">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={assetsByCategory}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              dataKey="value"
            >
              {assetsByCategory.map((_, index) => (
                <Cell
                  key={index}
                  fill={ASSET_COLORS[index % ASSET_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Threat Distribution" subtitle="By threat type">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={threatDistribution}
              cx="50%"
              cy="50%"
              innerRadius={0}
              outerRadius={70}
              dataKey="value"
            >
              {threatDistribution.map((_, index) => (
                <Cell
                  key={index}
                  fill={THREAT_COLORS[index % THREAT_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default RiskDistributionChart;
