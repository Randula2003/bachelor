"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"

import { openAuthDialog } from "@/lib/auth-dialog-events"
import { isAbortError } from "@/lib/errors"
import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase"
import type { UserProfile } from "@/lib/types"
import { ensureUserDoc, fetchUserProfile } from "@/lib/users-service"

type AuthState = {
  user: User | null
  /** The user's Firestore profile (role, seller details). Null when signed out. */
  profile: UserProfile | null
  /** True until the current auth state and that user's profile have resolved. */
  loading: boolean
  error: string
  /** Re-reads the profile, e.g. after the user becomes a seller or changes photo. */
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

const notConfiguredError =
  "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local."

/**
 * Single subscription to Firebase Auth for the whole app. Before this, the
 * header, every page and the seller guard each ran their own listener and
 * their own ensureUserDoc + profile read.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState(isFirebaseConfigured ? "" : notConfiguredError)

  useEffect(() => {
    if (!isFirebaseConfigured) return
    const auth = getFirebaseAuth()

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setError("")

      if (!currentUser) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      void (async () => {
        try {
          await ensureUserDoc(currentUser)
          const nextProfile = await fetchUserProfile(currentUser.uid)
          // Ignore a slow response for a user who has since signed out or switched.
          if (auth.currentUser?.uid === currentUser.uid) setProfile(nextProfile)
        } catch (profileError) {
          if (isAbortError(profileError)) return
          console.error(profileError)
          setError(
            profileError instanceof Error ? profileError.message : "Could not load your profile."
          )
        } finally {
          if (auth.currentUser?.uid === currentUser.uid) setLoading(false)
        }
      })()
    })
  }, [])

  const refreshProfile = useCallback(async () => {
    const currentUser = getFirebaseAuth().currentUser
    if (!currentUser) return
    setProfile(await fetchUserProfile(currentUser.uid))
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, error, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>.")
  return context
}

/**
 * For pages that only make sense signed in: once auth has resolved with no
 * user, sends them home and opens the login dialog.
 */
export function useRequireAuth() {
  const auth = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (auth.loading || auth.user) return
    router.replace("/")
    openAuthDialog("login")
  }, [auth.loading, auth.user, router])

  return auth
}
