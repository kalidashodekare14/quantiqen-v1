import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";

export function DashboardHeader() {
  return (
    <PageHeader
      title="Overview"
      description="Enterprise Risk Dashboard"
      actions={<Button>Refresh</Button>}
    />
  );
}
