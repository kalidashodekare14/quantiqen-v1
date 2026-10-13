"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/utils/date/date";
import { getFriendlyError } from "@/utils/errorMessages";
import { useRole } from "@/hooks/use-role";
import type { PolicyRule } from "@/types/platform/policy-api.types";
import {
  useActivatePolicy,
  useArchivePolicy,
  usePolicyDetail,
  usePolicyVersion,
} from "../../hooks/useGuardrailPolicies";

const statusStyles: Record<string, string> = {
  DRAFT: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  ACTIVE: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  ARCHIVED: "bg-muted text-muted-foreground border-border",
};

interface PolicyDetailDialogProps {
  policyId: string;
  open: boolean;
  onClose: () => void;
}

const RuleRow = ({ rule }: { rule: PolicyRule }) => (
  <div className="border-border flex flex-wrap items-center gap-2 border-b py-2 text-sm last:border-b-0">
    <code className="bg-muted rounded px-1.5 py-0.5 text-xs">{rule.field}</code>
    <span className="text-muted-foreground text-xs">{rule.operator}</span>
    <code className="bg-muted rounded px-1.5 py-0.5 text-xs">
      {Array.isArray(rule.value) ? rule.value.join(", ") : String(rule.value)}
    </code>
    <span className="text-card-foreground text-xs font-medium">
      → {rule.action.replaceAll("_", " ")}
    </span>
    <span className="text-muted-foreground w-full text-xs lg:w-auto lg:flex-1">
      {rule.message}
    </span>
  </div>
);

const PolicyDetailDialog = ({ policyId, open, onClose }: PolicyDetailDialogProps) => {
  const [selectedVersionId, setSelectedVersionId] = useState<string>("latest");
  const [activateOpen, setActivateOpen] = useState(false);
  const [changeReason, setChangeReason] = useState("");

  const { hasAnyRole } = useRole();
  const isAdmin = hasAnyRole(["CUSTOMER_ADMIN"]);

  const { data: policy, isLoading } = usePolicyDetail(open ? policyId : undefined);
  const { data: selectedVersion } = usePolicyVersion(
    policyId,
    selectedVersionId !== "latest" ? selectedVersionId : undefined,
  );
  const activatePolicy = useActivatePolicy();
  const archivePolicy = useArchivePolicy();

  const handleError = (error: unknown) => toast.error(getFriendlyError(error).message);

  const handleActivate = () => {
    activatePolicy.mutate(
      { id: policyId, changeReason: changeReason.trim() || undefined },
      {
        onSuccess: (version) => {
          toast.success(`Policy activated — version ${version.versionNumber} created.`);
          setActivateOpen(false);
          setChangeReason("");
          setSelectedVersionId("latest");
        },
        onError: handleError,
      },
    );
  };

  const handleArchive = () => {
    archivePolicy.mutate(policyId, {
      onSuccess: () => {
        toast.success("Policy archived.");
        onClose();
      },
      onError: handleError,
    });
  };

  const snapshot = selectedVersionId === "latest" ? policy?.rules : selectedVersion?.rulesSnapshot;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            {policy?.name ?? "Policy"}
            {policy && (
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[policy.status]}`}
              >
                {policy.status}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>{policy?.description ?? ""}</DialogDescription>
        </DialogHeader>

        {isLoading || !policy ? (
          <p className="text-muted-foreground py-4 text-center text-sm">Loading policy…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{policy.policyType.replaceAll("_", " ")}</Badge>
              <Badge variant="outline">{policy.severity}</Badge>
              <Badge variant="outline">{policy.rules.length} rules</Badge>
              {policy._count && (
                <Badge variant="outline">{policy._count.evaluations} evaluations</Badge>
              )}
            </div>

            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wider uppercase">
                {selectedVersionId === "latest"
                  ? "Current Rules"
                  : `Version Snapshot (v${selectedVersion?.versionNumber ?? "…"})`}
              </p>
              {snapshot?.length ? (
                snapshot.map((rule, index) => <RuleRow key={index} rule={rule} />)
              ) : (
                <p className="text-muted-foreground text-sm">No rules.</p>
              )}
              {selectedVersionId !== "latest" && selectedVersion?.changeReason && (
                <p className="text-muted-foreground mt-2 text-xs">
                  Change reason: {selectedVersion.changeReason}
                </p>
              )}
            </div>

            <div>
              <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
                Version History
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedVersionId === "latest" ? "default" : "outline"}
                    onClick={() => setSelectedVersionId("latest")}
                  >
                    Current
                  </Button>
                  {(policy.versions ?? []).map((version) => (
                    <Button
                      key={version.id}
                      size="sm"
                      variant={selectedVersionId === version.id ? "default" : "outline"}
                      onClick={() => setSelectedVersionId(version.id)}
                    >
                      v{version.versionNumber}
                    </Button>
                  ))}
                </div>
                {(policy.versions ?? []).map((version) => (
                  <p key={version.id} className="text-muted-foreground text-xs">
                    v{version.versionNumber} · {formatDateTime(version.createdAt)}
                    {version.changeReason ? ` — ${version.changeReason}` : ""}
                  </p>
                ))}
                {(policy.versions ?? []).length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    No versions yet. Activate to create the first version snapshot.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isAdmin && policy && (
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            {policy.status !== "ARCHIVED" && (
              <>
                {!activateOpen ? (
                  <Button variant="outline" onClick={() => setActivateOpen(true)}>
                    Activate (create version)
                  </Button>
                ) : (
                  <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={changeReason}
                      onChange={(e) => setChangeReason(e.target.value)}
                      placeholder="Change reason (optional)"
                      className="h-9 flex-1"
                      maxLength={2000}
                    />
                    <Button
                      size="sm"
                      onClick={handleActivate}
                      disabled={activatePolicy.isPending}
                    >
                      {activatePolicy.isPending ? "Activating…" : "Confirm"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setActivateOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
                <Button
                  variant="destructive"
                  onClick={handleArchive}
                  disabled={archivePolicy.isPending}
                >
                  {archivePolicy.isPending ? "Archiving…" : "Archive"}
                </Button>
              </>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PolicyDetailDialog;
