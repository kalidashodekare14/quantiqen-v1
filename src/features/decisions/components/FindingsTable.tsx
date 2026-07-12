"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import AppButton from "@/components/shared/AppButton";
import type { Finding } from "@/types/finding.types";

interface FindingsTableProps {
  findings: Finding[];
  onAnalyzeSingle: (finding: Finding) => void;
  isAnalyzing: boolean;
}

const findingSeverityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-chart-3/10 text-chart-3",
  medium: "bg-chart-5/10 text-chart-5",
  low: "bg-muted text-muted-foreground",
};

const FindingsTable = ({ findings, onAnalyzeSingle, isAnalyzing }: FindingsTableProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleAll = () => {
    if (selectedIds.length === findings.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(findings.map((f) => f.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  return (
    <div className="bg-card/80 border-foreground/10 w-full overflow-x-auto rounded-xl border p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-card-foreground text-base font-semibold lg:text-lg">
          Findings — Pending Analysis
        </h2>
        <span className="bg-chart-5/10 text-chart-5 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          {findings.length}
        </span>
      </div>

      <table className="w-full min-w-150">
        <thead>
          <tr className="border-border border-b text-left">
            <th className="w-10 px-3 py-3">
              <input
                type="checkbox"
                checked={findings.length > 0 && selectedIds.length === findings.length}
                onChange={toggleAll}
                className="border-muted-foreground/30 size-4 cursor-pointer rounded border bg-transparent accent-chart-5"
              />
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium uppercase tracking-wider lg:text-sm">
              Title
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium uppercase tracking-wider lg:text-sm">
              Severity
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium uppercase tracking-wider lg:text-sm">
              Asset
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium uppercase tracking-wider lg:text-sm">
              Owner
            </th>
            <th className="w-28 px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {findings.map((finding, index) => (
            <motion.tr
              key={finding.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="hover:bg-muted/50 border-border border-b transition-colors last:border-b-0"
            >
              <td className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(finding.id)}
                  onChange={() => toggleOne(finding.id)}
                  className="border-muted-foreground/30 size-4 cursor-pointer rounded border bg-transparent accent-chart-5"
                />
              </td>
              <td className="text-card-foreground px-3 py-3 text-sm font-medium lg:text-base">
                {finding.title}
              </td>
              <td className="px-3 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                    findingSeverityStyles[finding.severity]
                  }`}
                >
                  {finding.severity}
                </span>
              </td>
              <td className="text-muted-foreground px-3 py-3 text-sm lg:text-base">
                {finding.affected_asset}
              </td>
              <td className="text-muted-foreground px-3 py-3 text-sm lg:text-base">
                {finding.owner}
              </td>
              <td className="px-3 py-3">
                <AppButton
                  variant="outline"
                  size="sm"
                  disabled={isAnalyzing}
                  loading={isAnalyzing}
                  onClick={() => onAnalyzeSingle(finding)}
                  className="whitespace-nowrap"
                >
                  Analyze
                </AppButton>
              </td>
            </motion.tr>
          ))}
          {findings.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="text-muted-foreground px-3 py-8 text-center text-sm"
              >
                No findings to analyze.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FindingsTable;
