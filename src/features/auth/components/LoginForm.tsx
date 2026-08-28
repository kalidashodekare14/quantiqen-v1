"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield } from "lucide-react";
import { Turnstile } from "@marsidev/react-turnstile";
import AppButton from "@/components/shared/AppButton";
import { FormError } from "@/components/shared/FormError";
import { useAuth } from "@/lib/auth-context";
import { getFriendlyError } from "@/utils/errorMessages";
import { cn } from "@/lib/utils";

interface FieldErrors {
  orgId?: string;
  userId?: string;
  password?: string;
}

const inputBase =
  "border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:ring-chart-5/50 flex h-10 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none";

export const LoginForm = () => {
  const { login } = useAuth();
  const [orgId, setOrgId] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  console.log('turnstile token', turnstileToken);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileError = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors: FieldErrors = {};
    if (!orgId.trim()) errors.orgId = "Organization ID is required";
    if (!userId.trim()) errors.userId = "User ID is required";
    if (!password.trim()) errors.password = "Password is required";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      await login(orgId.trim(), userId.trim(), password, turnstileToken ?? undefined);
    } catch (err: unknown) {
      const result = getFriendlyError(err);
      setError(result.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mx-auto w-full max-w-md"
    >
      <div className="bg-card rounded-xl border p-8">
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="bg-chart-5/10 border-chart-5/20 mb-2 flex size-12 items-center justify-center rounded-xl border">
            <Shield className="text-chart-5 size-6" />
          </div>
          <h1 className="text-chart-5 text-2xl font-bold">QUANTIQEN</h1>
          <p className="text-muted-foreground text-sm lg:text-base">
            Security Decision Infrastructure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="orgId"
              className="text-card-foreground text-sm font-medium lg:text-base"
            >
              Organization ID
            </label>
            <input
              id="orgId"
              type="text"
              placeholder="Enter your organization ID"
              value={orgId}
              onChange={(e) => {
                setOrgId(e.target.value);
                if (fieldErrors.orgId) setFieldErrors((prev) => ({ ...prev, orgId: undefined }));
              }}
              aria-invalid={!!fieldErrors.orgId}
              className={cn(inputBase, fieldErrors.orgId && "border-destructive")}
            />
            {fieldErrors.orgId && (
              <p className="text-destructive text-xs">{fieldErrors.orgId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="userId"
              className="text-card-foreground text-sm font-medium lg:text-base"
            >
              User ID
            </label>
            <input
              id="userId"
              type="text"
              placeholder="Enter your user ID"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (fieldErrors.userId) setFieldErrors((prev) => ({ ...prev, userId: undefined }));
              }}
              aria-invalid={!!fieldErrors.userId}
              className={cn(inputBase, fieldErrors.userId && "border-destructive")}
            />
            {fieldErrors.userId && (
              <p className="text-destructive text-xs">{fieldErrors.userId}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-card-foreground text-sm font-medium lg:text-base"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={!!fieldErrors.password}
                className={cn(inputBase, "pr-10", fieldErrors.password && "border-destructive")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-card-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-destructive text-xs">{fieldErrors.password}</p>
            )}
          </div>

          <div className="flex justify-center">
            <Turnstile
              siteKey="0x4AAAAAAEMuoLZ7yd1HMd5K"
              onSuccess={handleTurnstileVerify}
              onError={handleTurnstileError}
              options={{ theme: "auto" }}
            />
          </div>

          {error && <FormError message={error} />}

          <AppButton type="submit" variant="outline" size="lg" fullWidth loading={loading}>
            Sign In
          </AppButton>
        </form>
      </div>
    </motion.div>
  );
};
