"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { teamService } from "@/services/team.service";
import type {
  CreateTeamRequest,
  Team,
  UpdateTeamRequest,
  UpsertTeamMemberRequest,
} from "@/types/platform/team.types";

export const useTeams = () => {
  return useQuery<Team[]>({
    queryKey: ["platform-teams"],
    queryFn: teamService.list,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useTeamDetail = (id?: string) => {
  return useQuery({
    queryKey: ["team", id],
    queryFn: () => teamService.getById(id as string),
    enabled: Boolean(id),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
};

const useTeamInvalidation = <TVariables, TData>(
  mutationFn: (variables: TVariables) => Promise<TData>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platform-teams"] });
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });
};

export const useCreateTeam = () => {
  return useTeamInvalidation((body: CreateTeamRequest) => teamService.create(body));
};

export const useUpdateTeam = () => {
  return useTeamInvalidation(({ id, body }: { id: string; body: UpdateTeamRequest }) =>
    teamService.update(id, body),
  );
};

export const useDeactivateTeam = () => {
  return useTeamInvalidation((id: string) => teamService.deactivate(id));
};

export const useAddTeamMember = () => {
  return useTeamInvalidation(({ teamId, body }: { teamId: string; body: UpsertTeamMemberRequest }) =>
    teamService.addMember(teamId, body),
  );
};

export const useRemoveTeamMember = () => {
  return useTeamInvalidation(({ teamId, userId }: { teamId: string; userId: string }) =>
    teamService.removeMember(teamId, userId),
  );
};
