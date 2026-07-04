"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFirebaseFirestore } from "@/lib/firebase"
import { deleteGig, mapGig, updateGig } from "@/lib/gigs-service"
import { useSellerGuard } from "@/lib/hooks/use-seller-guard"
import type { Gig } from "@/lib/types"

export default function SellerDashboardPage() {
  const { loading, isSeller, userProfile } = useSellerGuard()
  const [gigs, setGigs] = useState<Gig[]>([])
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({})
  const [error, setError] = useState("")

  useEffect(() => {
    if (!userProfile) return
    return onSnapshot(
      query(collection(getFirebaseFirestore(), "gigs"), where("authorId", "==", userProfile.uid), orderBy("createdAt", "desc")),
      (snapshot) => setGigs(snapshot.docs.map((item) => mapGig(item.id, item.data()))),
      (snapshotError) => setError(snapshotError.message)
    )
  }, [userProfile])

  useEffect(() => {
    Promise.all(
      gigs.map(async (gig) => {
        const snapshot = await getDocs(
          query(collection(getFirebaseFirestore(), "applications"), where("gigId", "==", gig.id))
        )
        return [gig.id, snapshot.size] as const
      })
    ).then((entries) => setApplicationCounts(Object.fromEntries(entries))).catch(() => {})
  }, [gigs])

  const stats = useMemo(() => ({
    active: gigs.filter((gig) => gig.status === "published").length,
    draft: gigs.filter((gig) => gig.status === "draft").length,
    rating: userProfile?.sellerProfile?.rating ?? 0,
    applications: Object.values(applicationCounts).reduce((total, count) => total + count, 0),
  }), [applicationCounts, gigs, userProfile])

  if (loading || !isSeller || !userProfile) return <main className="flex flex-1 items-center justify-center p-8">Checking seller access...</main>

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><Badge variant="secondary">Seller workspace</Badge><h1 className="mt-4 text-4xl font-black tracking-[-0.055em]">Seller Dashboard</h1><p className="mt-3 text-muted-foreground">Welcome back, {userProfile.displayName || "seller"}.</p></div><Button asChild><Link href="/seller/gigs/new"><Plus />New Gig</Link></Button></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-4">{[{ label: "Active gigs", value: stats.active }, { label: "Draft gigs", value: stats.draft }, { label: "Total applications", value: stats.applications }, { label: "Average rating", value: stats.rating || "New" }].map((stat) => <Card className="shadow-none" key={stat.label}><CardHeader><CardDescription>{stat.label}</CardDescription><CardTitle className="font-sans text-2xl">{stat.value}</CardTitle></CardHeader></Card>)}</div>
      <Card className="mt-8 shadow-none"><CardHeader><CardTitle className="font-sans">My Gigs</CardTitle><CardDescription>Manage drafts and published offers.</CardDescription></CardHeader><CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!error && gigs.length === 0 ? <div className="bg-muted p-8 text-center"><p className="font-medium">No gigs yet</p><p className="mt-1 text-sm text-muted-foreground">Create your first draft or published gig.</p></div> : null}
        {gigs.map((gig) => <div className="flex flex-col justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center" key={gig.id}><div><div className="flex flex-wrap gap-3"><Badge>{gig.category}</Badge><Badge variant="secondary">{gig.status}</Badge></div><h2 className="mt-2 font-semibold">{gig.title}</h2><p className="mt-1 text-sm text-muted-foreground">${gig.budget} · {gig.dueDays} days · {applicationCounts[gig.id] ?? 0} applicants</p></div><div className="flex flex-wrap gap-2">{gig.status === "published" ? <Button asChild size="sm" variant="ghost"><Link href={`/gigs/${gig.slug}`}>View</Link></Button> : null}<Button asChild size="sm" variant="outline"><Link href={`/seller/gigs/${gig.id}/edit`}>Edit</Link></Button>{gig.status === "published" ? <Button onClick={() => updateGig(gig.id, { status: "paused" })} size="sm" variant="outline">Pause</Button> : null}<Button onClick={() => { if (confirm("Delete this gig?")) deleteGig(gig.id) }} size="sm" variant="destructive">Delete</Button></div></div>)}
      </CardContent></Card>
    </main>
  )
}
