"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
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
      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="mb-4">
          <h3 className="text-sm lg:text-base font-semibold text-card-foreground">
            Risk Distribution
          </h3>
          <p className="text-xs lg:text-sm text-muted-foreground">By severity level</p>
        </div>

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
      </div>

      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="mb-4">
          <h3 className="text-sm lg:text-base font-semibold text-card-foreground">
            Assets by Category
          </h3>
          <p className="text-xs lg:text-sm text-muted-foreground">By asset type</p>
        </div>

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
      </div>

      <div className="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
        <div className="mb-4">
          <h3 className="text-sm lg:text-base font-semibold text-card-foreground">
            Threat Distribution
          </h3>
          <p className="text-xs lg:text-sm text-muted-foreground">By threat type</p>
        </div>

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
      </div>
    </div>
  );
};

export default RiskDistributionChart;
