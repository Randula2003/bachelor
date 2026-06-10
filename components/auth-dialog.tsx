"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { Home, LogOut, Search, UserRound } from "lucide-react"

import { LoginForm, type AuthMode } from "@/components/login-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getFirebaseAuth } from "@/lib/firebase"

const openAuthDialogEvent = "open-auth-dialog"

export function AuthDialogTrigger({
  mode,
  ...props
}: React.ComponentProps<typeof Button> & { mode: AuthMode }) {
  return (
    <Button
      onClick={() =>
        window.dispatchEvent(new CustomEvent(openAuthDialogEvent, { detail: mode }))
      }
      {...props}
    />
  )
}

export function AuthDialog() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>("login")
  const [user, setUser] = useState<User | null>(null)
  const [, setProfilePictureVersion] = useState(0)

  useEffect(() => {
    function handleOpen(event: Event) {
      const nextMode = (event as CustomEvent<AuthMode>).detail
      setMode(nextMode)
      setOpen(true)
    }

    window.addEventListener(openAuthDialogEvent, handleOpen)
    return () => window.removeEventListener(openAuthDialogEvent, handleOpen)
  }, [])

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), setUser)
    } catch {
      return undefined
    }
  }, [])

  useEffect(() => {
    function handleProfilePictureUpdate() {
      setProfilePictureVersion((version) => version + 1)
    }

    window.addEventListener("profile-picture-updated", handleProfilePictureUpdate)
    return () =>
      window.removeEventListener("profile-picture-updated", handleProfilePictureUpdate)
  }, [])

  const isLogin = mode === "login"
  const initials =
    user?.displayName
      ?.split(" ")
      .map((name) => name[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "U"

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label="Open account menu"
              className="size-10 rounded-full p-0"
              variant="ghost"
            >
              <Avatar size="lg">
                {user.photoURL ? (
                  <AvatarImage alt={user.displayName || "Profile picture"} src={user.photoURL} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate font-medium">{user.displayName || "Your account"}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/account">
                  <UserRound />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/gigs">
                  <Search />
                  Browse gigs
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/">
                  <Home />
                  Home
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => signOut(getFirebaseAuth())}
            >
              <LogOut />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <AuthDialogTrigger
            className="hidden sm:inline-flex"
            mode="login"
            variant="ghost"
          >
            Log in
          </AuthDialogTrigger>
          <AuthDialogTrigger mode="signup">Join bachelor</AuthDialogTrigger>
        </>
      )}

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="block h-fit max-h-[calc(100svh-2rem)] max-w-5xl overflow-y-auto border-0 bg-transparent p-0 shadow-none sm:max-w-5xl">
          <DialogTitle className="sr-only">
            {isLogin ? "Login" : "Create an account"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isLogin ? "Login to bachelor" : "Register for bachelor"}
          </DialogDescription>
          <LoginForm
            aria-label={isLogin ? "Login form" : "Registration form"}
            mode={mode}
            onAuthenticated={() => setOpen(false)}
            onModeChange={setMode}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
