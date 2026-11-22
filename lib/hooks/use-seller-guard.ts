"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/auth-provider"
import { openAuthDialog } from "@/lib/auth-dialog-events"

export function useSellerGuard() {
  const router = useRouter()
  const { user, profile, loading, error } = useAuth()
  const isSeller = profile?.role === "seller"

  useEffect(() => {
    if (loading || error) return
    if (!user) {
      router.replace("/")
      openAuthDialog("login")
      return
    }
    if (!isSeller) router.replace("/become-seller")
  }, [error, isSeller, loading, router, user])

  return { loading, isSeller, userProfile: profile, error }
}
