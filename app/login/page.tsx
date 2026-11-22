"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Covers both a fresh login on this page and arriving here already signed in.
  useEffect(() => {
    if (user) router.replace("/account")
  }, [router, user])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm />
      </div>
    </div>
  )
}
