"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { signOut } from "firebase/auth"
import { Home, LogOut, MessageCircle, Receipt, Search, UserRound } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
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
import { openAuthDialog, openAuthDialogEvent, type AuthMode } from "@/lib/auth-dialog-events"
import { getFirebaseAuth } from "@/lib/firebase"
import { initials } from "@/lib/utils"

export function AuthDialogTrigger({
  mode,
  ...props
}: React.ComponentProps<typeof Button> & { mode: AuthMode }) {
  return <Button onClick={() => openAuthDialog(mode)} {...props} />
}

export function AuthDialog() {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>("login")

  useEffect(() => {
    function handleOpen(event: Event) {
      setMode((event as CustomEvent<AuthMode>).detail)
      setOpen(true)
    }

    window.addEventListener(openAuthDialogEvent, handleOpen)
    return () => window.removeEventListener(openAuthDialogEvent, handleOpen)
  }, [])

  const isLogin = mode === "login"
  // The profile doc is kept in sync with Auth on photo changes and re-read via
  // refreshProfile(), so prefer it: it updates without a reload.
  const photoURL = profile?.photoURL || user?.photoURL || ""

  return (
    <>
      {user ? (
        <>
          {profile?.role === "seller" ? (
            <Button asChild className="hidden md:inline-flex" variant="ghost">
              <Link href="/seller/dashboard" prefetch={false}>Dashboard</Link>
            </Button>
          ) : profile?.role === "buyer" ? (
            <Button asChild className="hidden md:inline-flex" variant="ghost">
              <Link href="/become-seller" prefetch={false}>Start Selling</Link>
            </Button>
          ) : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label="Open account menu"
                className="size-10 rounded-full p-0"
                variant="ghost"
              >
                <Avatar size="lg">
                  {photoURL ? (
                    <AvatarImage alt={user.displayName || "Profile picture"} src={photoURL} />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials(user.displayName, user.email?.[0]?.toUpperCase() || "U")}
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
                  <Link href="/account" prefetch={false}>
                    <UserRound />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" prefetch={false}>
                    <MessageCircle />
                    Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" prefetch={false}>
                    <Receipt />
                    My orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/gigs" prefetch={false}>
                    <Search />
                    Browse gigs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/" prefetch={false}>
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
        </>
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
