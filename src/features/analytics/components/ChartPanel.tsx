import { ReactNode } from "react";

import ChartCard from "@/components/shared/ChartCard";
import { Button } from "@/components/ui/button";
import type { SectionStatus } from "@/types/analytics.types";

interface ChartPanelProps {
  title: string;
  subtitle?: string;
  status?: SectionStatus;
  isEmpty?: boolean;
  height?: number;
  onRetry?: () => void;
  children: ReactNode;
}

const ChartPanel = ({
  title,
  subtitle,
  status = "ok",
  isEmpty = false,
  height = 220,
  onRetry,
  children,
}: ChartPanelProps) => {
  let body: ReactNode = children;

  if (status === "error") {
    body = (
      <div
        className="flex flex-col items-center justify-center gap-3 text-center"
        style={{ height }}
      >
        <p className="text-muted-foreground text-sm">Unable to load this chart.</p>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    );
  } else if (isEmpty) {
    body = (
      <div className="flex items-center justify-center text-center" style={{ height }}>
        <p className="text-muted-foreground text-sm">No data available.</p>
      </div>
    );
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {body}
    </ChartCard>
  );
};

export default ChartPanel;
