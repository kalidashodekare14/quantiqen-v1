"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Shield } from "lucide-react";
import AppButton from "@/components/shared/AppButton";

export const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setForgotMsg("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }

    localStorage.setItem("token", "fake-jwt-token");
    router.push("/dashboard");
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
              htmlFor="email"
              className="text-card-foreground text-sm font-medium lg:text-base"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:ring-chart-5/50 flex h-10 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:outline-none"
            />
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
                onChange={(e) => setPassword(e.target.value)}
                className="border-border bg-background text-card-foreground placeholder:text-muted-foreground focus:ring-chart-5/50 flex h-10 w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:ring-2 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-card-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <AppButton type="submit" variant="chart" size="lg" fullWidth>
            Sign In
          </AppButton>
        </form>

        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={() => setForgotMsg("Password reset link sent to your email.")}
            className="text-muted-foreground hover:text-chart-5 text-xs transition-colors lg:text-sm"
          >
            Forgot Password?
          </button>
        </div>

        {forgotMsg && (
          <p className="text-chart-2 mt-3 text-center text-sm lg:text-base">{forgotMsg}</p>
        )}
      </div>
    </motion.div>
  );
};
