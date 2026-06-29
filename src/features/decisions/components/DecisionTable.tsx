"use client";

import { motion } from "framer-motion";
import { Table, TableHeader, TableBody, TableHead, TableCell } from "@/components/ui/table";
import type { Decision } from "@/types/decision.types";

interface DecisionTableProps {
  decisions: Decision[];
  onRowClick: (decision: Decision) => void;
}

const statusStyles: Record<string, string> = {
  Pending: "bg-chart-3/10 text-chart-3",
  "In Review": "bg-chart-5/10 text-chart-5",
  Resolved: "bg-chart-2/10 text-chart-2",
};

const severityStyles: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  High: "bg-chart-3/10 text-chart-3",
  Medium: "bg-chart-5/10 text-chart-5",
  Low: "bg-muted text-muted-foreground",
};

function getRelativeTime(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const DecisionTable = ({ decisions, onRowClick }: DecisionTableProps) => {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[900px]">
        <TableHeader>
          <tr>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Decision ID
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Organization
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Asset
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Risk
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Business Impact
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Confidence
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Owner
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Status
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Priority
            </TableHead>
            <TableHead className="text-muted-foreground text-xs font-medium uppercase">
              Time
            </TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {decisions.map((decision, index) => (
            <motion.tr
              key={decision.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
              className="hover:bg-muted/50 cursor-pointer border-b transition-colors"
              onClick={() => onRowClick(decision)}
            >
              <TableCell className="text-card-foreground py-3 pr-2 pl-4 font-medium">
                {decision.id}
              </TableCell>
              <TableCell className="text-card-foreground px-2 py-3">
                {decision.organization}
              </TableCell>
              <TableCell className="text-card-foreground px-2 py-3">{decision.asset}</TableCell>
              <TableCell className="text-card-foreground px-2 py-3">{decision.risk}</TableCell>
              <TableCell className="px-2 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    severityStyles[decision.businessImpact]
                  }`}
                >
                  {decision.businessImpact}
                </span>
              </TableCell>
              <TableCell className="text-card-foreground px-2 py-3">
                {decision.confidence}%
              </TableCell>
              <TableCell className="text-card-foreground px-2 py-3">{decision.owner}</TableCell>
              <TableCell className="px-2 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    statusStyles[decision.status]
                  }`}
                >
                  {decision.status}
                </span>
              </TableCell>
              <TableCell className="px-2 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                    severityStyles[decision.priority]
                  }`}
                >
                  {decision.priority}
                </span>
              </TableCell>
              <TableCell className="text-card-foreground py-3 pr-4 pl-2">
                {getRelativeTime(decision.time)}
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DecisionTable;
