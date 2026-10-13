"use client";

import { ShieldAlert } from "lucide-react";

interface AccessDeniedProps {
  title?: string;
  description?: string;
}

export const AccessDenied = ({
  title = "You don't have access to this section",
  description = "Your account doesn't have permission to view this page. Contact your administrator if you need access.",
}: AccessDeniedProps) => {
  return (
    <div className="bg-card border-border flex flex-col items-center gap-3 rounded-xl border p-10 text-center">
      <div className="bg-destructive/10 flex size-12 items-center justify-center rounded-full">
        <ShieldAlert className="text-destructive size-6" />
      </div>
      <p className="text-card-foreground text-sm font-semibold">{title}</p>
      <p className="text-muted-foreground max-w-md text-sm">{description}</p>
    </div>
  );
};
