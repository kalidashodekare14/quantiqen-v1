import { DashboardCharts, DashboardHeader, DashboardStats, DashboardStatus } from "./components";

export function DashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />
      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>

        <div>
          <DashboardStatus />
        </div>
      </div>
    </div>
  );
}
