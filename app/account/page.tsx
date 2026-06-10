"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CheckCircle2,
  Mail,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react"
import { onAuthStateChanged, signOut, updateProfile, type User } from "firebase/auth"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getFirebaseAuth, getFirebaseStorage } from "@/lib/firebase"

const maxProfilePictureSize = 5 * 1024 * 1024

function getInitials(user: User) {
  if (user.displayName) {
    return user.displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  return user.email?.slice(0, 2).toUpperCase() ?? "U"
}

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState("")
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  useEffect(() => {
    let unsubscribe = () => {}

    try {
      unsubscribe = onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
        setUser(currentUser)
        setPhotoUrl(currentUser?.photoURL ?? null)
        setLoading(false)

        if (!currentUser) {
          router.replace("/")
          window.dispatchEvent(new CustomEvent("open-auth-dialog", { detail: "login" }))
        }
      })
    } catch {
      setLoading(false)
      router.replace("/")
    }

    return unsubscribe
  }, [router])

  async function handleProfilePictureChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file || !user) return

    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file.")
      return
    }

    if (file.size > maxProfilePictureSize) {
      setPhotoError("Choose an image smaller than 5 MB.")
      return
    }

    setPhotoError("")
    setUploadingPhoto(true)

    try {
      const photoRef = ref(getFirebaseStorage(), `profile-pictures/${user.uid}/avatar`)
      await uploadBytes(photoRef, file, { contentType: file.type })
      const downloadUrl = await getDownloadURL(photoRef)
      const nextPhotoUrl = `${downloadUrl}&v=${Date.now()}`
      await updateProfile(user, { photoURL: nextPhotoUrl })
      setPhotoUrl(nextPhotoUrl)
      window.dispatchEvent(new Event("profile-picture-updated"))
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : "Could not update profile picture."
      )
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading || !user) {
    return (
      <main className="flex flex-1 items-center justify-center bg-muted/40 p-6">
        <p className="text-sm text-muted-foreground">Loading account...</p>
      </main>
    )
  }

  const joinedDate = user.metadata.creationTime
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
        new Date(user.metadata.creationTime)
      )
    : "Recently"

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Badge variant="secondary">Account dashboard</Badge>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Welcome, {user.displayName?.split(" ")[0] || "student"}.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Manage your account and keep track of your activity.
            </p>
          </div>
          <Button
            onClick={async () => {
              await signOut(getFirebaseAuth())
              router.replace("/")
            }}
            variant="outline"
          >
            Sign out
          </Button>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[320px_1fr]">
          <Card className="gap-5 shadow-none">
            <CardHeader className="items-center text-center">
              <div className="group/profile-picture relative mx-auto">
                <Avatar className="size-28">
                  {photoUrl ? (
                    <AvatarImage alt={user.displayName || "Profile picture"} src={photoUrl} />
                  ) : null}
                  <AvatarFallback className="text-2xl font-semibold">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <label
                  aria-label="Change profile picture"
                  className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover/profile-picture:opacity-100 focus-within:opacity-100"
                >
                  <Camera className="size-6" />
                  <input
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingPhoto}
                    onChange={handleProfilePictureChange}
                    type="file"
                  />
                </label>
              </div>
              {uploadingPhoto ? (
                <p className="text-sm text-muted-foreground">Uploading...</p>
              ) : null}
              {photoError ? (
                <p className="text-sm text-destructive" role="alert">
                  {photoError}
                </p>
              ) : null}
              <CardTitle className="mt-3 font-sans text-xl">
                {user.displayName || "Bachelor user"}
              </CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="flex items-center gap-3 text-sm">
                <Mail className="size-4 text-muted-foreground" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="size-4 text-muted-foreground" />
                <span>Joined {joinedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ShieldCheck className="size-4 text-muted-foreground" />
                <span>Managed with Firebase Authentication</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Active projects", value: "0", icon: BriefcaseBusiness },
                { label: "Completed gigs", value: "0", icon: CheckCircle2 },
                { label: "Average rating", value: "New", icon: Star },
              ].map(({ icon: Icon, label, value }) => (
                <Card className="gap-3 shadow-none" key={label}>
                  <CardHeader>
                    <Icon className="size-5 text-muted-foreground" />
                    <CardDescription className="mt-3">{label}</CardDescription>
                    <CardTitle className="font-sans text-2xl">{value}</CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="gap-5 shadow-none">
              <CardHeader>
                <CardTitle className="font-sans">Get started</CardTitle>
                <CardDescription>
                  Your account is ready. Explore available opportunities or complete
                  your profile.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Button asChild size="lg">
                  <Link href="/gigs">
                    <BriefcaseBusiness className="size-4" />
                    Browse gigs
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  <UserRound className="size-4" />
                  Complete profile
                </Button>
              </CardContent>
            </Card>

            <Card className="gap-5 shadow-none">
              <CardHeader>
                <CardTitle className="font-sans">Recent activity</CardTitle>
                <CardDescription>Your latest account activity will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-8 text-center">
                  <p className="text-sm font-medium">No activity yet</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Browse gigs to start building your activity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
