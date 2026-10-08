import { platformApi } from "@/lib/platform-axios";
import type {
  CreateTeamRequest,
  Team,
  TeamDetail,
  TeamMember,
  UpdateTeamRequest,
  UpsertTeamMemberRequest,
} from "@/types/platform/team.types";

export const teamService = {
  list: async (): Promise<Team[]> => {
    const res = await platformApi.get<Team[]>("/teams");
    return res.data;
  },

  getById: async (id: string): Promise<TeamDetail> => {
    const res = await platformApi.get<TeamDetail>(`/teams/${id}`);
    return res.data;
  },

  create: async (body: CreateTeamRequest): Promise<Team> => {
    const res = await platformApi.post<Team>("/teams", body);
    return res.data;
  },

  update: async (id: string, body: UpdateTeamRequest): Promise<Team> => {
    const res = await platformApi.patch<Team>(`/teams/${id}`, body);
    return res.data;
  },

  deactivate: async (id: string): Promise<Team> => {
    const res = await platformApi.delete<Team>(`/teams/${id}`);
    return res.data;
  },

  addMember: async (teamId: string, body: UpsertTeamMemberRequest): Promise<TeamMember> => {
    const res = await platformApi.post<TeamMember>(`/teams/${teamId}/members`, body);
    return res.data;
  },

  removeMember: async (teamId: string, userId: string): Promise<TeamMember> => {
    const res = await platformApi.delete<TeamMember>(`/teams/${teamId}/members/${userId}`);
    return res.data;
  },
};
