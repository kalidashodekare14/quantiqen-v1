"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Clock } from "lucide-react";
import AppButton from "@/components/shared/AppButton";

const OTP_LENGTH = 6;
const MOCK_OTP = "123456";
const RESEND_COOLDOWN = 60;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const inputVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: 0.1 * i, duration: 0.3, ease: "easeOut" as const },
  }),
};

const Otp = () => {
  const router = useRouter();
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    setError("");

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

    const nextIndex = Math.min(data.length, OTP_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    if (code !== MOCK_OTP) {
      setError("Invalid verification code. Please try again.");
      return;
    }

    localStorage.setItem("token", "fake-jwt-token");
    router.push("/dashboard");
  };

  const handleResend = () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    setOtp(Array(OTP_LENGTH).fill(""));
    setError("");
    inputRefs.current[0]?.focus();
  };

  const formatCooldown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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
            <p className="text-muted-foreground text-sm lg:text-base">
              Enter the verification code sent to your email
            </p>
          </div>

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
                  className="border-border bg-background/50 text-card-foreground focus:ring-chart-5/50 size-10 rounded-lg border text-center text-lg font-semibold transition-all duration-200 focus:ring-2 focus:outline-none lg:size-12 lg:text-xl"
                />
              </motion.div>
            ))}
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-destructive mt-4 text-center text-sm"
            >
              {error}
            </motion.p>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <AppButton type="button" variant="outline" size="lg" fullWidth onClick={handleSubmit}>
              Verify Code
            </AppButton>

            <AppButton
              type="button"
              variant="ghost"
              size="md"
              fullWidth
              onClick={handleResend}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? (
                <span className="flex items-center justify-center gap-2">
                  <Clock className="size-4" />
                  Resend in {formatCooldown(cooldown)}
                </span>
              ) : (
                "Resend OTP"
              )}
            </AppButton>
          </div>

          <div className="mt-6 flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                router.push("/login");
              }}
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

export default Otp;
