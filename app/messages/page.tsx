"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore"

import { useRequireAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFirebaseFirestore } from "@/lib/firebase"
import { hasUnread, mapConversation, otherParticipant } from "@/lib/messages-service"
import type { Conversation } from "@/lib/types"
import { initials } from "@/lib/utils"

export default function MessagesPage() {
  const { user, loading } = useRequireAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "conversations"),
        where("participantIds", "array-contains", user.uid),
        orderBy("lastMessageAt", "desc")
      ),
      (snapshot) =>
        setConversations(
          snapshot.docs.map((item) =>
            mapConversation(item.id, item.data({ serverTimestamps: "estimate" }))
          )
        ),
      (snapshotError) => setError(snapshotError.message)
    )
  }, [user])

  if (loading || !user) return <main className="flex flex-1 items-center justify-center p-8"><p className="text-sm text-muted-foreground">Loading messages...</p></main>

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        <Badge variant="secondary">Inbox</Badge>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">Messages.</h1>
        <p className="mt-4 leading-7 text-muted-foreground">Talk directly with the people you are buying from and selling to.</p>

        <Card className="mt-10 shadow-none"><CardHeader><CardTitle className="font-sans">Conversations</CardTitle><CardDescription>Most recent first.</CardDescription></CardHeader><CardContent className="space-y-1">
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {!error && conversations.length === 0 ? <div className="bg-muted p-8 text-center"><p className="font-medium">No conversations yet</p><p className="mt-1 text-sm text-muted-foreground">Open a gig and contact the seller to start one.</p><Button asChild className="mt-4"><Link href="/gigs">Browse gigs</Link></Button></div> : null}
          {conversations.map((conversation) => {
            const other = otherParticipant(conversation, user.uid)
            const unread = hasUnread(conversation, user.uid)
            return (
              <Link className="flex items-center gap-3 border-b p-3 last:border-0 hover:bg-muted/60" href={`/messages/${conversation.id}`} key={conversation.id}>
                <Avatar size="lg">
                  {other.photoURL ? <AvatarImage alt={other.name} src={other.photoURL} /> : null}
                  <AvatarFallback>{initials(other.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`truncate ${unread ? "font-bold" : "font-medium"}`}>{other.name || "Bachelor user"}</p>
                    {unread ? <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-primary" /> : null}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{conversation.lastMessage || "No messages yet"}</p>
                  {conversation.gigTitle ? <p className="mt-0.5 truncate text-xs text-muted-foreground">About: {conversation.gigTitle}</p> : null}
                </div>
              </Link>
            )
          })}
        </CardContent></Card>
      </div>
    </main>
  )
}
