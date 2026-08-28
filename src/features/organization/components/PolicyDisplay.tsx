"use client";

import { Badge } from "@/components/ui/badge";
import type { PortalPolicy } from "../types/policy-management.types";

interface PolicyDisplayProps {
  policy: PortalPolicy;
}

export function PolicyDisplay({ policy }: PolicyDisplayProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="bg-card/80 border-foreground/10 rounded-xl border p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold">MFA Policy</h3>
        <div className="mt-4 grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Deny Threshold</span>
            <Badge variant="outline">{policy.mfaPolicy.denyThreshold ?? 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Step-Up Threshold</span>
            <Badge variant="outline">{policy.mfaPolicy.stepUpThreshold ?? 0}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Require MFA on Login</span>
            <Badge variant={policy.mfaPolicy.requireMfaOnLogin ? "default" : "secondary"}>
              {policy.mfaPolicy.requireMfaOnLogin ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="bg-card/80 border-foreground/10 rounded-xl border p-6 backdrop-blur-md">
        <h3 className="text-lg font-semibold">IP Whitelist</h3>
        <div className="mt-4">
          {policy.ipWhitelist.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No IP restrictions configured. All IPs are allowed.
            </p>
          ) : (
            <ul className="space-y-2">
              {policy.ipWhitelist.map((ip) => (
                <li key={ip}>
                  <Badge variant="outline" className="font-mono">
                    {ip}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
