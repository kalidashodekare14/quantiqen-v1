import { platformApi } from "@/lib/platform-axios";
import type {
  AssetListParams,
  AssetRelationship,
  CreateAssetRelationshipRequest,
  CreateAssetRequest,
  PlatformAsset,
  UpdateAssetRequest,
} from "@/types/platform/asset-api.types";

function cleanParams(params: AssetListParams): Record<string, string> {
  const query: Record<string, string> = {};
  if (params.assetType) query.assetType = params.assetType;
  if (params.status) query.status = params.status;
  if (params.criticality) query.criticality = params.criticality;
  if (params.environment) query.environment = params.environment;
  return query;
}

export const assetService = {
  list: async (params: AssetListParams = {}): Promise<PlatformAsset[]> => {
    const res = await platformApi.get<PlatformAsset[]>("/assets", { params: cleanParams(params) });
    return res.data;
  },

  getById: async (id: string): Promise<PlatformAsset> => {
    const res = await platformApi.get<PlatformAsset>(`/assets/${id}`);
    return res.data;
  },

  create: async (body: CreateAssetRequest): Promise<PlatformAsset> => {
    const res = await platformApi.post<PlatformAsset>("/assets", body);
    return res.data;
  },

  update: async (id: string, body: UpdateAssetRequest): Promise<PlatformAsset> => {
    const res = await platformApi.patch<PlatformAsset>(`/assets/${id}`, body);
    return res.data;
  },

  remove: async (id: string): Promise<void> => {
    await platformApi.delete(`/assets/${id}`);
  },

  listRelationships: async (id: string): Promise<AssetRelationship[]> => {
    const res = await platformApi.get<AssetRelationship[]>(`/assets/${id}/relationships`);
    return res.data;
  },

  createRelationship: async (
    id: string,
    body: CreateAssetRelationshipRequest,
  ): Promise<AssetRelationship> => {
    const res = await platformApi.post<AssetRelationship>(`/assets/${id}/relationships`, body);
    return res.data;
  },

  deleteRelationship: async (relationshipId: string): Promise<void> => {
    await platformApi.delete(`/assets/relationships/${relationshipId}`);
  },
};
