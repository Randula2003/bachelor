"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { isAbortError } from "@/lib/errors"
import { SYSTEM_AUTHOR_ID } from "@/lib/gigs-service"
import { openConversation } from "@/lib/messages-service"

/**
 * Opens (or creates) the thread with another user and navigates to it. Used
 * wherever a counterparty is on screen but no conversation may exist yet.
 */
export function MessageUserButton({
  children,
  otherUid,
}: {
  children: React.ReactNode
  otherUid: string
}) {
  const router = useRouter()
  const { user } = useAuth()
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState("")

  if (!user || user.uid === otherUid || otherUid === SYSTEM_AUTHOR_ID) return null

  async function open() {
    if (!user) return
    setOpening(true)
    setError("")
    try {
      router.push(`/messages/${await openConversation(user.uid, otherUid)}`)
    } catch (openError) {
      if (!isAbortError(openError)) console.error(openError)
      setError(openError instanceof Error ? openError.message : "Could not open the conversation.")
      setOpening(false)
    }
  }

  return (
    <Button disabled={opening} onClick={open} size="sm" title={error || undefined} variant="outline">
      <MessageCircle />
      {opening ? "Opening..." : error ? "Try again" : children}
    </Button>
  )
}
