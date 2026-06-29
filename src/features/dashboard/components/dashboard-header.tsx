import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";

export function DashboardHeader() {
  return (
    <PageHeader
      title="Overview"
      description="Enterprise Security Dashboard Overview"
      actions={
        <>
          <select className="h-8 rounded-lg border border-border bg-background px-2.5 text-sm text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>Last 90 Days</option>
            <option>This Year</option>
          </select>

          <Button variant="outline" size="default">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </>
      }
    />
  );
}
