"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Shield } from "lucide-react"

export const LoginForm = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [forgotMsg, setForgotMsg] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setForgotMsg("")

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required")
      return
    }

    localStorage.setItem("token", "fake-jwt-token")
    router.push("/dashboard")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-card border rounded-xl p-8">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="size-12 rounded-xl bg-chart-5/10 border border-chart-5/20 flex items-center justify-center mb-2">
            <Shield className="size-6 text-chart-5" />
          </div>
          <h1 className="text-2xl font-bold text-chart-5">QUANTIQEN</h1>
          <p className="text-sm text-muted-foreground">
            Security Decision Infrastructure
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-card-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-chart-5/50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-medium text-card-foreground"
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
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 pr-10 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-chart-5/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-lg bg-chart-5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Sign In
          </button>
        </form>

        <div className="flex items-center justify-center mt-4">
          <button
            type="button"
            onClick={() => setForgotMsg("Password reset link sent to your email.")}
            className="text-xs text-muted-foreground hover:text-chart-5 transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        {forgotMsg && (
          <p className="text-sm text-chart-2 text-center mt-3">
            {forgotMsg}
          </p>
        )}
      </div>
    </motion.div>
  )
}
