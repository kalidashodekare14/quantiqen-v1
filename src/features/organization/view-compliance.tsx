"use client";

import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { QueryErrorState } from "@/components/shared/QueryErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/utils/date/date";
import type { ComplianceControl, ControlStatus } from "@/types/platform/compliance-api.types";
import {
  useComplianceControl,
  useComplianceFramework,
  useComplianceFrameworks,
} from "./hooks/useCompliance";

const statusStyles: Record<ControlStatus, string> = {
  MAPPED: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  PARTIAL: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  GAP: "bg-destructive/10 text-destructive border-destructive/20",
  NOT_APPLICABLE: "bg-muted text-muted-foreground border-border",
};

const controlColumns: Column<ComplianceControl>[] = [
  {
    key: "controlId",
    label: "Control",
    render: (row) => <span className="font-mono text-xs">{row.controlId}</span>,
  },
  { key: "controlName", label: "Name" },
  {
    key: "status",
    label: "Status",
    render: (row) => (
      <span
        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[row.status]}`}
      >
        {row.status.replaceAll("_", " ")}
      </span>
    ),
  },
  {
    key: "findingIds",
    label: "Links",
    render: (row) => (
      <span className="text-muted-foreground text-xs">
        {(row.findingIds ?? []).length} findings · {(row.evidenceIds ?? []).length} evidence ·{" "}
        {(row.remediationIds ?? []).length} remediations
      </span>
    ),
  },
  {
    key: "lastAssessedAt",
    label: "Last Assessed",
    render: (row) => (
      <span className="text-muted-foreground text-xs">
        {row.lastAssessedAt ? formatDateTime(row.lastAssessedAt) : "Never"}
      </span>
    ),
  },
  {
    key: "id",
    label: "",
    render: () => <ChevronRight className="text-muted-foreground size-4" />,
  },
];

const ControlDetailDialog = ({ controlId, onClose }: { controlId: string; onClose: () => void }) => {
  const { data: control, isLoading } = useComplianceControl(controlId);

  return (
    <Dialog open onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {control?.controlId ?? "Control"}
            {control && (
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[control.status]}`}
              >
                {control.status.replaceAll("_", " ")}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>{control?.controlName ?? ""}</DialogDescription>
        </DialogHeader>

        {isLoading || !control ? (
          <div className="flex flex-col gap-3 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                Description
              </p>
              <p className="text-card-foreground text-sm whitespace-pre-wrap">
                {control.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground text-xs">Framework</p>
                <p className="text-card-foreground text-sm font-medium">
                  {control.framework
                    ? `${control.framework.framework} (${control.framework.version})`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Last Assessed</p>
                <p className="text-card-foreground text-sm font-medium">
                  {control.lastAssessedAt ? formatDateTime(control.lastAssessedAt) : "Never"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { label: "Linked Findings", ids: control.findingIds ?? [] },
                { label: "Linked Evidence", ids: control.evidenceIds ?? [] },
                { label: "Linked Remediations", ids: control.remediationIds ?? [] },
              ].map((group) => (
                <div key={group.label} className="flex flex-wrap items-center gap-2">
                  <span className="text-muted-foreground w-32 text-xs">{group.label}</span>
                  {group.ids.length === 0 ? (
                    <span className="text-muted-foreground text-xs">None</span>
                  ) : (
                    group.ids.map((id) => (
                      <Badge key={id} variant="outline" className="font-mono text-xs">
                        {id}
                      </Badge>
                    ))
                  )}
                </div>
              ))}
            </div>

            <p className="text-muted-foreground text-xs">
              Updated {formatDateTime(control.updatedAt)}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export const ViewCompliance = () => {
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string | null>(null);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);

  const { data: frameworks, isLoading, isError, error, refetch } = useComplianceFrameworks();
  const { data: framework, isLoading: frameworkLoading } = useComplianceFramework(
    selectedFrameworkId ?? undefined,
  );

  const controls = framework?.controls ?? [];

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-6">
        <PageHeader title="Compliance" subtitle="Frameworks and control coverage" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex w-full flex-col gap-6">
        <PageHeader title="Compliance" subtitle="Frameworks and control coverage" />
        <QueryErrorState
          error={error}
          message="Failed to load compliance frameworks."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (selectedFrameworkId) {
    return (
      <div className="flex w-full flex-col gap-6">
        <PageHeader
          title={framework?.framework ?? "Framework"}
          subtitle={framework?.version ?? ""}
          action={
            <Button variant="outline" size="sm" onClick={() => setSelectedFrameworkId(null)}>
              <ArrowLeft className="mr-1.5 size-4" />
              All Frameworks
            </Button>
          }
        />

        {frameworkLoading || !framework ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : controls.length === 0 ? (
          <div className="bg-card flex items-center justify-center rounded-xl p-10">
            <p className="text-muted-foreground text-sm">No controls found.</p>
          </div>
        ) : (
          <DataTable
            columns={controlColumns}
            data={controls}
            searchable
            searchKeys={["controlId", "controlName"]}
            getRowId={(row) => row.id}
            onRowClick={(row) => setSelectedControlId(row.id)}
          />
        )}

        {selectedControlId && (
          <ControlDetailDialog
            controlId={selectedControlId}
            onClose={() => setSelectedControlId(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader title="Compliance" subtitle="Frameworks and control coverage" />

      {!frameworks || frameworks.length === 0 ? (
        <div className="bg-card flex items-center justify-center rounded-xl p-10">
          <p className="text-muted-foreground text-sm">No compliance frameworks found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {frameworks.map((fw) => (
            <button
              key={fw.id}
              type="button"
              onClick={() => setSelectedFrameworkId(fw.id)}
              className="bg-card/80 border-foreground/10 hover:border-primary/40 flex flex-col gap-2 rounded-xl border p-5 text-left backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-card-foreground text-base font-semibold">
                  {fw.framework.replaceAll("_", " ")}
                </h3>
                <ChevronRight className="text-muted-foreground size-4" />
              </div>
              <p className="text-muted-foreground text-sm">{fw.version}</p>
              <span className="bg-chart-5/10 text-chart-5 mt-1 w-fit rounded-full px-2.5 py-1 text-xs font-medium">
                {fw.controlCount} controls
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
