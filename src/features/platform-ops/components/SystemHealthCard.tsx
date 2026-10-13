"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import { fadeInUp } from "@/lib/motion";
import { formatDateTime } from "@/utils/date/date";
import { useSystemHealth } from "@/hooks/use-platform-ops";
import { healthBadgeClass } from "./PlatformStatusCard";

const SystemHealthCard = () => {
  const { data: health, isLoading } = useSystemHealth();

  return (
    <motion.div {...fadeInUp(0.05)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-card-foreground flex items-center gap-2 text-sm font-semibold lg:text-base">
          <Activity className="size-4" />
          System Health
        </h3>
        {health && (
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${healthBadgeClass(health.platformState)}`}
          >
            {health.platformState}
          </span>
        )}
      </div>

      {isLoading || !health ? (
        <p className="text-muted-foreground text-sm">Loading health…</p>
      ) : (
        <div className="flex flex-col gap-4">
          {health.suspensionActive && (
            <div className="border-destructive/30 bg-destructive/10 rounded-lg border p-3">
              <p className="text-card-foreground text-sm font-medium">
                Suspension is active — AI scoring is skipped and findings remain OPEN.
              </p>
            </div>
          )}

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              Providers
            </p>
            <div className="flex flex-col">
              {health.providers.map((provider) => (
                <div
                  key={provider.provider}
                  className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-b-0"
                >
                  <span className="text-card-foreground text-sm">{provider.provider}</span>
                  <span className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{provider.latencyMs}ms</span>
                    <span className="text-muted-foreground">
                      fails: {provider.consecutiveFails}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-medium ${healthBadgeClass(provider.status)}`}
                    >
                      {provider.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wider uppercase">
              Engines
            </p>
            <div className="flex flex-col">
              {health.engines.map((engine) => (
                <div
                  key={engine.engine}
                  className="border-border flex flex-wrap items-center justify-between gap-2 border-b py-2 last:border-b-0"
                >
                  <span className="text-card-foreground text-sm">
                    {engine.engine}
                    {engine.isAuthoritative && (
                      <span className="bg-chart-5/10 text-chart-5 ml-2 rounded-full px-2 py-0.5 text-xs">
                        authoritative
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-3 text-xs">
                    <span className="text-muted-foreground">{engine.latencyMs}ms</span>
                    <span className="text-muted-foreground">fails: {engine.consecutiveFails}</span>
                    <span
                      className={`rounded-full border px-2 py-0.5 font-medium ${healthBadgeClass(engine.status)}`}
                    >
                      {engine.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-muted-foreground text-xs">Checked {formatDateTime(health.timestamp)}</p>
        </div>
      )}
    </motion.div>
  );
};

export default SystemHealthCard;
