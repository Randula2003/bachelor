"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth"

import { useAuth } from "@/components/auth-provider"
import type { AuthMode } from "@/lib/auth-dialog-events"
import { getFirebaseAuth } from "@/lib/firebase"
import { ensureUserDoc } from "@/lib/users-service"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export type { AuthMode }

export function LoginForm({
  className,
  mode = "login",
  onAuthenticated,
  onModeChange,
  ...props
}: React.ComponentProps<"div"> & {
  mode?: AuthMode
  onAuthenticated?: () => void
  onModeChange?: (mode: AuthMode) => void
}) {
  const isLogin = mode === "login"
  const { refreshProfile } = useAuth()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const [loading, setLoading] = useState(false)

  function getErrorMessage(error: unknown) {
    if (!(error instanceof Error)) return "Authentication failed. Please try again."

    const messages: Record<string, string> = {
      "auth/account-exists-with-different-credential":
        "An account already exists with this email using another sign-in method.",
      "auth/email-already-in-use": "An account already exists with this email.",
      "auth/invalid-credential": "The email or password is incorrect.",
      "auth/invalid-email": "Enter a valid email address.",
      "auth/missing-email": "Enter your email address first.",
      "auth/popup-closed-by-user": "The sign-in popup was closed before completion.",
      "auth/weak-password": "Use a password with at least six characters.",
    }

    const code = "code" in error ? String(error.code) : ""
    return messages[code] ?? error.message
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setNotice("")
    setLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      const email = String(formData.get("email") ?? "")
      const password = String(formData.get("password") ?? "")
      const auth = getFirebaseAuth()

      if (isLogin) {
        const credential = await signInWithEmailAndPassword(auth, email, password)
        await ensureUserDoc(credential.user)
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        const name = String(formData.get("name") ?? "").trim()
        if (name) await updateProfile(credential.user, { displayName: name })
        // Copies the name onto the profile doc the auth listener already created.
        await ensureUserDoc(credential.user)
        await refreshProfile()
      }

      onAuthenticated?.()
    } catch (authError) {
      setError(getErrorMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordReset() {
    const email = String(new FormData(formRef.current ?? undefined).get("email") ?? "").trim()
    setError("")
    setNotice("")
    if (!email) return setError("Enter your email address first.")

    setLoading(true)
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email)
      setNotice(`If an account exists for ${email}, a password reset link is on its way.`)
    } catch (resetError) {
      setError(getErrorMessage(resetError))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError("")
    setNotice("")
    setLoading(true)

    try {
      const credential = await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider())
      await ensureUserDoc(credential.user)
      onAuthenticated?.()
    } catch (authError) {
      setError(getErrorMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-[minmax(0,0.9fr)_minmax(22rem,1.1fr)]">
          <div className="relative hidden min-h-[34rem] bg-muted md:block">
            <Image
              alt="Students collaborating"
              className="object-cover"
              fill
              sizes="(min-width: 768px) 45vw, 0px"
              src="/hero.jpg"
            />
          </div>
          <form
            className="p-6 sm:p-8 md:flex md:items-center md:px-10 md:py-12"
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <FieldGroup className="mx-auto max-w-md gap-6 *:data-[slot=field]:gap-2">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">
                  {isLogin ? "Welcome back" : "Join bachelor"}
                </h1>
                <p className="text-balance text-muted-foreground">
                  {isLogin
                    ? "Login to your bachelor account"
                    : "Create your bachelor account"}
                </p>
              </div>
              {!isLogin && (
                <Field>
                  <FieldLabel htmlFor="name">Full name</FieldLabel>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  {isLogin && (
                    <button
                      className="ml-auto text-sm underline-offset-2 hover:underline disabled:opacity-50"
                      disabled={loading}
                      onClick={handlePasswordReset}
                      type="button"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>
                <Input id="password" name="password" type="password" required />
              </Field>
              {notice && (
                <FieldDescription role="status">{notice}</FieldDescription>
              )}
              {error && (
                <FieldDescription className="text-destructive" role="alert">
                  {error}
                </FieldDescription>
              )}
              <Field>
                <Button disabled={loading} type="submit">
                  {loading ? "Please wait..." : isLogin ? "Login" : "Create account"}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <Button
                  disabled={loading}
                  onClick={handleGoogleLogin}
                  variant="outline"
                  type="button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </Field>
              <FieldDescription className="text-center">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  className="underline underline-offset-4"
                  onClick={() => onModeChange?.(isLogin ? "signup" : "login")}
                  type="button"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
