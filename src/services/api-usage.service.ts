import { platformApi } from "@/lib/platform-axios";
import type { ApiUsageRow } from "@/types/platform/analytics-api.types";

export const apiUsageService = {
  getDailyUsage: async (): Promise<ApiUsageRow[]> => {
    const res = await platformApi.get<ApiUsageRow[]>("/analytics/api-usage", {
      params: { period: "day" },
    });
    return res.data;
  },
};
