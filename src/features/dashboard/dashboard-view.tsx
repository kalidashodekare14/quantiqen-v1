import { DashboardHeader, DashboardStats } from "./components";

export function DashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />
      <DashboardStats />
    </div>
  );
}
