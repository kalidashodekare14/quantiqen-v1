import { api } from "@/lib/axios";
import type { PortalSession } from "../types/session-management.types";

export const sessionManagementService = {
  list: async (): Promise<PortalSession[]> => {
    const res = await api.get("/api/v1/portal/sessions");
    return res.data.sessions;
  },

  revoke: async (sessionId: string): Promise<{ revoked: boolean }> => {
    const res = await api.post(`/api/v1/portal/sessions/${sessionId}/revoke`);
    return res.data;
  },
};
