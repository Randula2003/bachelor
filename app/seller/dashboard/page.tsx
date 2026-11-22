"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { Plus } from "lucide-react"

import { MessageUserButton } from "@/components/message-user-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFirebaseFirestore } from "@/lib/firebase"
import { deleteGig, mapGig, updateGig } from "@/lib/gigs-service"
import { mapOrder, orderStatusLabels, updateOrderStatus } from "@/lib/orders-service"
import { useSellerGuard } from "@/lib/hooks/use-seller-guard"
import type { Gig, Order } from "@/lib/types"

const openStatuses: Order["status"][] = ["pending_payment", "in_progress", "delivered"]

export default function SellerDashboardPage() {
  const { loading, isSeller, userProfile, error: guardError } = useSellerGuard()
  const [gigs, setGigs] = useState<Gig[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")

  /** Runs a dashboard action and surfaces failures (e.g. a rules denial) instead of dropping them. */
  async function run(action: () => Promise<void>) {
    setActionError("")
    try {
      await action()
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : "Something went wrong. Try again.")
    }
  }

  useEffect(() => {
    if (!userProfile) return
    return onSnapshot(
      query(collection(getFirebaseFirestore(), "gigs"), where("authorId", "==", userProfile.uid), orderBy("createdAt", "desc")),
      (snapshot) => setGigs(snapshot.docs.map((item) => mapGig(item.id, item.data()))),
      (snapshotError) => setError(snapshotError.message)
    )
  }, [userProfile])

  useEffect(() => {
    if (!userProfile) return
    return onSnapshot(
      query(collection(getFirebaseFirestore(), "orders"), where("sellerId", "==", userProfile.uid), orderBy("createdAt", "desc")),
      (snapshot) => setOrders(snapshot.docs.map((item) => mapOrder(item.id, item.data()))),
      (snapshotError) => setError(snapshotError.message)
    )
  }, [userProfile])

  const orderCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const order of orders) counts[order.gigId] = (counts[order.gigId] ?? 0) + 1
    return counts
  }, [orders])

  const stats = useMemo(() => ({
    active: gigs.filter((gig) => gig.status === "published").length,
    open: orders.filter((order) => openStatuses.includes(order.status)).length,
    completed: orders.filter((order) => order.status === "completed").length,
    rating: userProfile?.sellerProfile?.reviewCount ? userProfile.sellerProfile.rating.toFixed(1) : 0,
  }), [gigs, orders, userProfile])

  if (guardError) return <main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">Could not verify seller access.</h1><p className="mt-3 text-muted-foreground">{guardError}</p><Button asChild className="mt-5"><Link href="/">Back to home</Link></Button></main>
  if (loading || !isSeller || !userProfile) return <main className="flex flex-1 items-center justify-center p-8">Checking seller access...</main>

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><Badge variant="secondary">Seller workspace</Badge><h1 className="mt-4 text-4xl font-black tracking-[-0.055em]">Seller Dashboard</h1><p className="mt-3 text-muted-foreground">Welcome back, {userProfile.displayName || "seller"}.</p></div><Button asChild><Link href="/seller/gigs/new"><Plus />New Gig</Link></Button></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-4">{[{ label: "Active gigs", value: stats.active }, { label: "Open orders", value: stats.open }, { label: "Completed orders", value: stats.completed }, { label: "Average rating", value: stats.rating || "New" }].map((stat) => <Card className="shadow-none" key={stat.label}><CardHeader><CardDescription>{stat.label}</CardDescription><CardTitle className="font-sans text-2xl">{stat.value}</CardTitle></CardHeader></Card>)}</div>

      <Card className="mt-8 shadow-none"><CardHeader><CardTitle className="font-sans">Orders</CardTitle><CardDescription>Work buyers have purchased from you.</CardDescription></CardHeader><CardContent className="space-y-4">
        {actionError ? <p className="text-sm text-destructive" role="alert">{actionError}</p> : null}
        {orders.length === 0 ? <div className="bg-muted p-8 text-center"><p className="font-medium">No orders yet</p><p className="mt-1 text-sm text-muted-foreground">Orders appear here as soon as a buyer purchases one of your gigs.</p></div> : null}
        {orders.map((order) => <div className="flex flex-col justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start" key={order.id}>
          <div className="min-w-0">
            <div className="flex flex-wrap gap-3"><Badge>{orderStatusLabels[order.status]}</Badge>{order.paymentStatus === "pending" ? <Badge variant="outline">Payment pending</Badge> : <Badge variant="secondary">Paid</Badge>}</div>
            <h3 className="mt-2 font-semibold">{order.gigTitle}</h3>
            <p className="mt-1 text-sm text-muted-foreground">${order.amount} · {order.dueDays} days · {order.buyerName || order.buyerEmail}</p>
            <p className="mt-2 max-w-2xl text-sm whitespace-pre-line">{order.requirements}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {order.status === "pending_payment" ? <Button onClick={() => run(() => updateOrderStatus(order.id, "in_progress"))} size="sm">Start work</Button> : null}
            {order.status === "in_progress" ? <Button onClick={() => run(() => updateOrderStatus(order.id, "delivered"))} size="sm">Mark delivered</Button> : null}
            {order.status === "delivered" ? <span className="self-center text-sm text-muted-foreground">Waiting on buyer</span> : null}
            <MessageUserButton otherUid={order.buyerId}>Message buyer</MessageUserButton>
            {order.status === "pending_payment" || order.status === "in_progress" ? <Button onClick={() => { if (confirm("Cancel this order?")) void run(() => updateOrderStatus(order.id, "cancelled")) }} size="sm" variant="outline">Cancel</Button> : null}
          </div>
        </div>)}
      </CardContent></Card>

      <Card className="mt-8 shadow-none"><CardHeader><CardTitle className="font-sans">My Gigs</CardTitle><CardDescription>Manage drafts and published offers.</CardDescription></CardHeader><CardContent className="space-y-4">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!error && gigs.length === 0 ? <div className="bg-muted p-8 text-center"><p className="font-medium">No gigs yet</p><p className="mt-1 text-sm text-muted-foreground">Create your first draft or published gig.</p></div> : null}
        {gigs.map((gig) => <div className="flex flex-col justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center" key={gig.id}><div><div className="flex flex-wrap gap-3"><Badge>{gig.category}</Badge><Badge variant="secondary">{gig.status}</Badge></div><h2 className="mt-2 font-semibold">{gig.title}</h2><p className="mt-1 text-sm text-muted-foreground">${gig.budget} · {gig.dueDays} days · {orderCounts[gig.id] ?? 0} orders</p></div><div className="flex flex-wrap gap-2">{gig.status === "published" ? <Button asChild size="sm" variant="ghost"><Link href={`/gigs/${gig.slug}`}>View</Link></Button> : null}<Button asChild size="sm" variant="outline"><Link href={`/seller/gigs/${gig.id}/edit`}>Edit</Link></Button>{gig.status === "published" ? <Button onClick={() => run(() => updateGig(gig.id, { status: "paused" }))} size="sm" variant="outline">Pause</Button> : null}{gig.status === "paused" ? <Button onClick={() => run(() => updateGig(gig.id, { status: "published" }))} size="sm" variant="outline">Resume</Button> : null}<Button onClick={() => { if (confirm("Delete this gig?")) void run(() => deleteGig(gig.id)) }} size="sm" variant="destructive">Delete</Button></div></div>)}
      </CardContent></Card>
    </main>
  )
}
