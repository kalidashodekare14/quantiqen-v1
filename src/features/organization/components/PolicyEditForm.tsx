"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useUpdatePortalPolicy } from "../hooks/usePolicyManagement";
import type { PortalPolicy, UpdatePolicyData } from "../types/policy-management.types";

interface PolicyEditFormProps {
  policy: PortalPolicy;
  onCancel: () => void;
}

function PolicyEditFields({
  policy,
  onDone,
}: {
  policy: PortalPolicy;
  onDone: () => void;
}) {
  const [denyThreshold, setDenyThreshold] = useState(policy.mfaPolicy.denyThreshold);
  const [stepUpThreshold, setStepUpThreshold] = useState(policy.mfaPolicy.stepUpThreshold);
  const [requireMfaOnLogin, setRequireMfaOnLogin] = useState(
    policy.mfaPolicy.requireMfaOnLogin,
  );
  const [whitelistInput, setWhitelistInput] = useState(policy.ipWhitelist.join(", "));
  const updatePolicy = useUpdatePortalPolicy();

  const handleSubmit = async () => {
    if (denyThreshold < stepUpThreshold) {
      toast.error("Deny threshold must be greater than or equal to step-up threshold");
      return;
    }

    const whitelist = whitelistInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const data: UpdatePolicyData = {
      mfaPolicy: { denyThreshold, stepUpThreshold, requireMfaOnLogin },
      ipWhitelist: whitelist,
    };

    try {
      await updatePolicy.mutateAsync(data);
      toast.success("Policy updated successfully");
      onDone();
    } catch {
      toast.error("Failed to update policy");
    }
  };

  return (
    <div className="bg-card/80 border-foreground/10 rounded-xl border p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold">Edit Policy</h3>
      <div className="mt-4 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="deny-threshold">
            Deny Threshold (80-100)
          </label>
          <Input
            id="deny-threshold"
            type="number"
            min={80}
            max={100}
            value={denyThreshold}
            onChange={(e) => setDenyThreshold(Number(e.target.value))}
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="stepup-threshold">
            Step-Up Threshold (0-80)
          </label>
          <Input
            id="stepup-threshold"
            type="number"
            min={0}
            max={80}
            value={stepUpThreshold}
            onChange={(e) => setStepUpThreshold(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-3">
          <Switch
            id="require-mfa"
            checked={requireMfaOnLogin}
            onCheckedChange={setRequireMfaOnLogin}
          />
          <label className="text-sm font-medium" htmlFor="require-mfa">
            Require MFA on Login
          </label>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium" htmlFor="ip-whitelist">
            IP Whitelist (comma-separated)
          </label>
          <Input
            id="ip-whitelist"
            value={whitelistInput}
            onChange={(e) => setWhitelistInput(e.target.value)}
            placeholder="e.g. 203.0.113.9, 10.0.0.0/8"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <Button onClick={handleSubmit} disabled={updatePolicy.isPending}>
          {updatePolicy.isPending ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export function PolicyEditForm({ policy, onCancel }: PolicyEditFormProps) {
  const formKey = useMemo(() => JSON.stringify(policy), [policy]);

  return <PolicyEditFields key={formKey} policy={policy} onDone={onCancel} />;
}
