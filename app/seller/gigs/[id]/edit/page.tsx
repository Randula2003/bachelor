"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { GigForm } from "@/components/gig-form"
import { fetchGigById } from "@/lib/gigs-service"
import { isAbortError } from "@/lib/errors"
import { useSellerGuard } from "@/lib/hooks/use-seller-guard"
import type { Gig } from "@/lib/types"

export default function EditGigPage() {
  const { id } = useParams<{ id: string }>()
  const { loading, isSeller, userProfile, error: guardError } = useSellerGuard()
  const [gig, setGig] = useState<Gig | null>(null)
  const [gigLoaded, setGigLoaded] = useState(false)

  useEffect(() => {
    if (loading || !userProfile) return
    fetchGigById(id).then((item) => {
      setGig(item?.authorId === userProfile.uid ? item : null)
      setGigLoaded(true)
    }).catch((error) => {
      if (!isAbortError(error)) console.error(error)
      setGigLoaded(true)
    })
  }, [id, loading, userProfile])

  if (guardError) return <main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">Could not verify seller access.</h1><p className="mt-3 text-muted-foreground">{guardError}</p></main>
  if (loading || (userProfile && !gigLoaded)) return <main className="flex flex-1 items-center justify-center p-8">Loading gig...</main>
  if (!isSeller || !userProfile || !gig) return <main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">You cannot edit this gig.</h1></main>

  return <main className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8"><GigForm existingGig={gig} mode="edit" userProfile={userProfile} /></main>
}
