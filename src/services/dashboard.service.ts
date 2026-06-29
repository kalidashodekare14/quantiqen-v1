import dashboardData from "@/mock-data/dashboard.json";
import { DashboardData } from "@/types/dashboard.types";

// Feature: write axios base url
export const getDashboard = async () => {
  return dashboardData as unknown as DashboardData;
};
