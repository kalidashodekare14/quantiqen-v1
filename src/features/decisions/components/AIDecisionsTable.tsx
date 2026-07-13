"use client";

import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import type { AIDecisionItem } from "@/types/ai-engine.types";
import { severityStyles } from "@/constants/severity";

interface AIDecisionsTableProps {
  decisions: AIDecisionItem[];
  onRowClick: (decision: AIDecisionItem) => void;
}

function getRiskScoreColor(score: number): string {
  if (score > 80) return "text-destructive";
  if (score >= 60) return "text-chart-3";
  return "text-chart-2";
}

const AIDecisionsTable = ({ decisions, onRowClick }: AIDecisionsTableProps) => {
  if (decisions.length === 0) {
    return (
      <div className="bg-card/80 border-foreground/10 flex flex-col items-center justify-center gap-3 rounded-xl border p-12 backdrop-blur-md">
        <Brain className="text-muted-foreground size-10" />
        <p className="text-muted-foreground text-sm">
          No AI decisions yet. Run analysis to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card/80 border-foreground/10 w-full overflow-x-auto rounded-xl border p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-card-foreground text-base font-semibold lg:text-lg">AI Decisions</h2>
        <span className="bg-chart-5/10 text-chart-5 inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          {decisions.length}
        </span>
      </div>

      <table className="w-full min-w-150">
        <thead>
          <tr className="border-border border-b text-left">
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium tracking-wider uppercase lg:text-sm">
              Finding ID
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium tracking-wider uppercase lg:text-sm">
              Priority
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium tracking-wider uppercase lg:text-sm">
              Risk Score
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium tracking-wider uppercase lg:text-sm">
              Confidence
            </th>
            <th className="text-muted-foreground px-3 py-3 text-xs font-medium tracking-wider uppercase lg:text-sm">
              Timeline
            </th>
          </tr>
        </thead>
        <tbody>
          {decisions.map((decision, index) => (
            <motion.tr
              key={`${decision.finding_id}-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="hover:bg-muted/50 border-border cursor-pointer border-b transition-colors last:border-b-0"
              onClick={() => onRowClick(decision)}
            >
              <td className="text-card-foreground px-3 py-3 text-sm font-medium lg:text-base font-mono">
                {decision.finding_id}
              </td>
              <td className="px-3 py-3">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium lg:text-sm ${
                    severityStyles[decision.priority]
                  }`}
                >
                  {decision.priority}
                </span>
              </td>
              <td className="px-3 py-3">
                <span
                  className={`text-sm font-semibold lg:text-base ${getRiskScoreColor(decision.risk_score)}`}
                >
                  {decision.risk_score}
                </span>
              </td>
              <td className="text-muted-foreground px-3 py-3 text-sm lg:text-base">
                {decision.confidence_score !== undefined
                  ? `${Math.round(decision.confidence_score * 100)}%`
                  : "—"}
              </td>
              <td className="text-muted-foreground px-3 py-3 text-sm lg:text-base">
                {decision.timeline}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AIDecisionsTable;
