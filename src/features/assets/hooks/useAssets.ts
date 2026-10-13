"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { assetService } from "../services/asset.service";
import type {
  AssetListParams,
  CreateAssetRelationshipRequest,
  CreateAssetRequest,
  UpdateAssetRequest,
} from "@/types/platform/asset-api.types";

export const useAssets = (params: AssetListParams = {}) => {
  return useQuery({
    queryKey: ["assets", params],
    queryFn: () => assetService.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

export const useAssetDetail = (id?: string) => {
  return useQuery({
    queryKey: ["asset", id],
    queryFn: () => assetService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 30000,
  });
};

export const useAssetRelationships = (id?: string) => {
  return useQuery({
    queryKey: ["asset-relationships", id],
    queryFn: () => assetService.listRelationships(id as string),
    enabled: Boolean(id),
    staleTime: 30000,
  });
};

const useAssetListInvalidation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["asset"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useCreateAsset = () => {
  return useAssetListInvalidation((body: CreateAssetRequest) => assetService.create(body));
};

export const useUpdateAsset = () => {
  return useAssetListInvalidation(({ id, body }: { id: string; body: UpdateAssetRequest }) =>
    assetService.update(id, body),
  );
};

export const useDeleteAsset = () => {
  return useAssetListInvalidation((id: string) => assetService.remove(id));
};

export const useCreateAssetRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateAssetRelationshipRequest }) =>
      assetService.createRelationship(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["asset-relationships", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
    },
  });
};

export const useDeleteAssetRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: { relationshipId: string; assetId: string }) =>
      assetService.deleteRelationship(vars.relationshipId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["asset-relationships", variables.assetId] });
    },
  });
};
