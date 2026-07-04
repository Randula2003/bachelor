"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"

import { getFirebaseAuth } from "@/lib/firebase"
import { isAbortError } from "@/lib/errors"
import type { UserProfile } from "@/lib/types"
import { ensureUserDoc, fetchUserProfile } from "@/lib/users-service"

export function useSellerGuard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSeller, setIsSeller] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      if (!user) {
        router.replace("/")
        setLoading(false)
        return
      }

      void (async () => {
        try {
          await ensureUserDoc(user)
          const profile = await fetchUserProfile(user.uid)
          const seller = profile?.role === "seller" || profile?.role === "both"
          setUserProfile(profile)
          setIsSeller(seller)
          setLoading(false)

          if (!seller) router.replace("/become-seller")
        } catch (error) {
          if (!isAbortError(error)) console.error(error)
        }
      })()
    })
  }, [router])

  return { loading, isSeller, userProfile }
}
