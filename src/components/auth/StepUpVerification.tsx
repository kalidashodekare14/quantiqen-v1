"use client";

import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Copy, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import AppButton from "@/components/shared/AppButton";
import { FormError } from "@/components/shared/FormError";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/services/auth.service";
import { tokenManager } from "@/lib/token-manager";
import { getFriendlyError } from "@/utils/errorMessages";
import { cn } from "@/lib/utils";
import type { LoginStepUp } from "@/types/auth.types";

const OTP_LENGTH = 6;

const inputVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.1 * i, duration: 0.3, ease: "easeOut" as const },
  }),
};

interface StepUpVerificationProps {
  stepUpData: LoginStepUp;
}

type Step = "enroll" | "confirm" | "verify";

export const StepUpVerification = ({ stepUpData }: StepUpVerificationProps) => {
  const router = useRouter();
  const { clearAuth } = useAuth();
  const [step, setStep] = useState<Step>(
    stepUpData.mfaEnrollmentRequired ? "enroll" : "verify",
  );
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [enrollData, setEnrollData] = useState<{
    secret: string;
    otpauthUri: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const enrollTriggeredRef = useRef(false);

  const handleEnroll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.stepUpEnroll(stepUpData.stepUpToken);
      setEnrollData({ secret: data.secret, otpauthUri: data.otpauthUri });
      setStep("confirm");
    } catch (err: unknown) {
      const result = getFriendlyError(err);
      if (result.shouldRedirectToLogin) {
        setSessionExpired(true);
        clearAuth();
        setTimeout(() => { router.push("/login"); }, 3000);
        return;
      }
      setError(result.message);
    } finally {
      setLoading(false);
    }
  }, [stepUpData.stepUpToken, clearAuth, router]);

  useEffect(() => {
    if (step === "enroll" && !enrollData && !enrollTriggeredRef.current) {
      enrollTriggeredRef.current = true;
      handleEnroll();
    }
  }, [step, enrollData, handleEnroll]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError("");
    setCodeError(false);

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!data) return;

    const newOtp = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < data.length; i++) {
      newOtp[i] = data[i];
    }
    setOtp(newOtp);
    setError("");
    setCodeError(false);

    const nextIndex = Math.min(data.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleConfirmEnrollment = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setCodeError(true);
      return;
    }

    setLoading(true);
    setError("");
    setCodeError(false);
    try {
      await authApi.stepUpConfirm({ stepUpToken: stepUpData.stepUpToken, code });
      setOtp(Array(OTP_LENGTH).fill(""));
      setStep("verify");
    } catch (err: unknown) {
      const result = getFriendlyError(err);
      if (result.shouldRedirectToLogin) {
        setSessionExpired(true);
        clearAuth();
        setTimeout(() => { router.push("/login"); }, 3000);
        return;
      }
      setError(result.message);
      setCodeError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setCodeError(true);
      return;
    }

    setLoading(true);
    setError("");
    setCodeError(false);
    try {
      const res = await authApi.stepUpVerify({ stepUpToken: stepUpData.stepUpToken, code });
      tokenManager.set(res.accessToken);
      router.push("/dashboard");
    } catch (err: unknown) {
      const result = getFriendlyError(err);
      if (result.shouldRedirectToLogin) {
        setSessionExpired(true);
        clearAuth();
        setTimeout(() => { router.push("/login"); }, 3000);
        return;
      }
      setError(result.message);
      setCodeError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = async () => {
    if (!enrollData) return;
    await navigator.clipboard.writeText(enrollData.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBack = () => {
    clearAuth();
    router.push("/login");
  };

  const handleOtpInput = () => {
    if (step === "confirm") {
      handleConfirmEnrollment();
    } else {
      handleVerify();
    }
  };

  const otpInputBase =
    "border-border bg-background/50 text-chart-5 focus:ring-chart-5/50 size-10 rounded-lg border text-center text-lg font-semibold transition-all duration-200 focus:ring-2 focus:outline-none lg:size-12 lg:text-xl";

  if (sessionExpired) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto w-full max-w-md"
        >
          <div className="bg-card/70 border-border/50 rounded-xl border p-8 shadow-lg backdrop-blur-xl">
            <div className="mb-8 flex flex-col items-center gap-2">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
                className="bg-chart-5/10 border-chart-5/20 mb-2 flex size-12 items-center justify-center rounded-xl border"
              >
                <Shield className="text-chart-5 size-6" />
              </motion.div>
              <h1 className="text-chart-5 text-2xl font-bold">QUANTIQEN</h1>
            </div>
            <div className="text-center">
              <p className="text-destructive mb-2 text-sm lg:text-base">
                Your session has expired.
              </p>
              <p className="text-muted-foreground text-xs lg:text-sm">
                Redirecting to login...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto w-full max-w-md"
      >
        <div className="bg-card/70 border-border/50 rounded-xl border p-8 shadow-lg backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
              className="bg-chart-5/10 border-chart-5/20 mb-2 flex size-12 items-center justify-center rounded-xl border"
            >
              <Shield className="text-chart-5 size-6" />
            </motion.div>
            <h1 className="text-chart-5 text-2xl font-bold">QUANTIQEN</h1>
            <p className="text-muted-foreground text-center text-sm lg:text-base">
              {step === "confirm"
                ? "Enter the code from your authenticator app to confirm enrollment"
                : "Enter the 6-digit code from your authenticator app"}
            </p>
          </div>

          {step === "confirm" && enrollData && (
            <div className="mb-6 flex flex-col items-center gap-3">
              <p className="text-muted-foreground text-center text-xs">
                Scan this QR code with your authenticator app:
              </p>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <QRCodeSVG value={enrollData.otpauthUri} size={160} level="M" />
              </div>
              <p className="text-muted-foreground text-center text-xs">
                or enter this secret manually:
              </p>
              <div className="bg-muted/50 flex items-center justify-center gap-2 rounded-lg px-4 py-3">
                <code className="text-card-foreground select-all font-mono text-sm font-semibold">
                  {enrollData.secret}
                </code>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="text-muted-foreground hover:text-chart-5 transition-colors"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 lg:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={inputVariants}
                initial="hidden"
                animate="visible"
              >
                <input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={cn(otpInputBase, codeError && "border-destructive")}
                />
              </motion.div>
            ))}
          </div>

          {codeError && (
            <p className="text-destructive mt-2 text-center text-xs">
              Please enter the complete 6-digit code
            </p>
          )}

          {error && (
            <div className="mt-4">
              <FormError message={error} className="text-center" />
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <AppButton
              type="button"
              variant="outline"
              size="lg"
              fullWidth
              loading={loading}
              onClick={handleOtpInput}
            >
              {step === "confirm" ? "Confirm Enrollment" : "Verify Code"}
            </AppButton>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={handleBack}
              className="text-muted-foreground hover:text-chart-5 flex items-center gap-1 text-xs transition-colors lg:text-sm"
            >
              <ArrowLeft className="size-3.5 lg:size-4" />
              Back to Login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
