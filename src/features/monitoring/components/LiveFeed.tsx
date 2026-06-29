"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Info, CheckCircle, AlertTriangle, AlertOctagon } from "lucide-react";
import type { MonitoringEvent } from "@/types/monitoring.types";

interface LiveFeedProps {
  events: MonitoringEvent[];
}

const severityConfig: Record<string, { icon: typeof Info; color: string }> = {
  info: { icon: Info, color: "text-chart-5" },
  success: { icon: CheckCircle, color: "text-chart-2" },
  warning: { icon: AlertTriangle, color: "text-chart-3" },
  critical: { icon: AlertOctagon, color: "text-destructive" },
};

function getRelativeTime(timestamp: string): string {
  const now = Date.now();
  const date = new Date(timestamp).getTime();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const LiveFeed = ({ events }: LiveFeedProps) => {
  return (
    <div className="bg-card ring-foreground/10 rounded-xl ring-1">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-card-foreground text-sm font-semibold">Live Event Feed</h2>
        <div className="flex items-center gap-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      <div className="max-h-130 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground text-sm">No events yet</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event, index) => {
              const config = severityConfig[event.severity];
              const IconComponent = config.icon;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className="border-border flex items-start gap-3 border-b px-5 py-3 last:border-b-0"
                >
                  <div className="mt-0.5 shrink-0">
                    <IconComponent className={`size-4 ${config.color}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-card-foreground truncate text-xs font-medium">
                      {event.type}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">{event.message}</p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-0.5">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">
                      {getRelativeTime(event.timestamp)}
                    </span>
                    {event.asset && (
                      <span className="text-chart-5 max-w-30 truncate text-xs">{event.asset}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default LiveFeed;
