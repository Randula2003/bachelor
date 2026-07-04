"use client"

import { useState } from "react"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import type { User } from "firebase/auth"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getFirebaseFirestore } from "@/lib/firebase"
import type { Gig } from "@/lib/types"

export function ApplicationModal({ gig, open, onOpenChange, user }: { gig: Gig; open: boolean; onOpenChange: (open: boolean) => void; user: User }) {
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function submit() {
    if (user.uid === gig.authorId) return setError("You cannot apply to your own gig.")
    if (message.trim().length < 20 || message.trim().length > 1000) return setError("Message must be between 20 and 1000 characters.")
    setSaving(true)
    setError("")
    try {
      await addDoc(collection(getFirebaseFirestore(), "applications"), {
        gigId: gig.id,
        applicantId: user.uid,
        applicantName: user.displayName ?? "",
        applicantEmail: user.email ?? "",
        message: message.trim(),
        status: "pending",
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
      setMessage("")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not send application.")
    } finally {
      setSaving(false)
    }
  }

  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent><DialogTitle className="font-sans">Apply to this gig</DialogTitle><DialogDescription>Tell the seller why you are a strong fit.</DialogDescription>{success ? <div className="space-y-4"><p>Your application was sent successfully.</p><Button onClick={() => { setSuccess(false); onOpenChange(false) }}>Close</Button></div> : <div className="space-y-4"><div className="space-y-2"><Label htmlFor="application-message">Message</Label><Textarea id="application-message" maxLength={1000} onChange={(event) => setMessage(event.target.value)} value={message} /></div>{error ? <p className="text-sm text-destructive">{error}</p> : null}<Button disabled={saving} onClick={submit}>{saving ? "Sending..." : "Send application"}</Button></div>}</DialogContent></Dialog>
}
