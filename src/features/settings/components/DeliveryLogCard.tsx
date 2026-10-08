"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fadeInUp } from "@/lib/motion";
import { formatDateTime } from "@/utils/date/date";
import type { WebhookDeliveryStatus } from "@/types/platform/notification-api.types";
import { WEBHOOK_DELIVERY_STATUSES } from "@/types/platform/notification-api.types";
import { useWebhookDeliveries } from "../hooks/useNotifications";

const statusStyles: Record<WebhookDeliveryStatus, string> = {
  PENDING: "bg-muted text-muted-foreground border-border",
  DELIVERED: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  FAILED: "bg-destructive/10 text-destructive border-destructive/20",
  RETRYING: "bg-chart-3/10 text-chart-3 border-chart-3/20",
};

const DeliveryLogCard = () => {
  const [status, setStatus] = useState<"ALL" | WebhookDeliveryStatus>("ALL");

  const { data: deliveries, isLoading, refetch, isFetching } = useWebhookDeliveries(
    status !== "ALL" ? status : undefined,
  );

  return (
    <motion.div {...fadeInUp(0.2)} className="bg-card/80 backdrop-blur-md border border-foreground/10 w-full rounded-xl p-5 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-card-foreground text-sm font-semibold lg:text-base">
          Delivery Log
        </h3>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as "ALL" | WebhookDeliveryStatus)}
          >
            <SelectTrigger className="h-9 w-40" aria-label="Filter deliveries by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {WEBHOOK_DELIVERY_STATUSES.map((value) => (
                <SelectItem key={value} value={value}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className="mr-1.5 size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-4 text-center text-sm">Loading deliveries…</p>
      ) : !deliveries || deliveries.length === 0 ? (
        <p className="text-muted-foreground py-4 text-center text-sm">No deliveries found.</p>
      ) : (
        <div className="border-border overflow-x-auto border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-border border-b">
                <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                  Time
                </th>
                <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                  Type
                </th>
                <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                  Status
                </th>
                <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                  HTTP
                </th>
                <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                  Retries
                </th>
                <th className="text-muted-foreground px-2 py-2 text-left text-xs font-medium tracking-wider uppercase">
                  Response
                </th>
              </tr>
            </thead>
            <tbody>
              {deliveries.slice(0, 50).map((delivery) => (
                <tr key={delivery.id} className="border-border border-b last:border-b-0">
                  <td className="text-muted-foreground px-2 py-2 text-xs">
                    {formatDateTime(delivery.createdAt)}
                  </td>
                  <td className="text-card-foreground px-2 py-2 text-xs">
                    {delivery.notificationType.replaceAll("_", " ")}
                  </td>
                  <td className="px-2 py-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[delivery.status]}`}
                    >
                      {delivery.status}
                    </span>
                  </td>
                  <td className="text-card-foreground px-2 py-2 text-xs">
                    {delivery.httpStatusCode}
                  </td>
                  <td className="text-card-foreground px-2 py-2 text-xs">
                    {delivery.retryCount}
                  </td>
                  <td className="text-muted-foreground max-w-48 truncate px-2 py-2 text-xs">
                    {delivery.responseBody || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default DeliveryLogCard;
