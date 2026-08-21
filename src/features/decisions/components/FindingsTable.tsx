"use client";

import { motion } from "framer-motion";

import type { Finding } from "@/types/finding.types";

interface FindingsTableProps {
  findings: Finding[];
  analyzedIds: string[];
  onRowClick: (finding: Finding) => void;
}

const findingSeverityStyles: Record<string, string> = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-chart-3/10 text-chart-3",
  medium: "bg-chart-5/10 text-chart-5",
  low: "bg-muted text-muted-foreground",
};

const FindingsTable = ({ findings, analyzedIds, onRowClick }: FindingsTableProps) => {
  return (
    <div className="bg-card/80 border-foreground/10 w-full overflow-x-auto rounded-xl border p-5 backdrop-blur-md">
      <table className="w-full min-w-150">
        <thead>
          <tr className="border-border border-b text-left">
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
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium uppercase tracking-wider lg:text-sm">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {findings.map((finding, index) => {
            const isAnalyzed = analyzedIds.includes(finding.id);
            return (
              <motion.tr
                key={finding.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03, duration: 0.3 }}
                className="hover:bg-muted/50 border-border cursor-pointer border-b transition-colors last:border-b-0"
                onClick={() => onRowClick(finding)}
              >
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
                  {isAnalyzed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-chart-2/10 text-chart-2 px-2.5 py-0.5 text-xs font-medium">
                      Analyzed ✓
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-chart-3/10 text-chart-3 px-2.5 py-0.5 text-xs font-medium">
                      Pending
                    </span>
                  )}
                </td>
              </motion.tr>
            );
          })}
          {findings.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="text-muted-foreground px-3 py-8 text-center text-sm"
              >
                No findings to display.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FindingsTable;
