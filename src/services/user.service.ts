import { platformApi } from "@/lib/platform-axios";
import type { PlatformUser } from "@/types/platform/user.types";

export const userService = {
  list: async (): Promise<PlatformUser[]> => {
    const res = await platformApi.get<PlatformUser[]>("/users");
    return res.data;
  },
};
