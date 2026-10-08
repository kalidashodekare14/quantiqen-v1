"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, UserRound } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/utils/date/date";
import { useRole } from "@/hooks/use-role";
import { useTeams } from "@/hooks/use-teams";
import type { Team } from "@/types/platform/team.types";
import TeamFormDialog from "./components/teams/TeamFormDialog";
import TeamDetailDialog from "./components/teams/TeamDetailDialog";

export const ViewTeams = () => {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: teams, isLoading, isError, refetch } = useTeams();

  const filtered = (teams ?? []).filter((team) =>
    team.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Teams"
        subtitle="Own and route decisions with your teams"
        action={
          isAdmin && (
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Create Team
            </Button>
          )
        }
      />

      <div className="bg-card flex flex-wrap items-center gap-3 rounded-xl p-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams…"
          className="h-9 w-56"
          aria-label="Search teams"
        />
        <span className="text-muted-foreground ml-auto text-sm">{filtered.length} teams</span>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground py-10 text-center text-sm">Loading teams…</div>
      ) : isError ? (
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-destructive text-sm">Failed to load teams.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card flex items-center justify-center rounded-xl p-10">
          <p className="text-muted-foreground text-sm">No teams found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((team) => (
            <div
              key={team.id}
              className="bg-card/80 border-foreground/10 hover:border-primary/40 flex flex-col gap-3 rounded-xl border p-5 backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-card-foreground text-sm font-semibold lg:text-base">
                    {team.name}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 text-sm">
                    {team.description ?? "No description."}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                    team.isActive
                      ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {team.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <UserRound className="size-3.5" />
                  {team._count?.members ?? 0} members
                </span>
                <span title={formatDateTime(team.createdAt)}>
                  Created {formatDateTime(team.createdAt)}
                </span>
              </div>

              <div className="mt-auto flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setDetailId(team.id)}>
                  <Eye className="mr-1.5 size-4" />
                  View
                </Button>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => setEditTeam(team)}>
                    <Pencil className="mr-1.5 size-4" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {createOpen && <TeamFormDialog open onClose={() => setCreateOpen(false)} />}

      {editTeam && (
        <TeamFormDialog team={editTeam} open onClose={() => setEditTeam(null)} />
      )}

      {detailId && (
        <TeamDetailDialog
          teamId={detailId}
          open
          onClose={() => setDetailId(null)}
          onEdit={() => {
            const team = teams?.find((candidate) => candidate.id === detailId);
            if (team) {
              setDetailId(null);
              setEditTeam(team);
            }
          }}
        />
      )}
    </div>
  );
};
