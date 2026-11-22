"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { MessageCircle } from "lucide-react"

import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { getFirebaseFirestore } from "@/lib/firebase"
import { hasUnread, mapConversation } from "@/lib/messages-service"

export function MessagesButton() {
  const { user } = useAuth()
  const [unread, setUnread] = useState(false)

  useEffect(() => {
    if (!user) return
    // No orderBy, so this needs no composite index beyond the inbox query's.
    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "conversations"),
        where("participantIds", "array-contains", user.uid)
      ),
      (snapshot) =>
        setUnread(
          snapshot.docs.some((item) =>
            hasUnread(
              mapConversation(item.id, item.data({ serverTimestamps: "estimate" })),
              user.uid
            )
          )
        ),
      () => setUnread(false)
    )
  }, [user])

  if (!user) return null

  return (
    <Button aria-label="Messages" asChild className="relative border-0 shadow-none" size="icon" variant="ghost">
      <Link href="/messages" prefetch={false}>
        <MessageCircle />
        {unread ? (
          <span aria-label="Unread messages" className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
        ) : null}
      </Link>
    </Button>
  )
}
