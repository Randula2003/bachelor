"use client"

import { useState } from "react"
import Link from "next/link"
import type { User } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { createOrder } from "@/lib/orders-service"
import type { Gig } from "@/lib/types"

export function CheckoutModal({ gig, open, onOpenChange, user }: { gig: Gig; open: boolean; onOpenChange: (open: boolean) => void; user: User }) {
  const [requirements, setRequirements] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [orderId, setOrderId] = useState("")

  async function submit() {
    if (user.uid === gig.authorId) return setError("You cannot buy your own gig.")
    if (requirements.trim().length < 20 || requirements.trim().length > 1000) return setError("Requirements must be between 20 and 1000 characters.")
    setSaving(true)
    setError("")
    try {
      const id = await createOrder(
        gig,
        { uid: user.uid, displayName: user.displayName ?? "", email: user.email ?? "" },
        requirements.trim()
      )
      setOrderId(id)
      setRequirements("")
    } catch (submitError) {
      // The rules re-check price, title and status against the live gig, so a
      // denial almost always means the seller edited or unpublished it meanwhile.
      const denied = (submitError as { code?: string })?.code === "permission-denied"
      setError(
        denied
          ? "This gig changed or is no longer available. Refresh the page and try again."
          : submitError instanceof Error
            ? submitError.message
            : "Could not place order."
      )
    } finally {
      setSaving(false)
    }
  }

  function close() {
    setOrderId("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent>
        {orderId ? (
          <>
            <DialogTitle className="font-sans">Order placed</DialogTitle>
            <DialogDescription>{gig.authorName} can see your order and requirements in their dashboard.</DialogDescription>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Payment is not being collected yet, so the order shows as <strong className="text-foreground">Awaiting payment</strong> until a payment provider is connected. The seller can still start work, and you can cancel any time before they do.</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild><Link href="/orders">View my orders</Link></Button>
                <Button onClick={close} variant="outline">Close</Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogTitle className="font-sans">Buy this gig</DialogTitle>
            <DialogDescription>Tell {gig.authorName.split(" ")[0]} what you need before ordering.</DialogDescription>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-requirements">Your requirements</Label>
                <Textarea id="order-requirements" maxLength={1000} onChange={(event) => setRequirements(event.target.value)} placeholder="Describe the scope, deliverables, and anything the seller needs from you." value={requirements} />
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">{gig.title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{gig.dueDays} days</span></div>
                <div className="flex justify-between font-semibold"><span>Total</span><span>${gig.budget}</span></div>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button className="w-full" disabled={saving} onClick={submit}>{saving ? "Placing order..." : `Place order · $${gig.budget}`}</Button>
              <p className="text-center text-xs text-muted-foreground">No payment is taken at this step.</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
