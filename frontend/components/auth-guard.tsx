"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

type AuthGuardProps = {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      // Only redirect if trying to access protected routes
      if (!user && pathname !== "/login" && pathname !== "/") {
        // If not authenticated and trying to access protected route, redirect to login
        router.push("/login")
      } else if (user && pathname === "/login") {
        // If authenticated and on login page, redirect to dashboard
        router.push("/dashboard")
      }
    }
  }, [pathname, router, user, loading])

  // Show nothing while checking authentication
  if (loading) {
    return null
  }

  // If on login page or authenticated, show children
  if (pathname === "/login" || user) {
    return <>{children}</>
  }

  // Otherwise, show nothing (will redirect)
  return null
}

