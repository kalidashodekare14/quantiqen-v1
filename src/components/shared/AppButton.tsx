"use client";

import { type ReactNode, type ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const variantMap = {
  primary: "default",
  outline: "outline",
  ghost: "ghost",
  danger: "destructive",
  chart: "default",
} as const;

const variantClasses: Record<string, string> = {
  chart: "bg-chart-5/10 text-chart-5 hover:bg-chart-5/20",
};

const sizeMap = {
  sm: "sm",
  md: "default",
  lg: "lg",
} as const;

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs lg:text-sm",
  md: "px-4 py-2 text-sm lg:text-base",
  lg: "px-5 py-5 text-sm lg:text-base",
} as const;

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger" | "chart";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

const AppButton = ({
  variant = "primary",
  size = "md",
  fullWidth,
  icon,
  loading,
  disabled,
  children,
  className,
  ...props
}: AppButtonProps) => {
  return (
    <Button
      variant={variantMap[variant]}
      size={sizeMap[size]}
      disabled={disabled || loading}
      className={cn(
        "rounded-xl",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : icon}
      {children}
    </Button>
  );
};

export default AppButton;
