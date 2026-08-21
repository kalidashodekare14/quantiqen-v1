"use client";

import { useAuth } from "@/lib/auth-context";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { ChangePassword } from "@/components/auth/ChangePassword";
import { StepUpVerification } from "@/components/auth/StepUpVerification";

export default function LoginPage() {
  const { pendingScreen, stepUpData } = useAuth();

  if (pendingScreen === "change-password") {
    return <ChangePassword />;
  }

  if (pendingScreen === "step-up" && stepUpData) {
    return <StepUpVerification stepUpData={stepUpData} />;
  }

  return <LoginForm />;
}
