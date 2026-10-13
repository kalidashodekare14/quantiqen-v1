export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    members: number;
  };
}

export interface TeamMember {
  id: string;
  organizationId: string;
  teamId: string;
  userId: string;
  isLead: boolean;
  createdAt: string;
}

export interface TeamDetail {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  members: TeamMember[];
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpsertTeamMemberRequest {
  userId: string;
  isLead?: boolean;
}
