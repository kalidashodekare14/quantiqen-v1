import { platformApi } from "@/lib/platform-axios";
import type {
  ApiKey,
  ApiKeyWithSecret,
  CreateApiKeyRequest,
  RotateApiKeyResponse,
} from "@/types/platform/api-key.types";

interface DeleteApiKeyResponse {
  success: boolean;
}

export const apiManagementService = {
  list: async (): Promise<ApiKey[]> => {
    const res = await platformApi.get<ApiKey[]>("/api-keys");
    return res.data;
  },

  create: async (body: CreateApiKeyRequest): Promise<ApiKeyWithSecret> => {
    const res = await platformApi.post<ApiKeyWithSecret>("/api-keys", body);
    return res.data;
  },

  rotate: async (id: string): Promise<RotateApiKeyResponse> => {
    const res = await platformApi.post<RotateApiKeyResponse>(`/api-keys/${id}/rotate`);
    return res.data;
  },

  remove: async (id: string): Promise<DeleteApiKeyResponse> => {
    const res = await platformApi.delete<DeleteApiKeyResponse>(`/api-keys/${id}`);
    return res.data;
  },
};
