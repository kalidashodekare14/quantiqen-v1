"use client";

import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import AppButton from "@/components/shared/AppButton";
import type { ApiKey } from "@/types/api-management.types";
import { formatRelativeTime } from "@/utils/date/date";
import { maskKey } from "@/utils/string/maskKey";
import UsageProgress from "./UsageProgress";

interface ApiKeyCardProps {
  apiKey: ApiKey;
}

type tokenStatus = "Active" | "Expired";

const statusStyles: Record<tokenStatus, string> = {
  Active: "bg-chart-2/10 text-chart-2",
  Expired: "bg-destructive/10 text-destructive",
};

const ApiKeyCard = ({ apiKey }: ApiKeyCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="bg-card ring-foreground/10 flex flex-col gap-4 rounded-xl p-4 ring-1"
    >
      <div className="flex items-center justify-between">
        <span className="text-card-foreground text-sm font-semibold lg:text-base">
          {apiKey.name}
        </span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium lg:text-sm ${
            statusStyles[apiKey.tokenStatus]
          }`}
        >
          {apiKey.tokenStatus}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <code className="bg-muted text-muted-foreground flex-1 truncate rounded-md px-2 py-1 font-mono text-sm lg:text-base">
          {maskKey(apiKey.key)}
        </code>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy API Key"
          className="text-muted-foreground hover:bg-muted hover:text-card-foreground flex size-7 shrink-0 items-center justify-center rounded-md transition-colors"
        >
          {copied ? <Check className="text-chart-2 size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>

      <div className="space-y-3">
        <UsageProgress title="Daily Usage" current={apiKey.dailyUsage} limit={apiKey.dailyLimit} />
        <UsageProgress
          title="Monthly Usage"
          current={apiKey.monthlyUsage}
          limit={apiKey.monthlyLimit}
        />
      </div>

      <div className="flex items-center justify-between text-xs lg:text-sm">
        <div>
          <span className="text-muted-foreground">Remaining: </span>
          <span className="text-chart-5 font-medium">
            {apiKey.remainingRequests.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Last used: </span>
          <span className="text-card-foreground">{formatRelativeTime(apiKey.lastUsed)}</span>
        </div>
      </div>

      <AppButton variant="outline" size="lg" fullWidth>
        Regenerate Key
      </AppButton>
    </motion.div>
  );
};

export default ApiKeyCard;
