"use client";

import { useState } from "react";
import { Plus, Pencil, Radar, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import { useRole } from "@/hooks/use-role";
import type {
  ScanPolicyListItem,
  ScanStatus,
} from "@/types/platform/scan-api.types";
import { SCAN_STATUSES } from "@/types/platform/scan-api.types";
import {
  useDeleteScanPolicy,
  useScanJobs,
  useScanPolicies,
  useUpdateScanPolicy,
} from "./hooks/useScans";
import ScanPolicyDialog from "./components/ScanPolicyDialog";
import TriggerScanDialog from "./components/TriggerScanDialog";
import ScanJobDetailDialog from "./components/ScanJobDetailDialog";

type ScanTab = "policies" | "jobs";

const jobStatusStyles: Record<ScanStatus, string> = {
  QUEUED: "bg-muted text-muted-foreground border-border",
  RUNNING: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  COMPLETED: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

const tabs: Array<{ id: ScanTab; label: string }> = [
  { id: "policies", label: "Scan Policies" },
  { id: "jobs", label: "Scan Jobs" },
];

export const ViewScans = () => {
  const [tab, setTab] = useState<ScanTab>("policies");
  const [policyDialog, setPolicyDialog] = useState<
    { mode: "create" } | { mode: "edit"; policy: ScanPolicyListItem } | null
  >(null);
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<"ALL" | ScanStatus>("ALL");
  const [detailJobId, setDetailJobId] = useState<string | null>(null);

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: policies, isLoading: policiesLoading, isError: policiesError, refetch: refetchPolicies } =
    useScanPolicies();
  const { data: jobs, isLoading: jobsLoading, isError: jobsError, refetch: refetchJobs } =
    useScanJobs(jobStatus !== "ALL" ? jobStatus : undefined);

  const updatePolicy = useUpdateScanPolicy();
  const deletePolicy = useDeleteScanPolicy();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleToggleEnabled = (policy: ScanPolicyListItem, enabled: boolean) => {
    updatePolicy.mutate(
      { id: policy.id, body: { enabled } },
      {
        onSuccess: () =>
          toast.success(`Policy ${enabled ? "enabled" : "disabled"}.`),
        onError: handleError,
      },
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deletePolicy.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Scan policy deleted.");
        setDeleteId(null);
      },
      onError: handleError,
    });
  };

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        title="Scans"
        subtitle="Authorized scanning policies, triggers, and job results"
        action={
          isAdmin && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setTriggerOpen(true)}>
                <Radar className="mr-1.5 size-4" />
                Trigger Scan
              </Button>
              <Button size="sm" onClick={() => setPolicyDialog({ mode: "create" })}>
                <Plus className="mr-1.5 size-4" />
                Create Policy
              </Button>
            </div>
          )
        }
      />

      <div className="bg-card flex flex-wrap items-center gap-3 rounded-xl p-3">
        <div className="border-border bg-muted/40 flex rounded-lg border p-0.5">
          {tabs.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTab(option.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                tab === option.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-card-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {tab === "jobs" && (
          <div className="ml-auto flex items-center gap-2">
            <Select
              value={jobStatus}
              onValueChange={(value) => setJobStatus(value as "ALL" | ScanStatus)}
            >
              <SelectTrigger className="h-9 w-44" aria-label="Filter jobs by status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {SCAN_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={() => refetchJobs()}>
              <RefreshCw className="mr-1.5 size-4" />
              Refresh
            </Button>
          </div>
        )}
      </div>

      {tab === "policies" ? (
        policiesLoading ? (
          <div className="text-muted-foreground py-10 text-center text-sm">
            Loading scan policies…
          </div>
        ) : policiesError ? (
          <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-10 text-center">
            <p className="text-destructive text-sm">Failed to load scan policies.</p>
            <Button variant="outline" size="sm" onClick={() => refetchPolicies()}>
              Retry
            </Button>
          </div>
        ) : !policies || policies.length === 0 ? (
          <div className="bg-card flex items-center justify-center rounded-xl p-10">
            <p className="text-muted-foreground text-sm">No scan policies yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {policies.map((policy) => (
              <div
                key={policy.id}
                className="bg-card/80 border-foreground/10 hover:border-primary/40 flex flex-col gap-3 rounded-xl border p-5 backdrop-blur-md transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-card-foreground text-sm font-semibold lg:text-base">
                      {policy.asset.name}
                    </h3>
                    <p className="text-muted-foreground text-xs">{policy.asset.identifier}</p>
                  </div>
                  {isAdmin ? (
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={(checked) => handleToggleEnabled(policy, checked)}
                      disabled={updatePolicy.isPending}
                      aria-label="Toggle policy enabled"
                    />
                  ) : (
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        policy.enabled
                          ? "bg-chart-2/10 text-chart-2 border-chart-2/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {policy.enabled ? "Enabled" : "Disabled"}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {policy.scanTypes.map((scanType) => (
                    <span
                      key={scanType}
                      className="border-border text-muted-foreground rounded-full border px-2 py-0.5 text-xs"
                    >
                      {scanType.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>

                <div className="text-muted-foreground flex flex-wrap gap-3 text-xs">
                  <span>Every {policy.intervalMinutes} min</span>
                  <span title={formatDateTime(policy.createdAt)}>
                    Created {formatDateTime(policy.createdAt)}
                  </span>
                  {policy.lastRunAt && (
                    <span title={formatDateTime(policy.lastRunAt)}>
                      Last run {formatDateTime(policy.lastRunAt)}
                    </span>
                  )}
                  {policy.nextRunAt && (
                    <span title={formatDateTime(policy.nextRunAt)}>
                      Next {formatDateTime(policy.nextRunAt)}
                    </span>
                  )}
                </div>

                {isAdmin && (
                  <div className="mt-auto flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPolicyDialog({ mode: "edit", policy })}
                    >
                      <Pencil className="mr-1.5 size-4" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setDeleteId(policy.id)}>
                      <Trash2 className="mr-1.5 size-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : jobsLoading ? (
        <div className="text-muted-foreground py-10 text-center text-sm">Loading scan jobs…</div>
      ) : jobsError ? (
        <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-10 text-center">
          <p className="text-destructive text-sm">Failed to load scan jobs.</p>
          <Button variant="outline" size="sm" onClick={() => refetchJobs()}>
            Retry
          </Button>
        </div>
      ) : !jobs || jobs.length === 0 ? (
        <div className="bg-card flex items-center justify-center rounded-xl p-10">
          <p className="text-muted-foreground text-sm">No scan jobs found.</p>
        </div>
      ) : (
        <div className="bg-card border-border overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Asset
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Created
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Started
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Completed
                </th>
                <th className="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase">
                  Error
                </th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-border hover:bg-muted/40 cursor-pointer border-b last:border-b-0"
                  onClick={() => setDetailJobId(job.id)}
                >
                  <td className="px-4 py-3">
                    <span className="text-card-foreground block">{job.asset.name}</span>
                    <span className="text-muted-foreground text-xs">{job.asset.identifier}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${jobStatusStyles[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {formatDateTime(job.createdAt)}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {job.startedAt ? formatDateTime(job.startedAt) : "—"}
                  </td>
                  <td className="text-muted-foreground px-4 py-3 text-xs">
                    {job.completedAt ? formatDateTime(job.completedAt) : "—"}
                  </td>
                  <td className="text-muted-foreground max-w-48 truncate px-4 py-3 text-xs">
                    {job.errorMessage ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {policyDialog && (
        <ScanPolicyDialog
          {...(policyDialog.mode === "edit" ? { policy: policyDialog.policy } : {})}
          open
          onClose={() => setPolicyDialog(null)}
        />
      )}

      {triggerOpen && <TriggerScanDialog open onClose={() => setTriggerOpen(false)} />}

      {detailJobId && <ScanJobDetailDialog jobId={detailJobId} onClose={() => setDetailJobId(null)} />}

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scan policy?</AlertDialogTitle>
            <AlertDialogDescription>
              The policy will be soft-deleted. Scheduled runs for this asset stop immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deletePolicy.isPending}>
              {deletePolicy.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
