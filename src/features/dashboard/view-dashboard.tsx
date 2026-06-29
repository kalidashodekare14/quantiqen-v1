"use client";
import { useDashboard } from "@/hooks/useDashboard";

const ViewDashboard = () => {
  const { data, isLoading } = useDashboard();

  console.log("checking data", data);
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
};

export default ViewDashboard;
