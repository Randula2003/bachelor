"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"

import { useRequireAuth } from "@/components/auth-provider"
import { MessageUserButton } from "@/components/message-user-button"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFirebaseFirestore } from "@/lib/firebase"
import { mapOrder, orderStatusLabels, updateOrderStatus } from "@/lib/orders-service"
import type { Order } from "@/lib/types"

export default function OrdersPage() {
  const { user, loading } = useRequireAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState("")
  const [actionError, setActionError] = useState("")

  async function changeStatus(id: string, status: Order["status"]) {
    setActionError("")
    try {
      await updateOrderStatus(id, status)
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : "Could not update the order.")
    }
  }

  useEffect(() => {
    if (!user) return
    return onSnapshot(
      query(collection(getFirebaseFirestore(), "orders"), where("buyerId", "==", user.uid), orderBy("createdAt", "desc")),
      (snapshot) => setOrders(snapshot.docs.map((item) => mapOrder(item.id, item.data()))),
      (snapshotError) => setError(snapshotError.message)
    )
  }, [user])

  if (loading || !user) return <main className="flex flex-1 items-center justify-center p-8"><p className="text-sm text-muted-foreground">Loading orders...</p></main>

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-16">
        <Badge variant="secondary">Your purchases</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">My orders.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">Track the gigs you have bought and accept work once it is delivered.</p>

        <Card className="mt-10 shadow-none"><CardHeader><CardTitle className="font-sans">Orders</CardTitle><CardDescription>Newest first.</CardDescription></CardHeader><CardContent className="space-y-4">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {actionError ? <p className="text-sm text-destructive" role="alert">{actionError}</p> : null}
          {!error && orders.length === 0 ? <div className="bg-muted p-8 text-center"><p className="font-medium">No orders yet</p><p className="mt-1 text-sm text-muted-foreground">Browse gigs and buy the one that fits your project.</p><Button asChild className="mt-4"><Link href="/gigs">Browse gigs</Link></Button></div> : null}
          {orders.map((order) => <div className="flex flex-col justify-between gap-4 border-b pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-start" key={order.id}>
            <div className="min-w-0">
              <div className="flex flex-wrap gap-3"><Badge>{orderStatusLabels[order.status]}</Badge>{order.paymentStatus === "pending" ? <Badge variant="outline">Payment pending</Badge> : <Badge variant="secondary">Paid</Badge>}</div>
              <h2 className="mt-2 font-semibold"><Link className="hover:underline" href={`/gigs/${order.gigSlug}`}>{order.gigTitle}</Link></h2>
              <p className="mt-1 text-sm text-muted-foreground">${order.amount} · {order.dueDays} days · {order.sellerName}</p>
              <p className="mt-2 max-w-2xl text-sm whitespace-pre-line">{order.requirements}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {order.status === "delivered" ? <Button onClick={() => changeStatus(order.id, "completed")} size="sm">Accept delivery</Button> : null}
              {order.status === "pending_payment" ? <Button onClick={() => { if (confirm("Cancel this order?")) void changeStatus(order.id, "cancelled") }} size="sm" variant="outline">Cancel</Button> : null}
              <MessageUserButton otherUid={order.sellerId}>Message seller</MessageUserButton>
            </div>
          </div>)}
        </CardContent></Card>
      </div>
    </main>
  )
}
