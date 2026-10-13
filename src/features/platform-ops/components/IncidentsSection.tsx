"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Siren, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeInUp } from "@/lib/motion";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import {
  INCIDENT_SEVERITIES,
  INCIDENT_STATUSES,
  INCIDENT_TRANSITIONS,
  type IncidentSeverity,
  type IncidentStatus,
} from "@/types/platform/platform-ops.types";
import { useIncidents, useUpdateIncident } from "@/hooks/use-platform-ops";
import IncidentFormDialog from "./IncidentFormDialog";

const severityStyles: Record<IncidentSeverity, string> = {
  CRITICAL: "bg-destructive/10 text-destructive border-destructive/20",
  HIGH: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  MEDIUM: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  LOW: "bg-muted text-muted-foreground border-border",
};

const statusStyles: Record<IncidentStatus, string> = {
  ACTIVE: "bg-destructive/10 text-destructive border-destructive/20",
  INVESTIGATING: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  MONITORING: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  RESOLVED: "bg-chart-2/10 text-chart-2 border-chart-2/20",
};

interface TransitionState {
  incidentId: string;
  target: IncidentStatus;
}

const IncidentsSection = () => {
  const [view, setView] = useState<"active" | "history">("active");
  const [severity, setSeverity] = useState<"ALL" | IncidentSeverity>("ALL");
  const [status, setStatus] = useState<"ALL" | IncidentStatus>("ALL");
  const [createOpen, setCreateOpen] = useState(false);
  const [transition, setTransition] = useState<TransitionState | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const params = {
    ...(view === "history" ? { limit: 50, offset: 0 } : {}),
    ...(severity !== "ALL" ? { severity } : {}),
    ...(status !== "ALL" ? { status } : {}),
  };

  const { data: incidents, isLoading, isError, error, refetch } = useIncidents(params);
  const updateIncident = useUpdateIncident();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleTransitionClick = (incidentId: string, target: IncidentStatus) => {
    if (target === "RESOLVED") {
      setTransition({ incidentId, target });
      setResolutionNotes("");
      return;
    }
    applyTransition(incidentId, target);
  };

  const applyTransition = (incidentId: string, target: IncidentStatus, notes?: string) => {
    updateIncident.mutate(
      {
        id: incidentId,
        body: {
          status: target,
          ...(target === "RESOLVED" && notes ? { resolutionNotes: notes } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success(`Incident moved to ${target}.`);
          setTransition(null);
          setResolutionNotes("");
        },
        onError: handleError,
      },
    );
  };

  const handleConfirmResolve = () => {
    if (!transition) return;
    if (!resolutionNotes.trim()) {
      toast.error("Resolution notes are required to resolve an incident.");
      return;
    }
    applyTransition(transition.incidentId, transition.target, resolutionNotes.trim());
  };

  return (
    <motion.div {...fadeInUp(0.15)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-card-foreground flex items-center gap-2 text-sm font-semibold lg:text-base">
          <Siren className="size-4" />
          Incidents
        </h3>
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 size-4" />
          Declare Incident
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="border-border bg-muted/40 flex rounded-lg border p-0.5">
          {(
            [
              { id: "active", label: "Active" },
              { id: "history", label: "History" },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setView(option.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                view === option.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Severity</span>
          <Select
            value={severity}
            onValueChange={(value) => setSeverity(value as "ALL" | IncidentSeverity)}
          >
            <SelectTrigger className="h-9 w-36" aria-label="Filter incidents by severity">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {INCIDENT_SEVERITIES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground text-xs">Status</span>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "ALL" | IncidentStatus)}
          >
            <SelectTrigger className="h-9 w-44" aria-label="Filter incidents by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All</SelectItem>
              {INCIDENT_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Loading incidents…</p>
      ) : isError ? (
        <QueryErrorState error={error} message="Failed to load incidents." onRetry={refetch} />
      ) : !incidents || incidents.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">
          {view === "active" ? "No active incidents." : "No incidents found."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="border-border hover:border-primary/40 rounded-lg border p-4 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${severityStyles[incident.severity]}`}
                    >
                      {incident.severity}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[incident.status]}`}
                    >
                      {incident.status}
                    </span>
                    {incident.suspensionTriggered && (
                      <span className="bg-chart-3/10 text-chart-3 rounded-full px-2 py-0.5 text-xs font-medium">
                        suspension triggered
                      </span>
                    )}
                  </div>
                  <p className="text-card-foreground text-sm font-semibold">{incident.title}</p>
                  <p className="text-muted-foreground text-sm">{incident.description}</p>
                  <div className="text-muted-foreground flex flex-wrap gap-2 text-xs">
                    <span>Detected {formatDateTime(incident.detectedAt)}</span>
                    {incident.resolvedAt && (
                      <span>Resolved {formatDateTime(incident.resolvedAt)}</span>
                    )}
                    <span>Components: {incident.affectedComponents.join(", ")}</span>
                  </div>
                  {incident.resolutionNotes && (
                    <p className="text-muted-foreground text-xs">
                      Resolution: {incident.resolutionNotes}
                    </p>
                  )}
                </div>
              </div>

              {INCIDENT_TRANSITIONS[incident.status].length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {INCIDENT_TRANSITIONS[incident.status].map((target) => (
                    <Button
                      key={target}
                      size="sm"
                      variant={target === "RESOLVED" ? "outline" : "default"}
                      className="h-7 text-xs"
                      disabled={updateIncident.isPending}
                      onClick={() => handleTransitionClick(incident.id, target)}
                    >
                      Move to {target}
                    </Button>
                  ))}
                </div>
              )}

              {transition?.incidentId === incident.id && (
                <div className="border-chart-3/30 bg-chart-3/10 mt-3 flex flex-col gap-2 rounded-lg border p-3">
                  <Label className="text-sm" htmlFor="resolution-notes">
                    Resolution notes (required)
                  </Label>
                  <Input
                    id="resolution-notes"
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="How was this incident resolved?"
                    maxLength={2000}
                  />
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setTransition(null)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleConfirmResolve} disabled={updateIncident.isPending}>
                      {updateIncident.isPending ? "Resolving…" : "Resolve"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {createOpen && <IncidentFormDialog open onClose={() => setCreateOpen(false)} />}
    </motion.div>
  );
};

export default IncidentsSection;
