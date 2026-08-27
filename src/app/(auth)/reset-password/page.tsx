"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react";
import AppButton from "@/components/shared/AppButton";
import { FormError } from "@/components/shared/FormError";
import AppLoading from "@/components/shared/AppLoading";
import { PasswordStrengthChecklist } from "@/components/shared/PasswordStrengthChecklist";
import { authApi } from "@/services/auth.service";
import { getFriendlyError } from "@/utils/errorMessages";
import { cn } from "@/lib/utils";

const inputBase =
  "border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:ring-chart-5/50 flex h-10 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const hasToken = !!token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!hasToken) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    const errors: { newPassword?: string; confirmPassword?: string } = {};
    if (!newPassword.trim()) errors.newPassword = "New password is required";
    if (!confirmPassword.trim()) errors.confirmPassword = "Please confirm your new password";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    if (newPassword !== confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (newPassword.length < 12) {
      setFieldErrors({ newPassword: "Password must be at least 12 characters" });
      return;
    }

    setLoading(true);
    try {
      await authApi.completePasswordReset({ token, newPassword });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
            Set your new password
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-chart-2 mb-2 text-sm lg:text-base">
              Password reset. Please log in with your new password.
            </p>
            <p className="text-muted-foreground text-xs lg:text-sm">
              Redirecting to login...
            </p>
          </motion.div>
        ) : !hasToken ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 text-center"
          >
            <p className="text-destructive text-sm lg:text-base">
              Invalid reset link. Please request a new password reset.
            </p>
            <AppButton
              variant="outline"
              size="md"
              onClick={() => router.push("/forgot-password")}
            >
              Request new reset link
            </AppButton>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="newPassword"
                className="text-card-foreground text-sm font-medium lg:text-base"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password (min 12 characters)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.newPassword}
                  className={cn(inputBase, "pr-10", fieldErrors.newPassword && "border-destructive")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="text-muted-foreground hover:text-card-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.newPassword && (
                <p className="text-destructive text-xs">{fieldErrors.newPassword}</p>
              )}
              <PasswordStrengthChecklist password={newPassword} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-card-foreground text-sm font-medium lg:text-base"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  className={cn(inputBase, "pr-10", fieldErrors.confirmPassword && "border-destructive")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-muted-foreground hover:text-card-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                >
                  {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-destructive text-xs">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {error && <FormError message={error} />}

            <AppButton type="submit" variant="outline" size="lg" fullWidth loading={loading}>
              Reset Password
            </AppButton>
          </form>
        )}

        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-muted-foreground hover:text-chart-5 flex items-center gap-1 text-xs transition-colors lg:text-sm"
          >
            <ArrowLeft className="size-3.5 lg:size-4" />
            Back to Login
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<AppLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
