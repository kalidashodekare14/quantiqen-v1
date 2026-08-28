import { api } from "@/lib/axios";
import type {
  PortalUser,
  CreateUserData,
  UpdateUserData,
  CreateUserResponse,
} from "../types/user-management.types";

export const userManagementService = {
  list: async (): Promise<PortalUser[]> => {
    const res = await api.get("/api/v1/portal/users");
    return res.data.users;
  },

  create: async (data: CreateUserData): Promise<CreateUserResponse> => {
    const res = await api.post("/api/v1/portal/users", data);
    return res.data;
  },

  update: async (userId: string, data: UpdateUserData): Promise<{ user: PortalUser }> => {
    const res = await api.patch(`/api/v1/portal/users/${userId}`, data);
    return res.data;
  },
};
