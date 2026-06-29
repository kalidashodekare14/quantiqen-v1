"use client"

import { useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthGuardProps {
  children: ReactNode
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.replace("/login")
    }
  }, [router])

  return <>{children}</>
}
