"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { collection, doc, onSnapshot, orderBy, query } from "firebase/firestore"
import { ArrowLeft, SendHorizontal } from "lucide-react"

import { useRequireAuth } from "@/components/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { getFirebaseFirestore } from "@/lib/firebase"
import {
  hasUnread,
  mapConversation,
  mapMessage,
  markConversationRead,
  otherParticipant,
  sendMessage,
} from "@/lib/messages-service"
import type { Conversation, Message } from "@/lib/types"
import { initials } from "@/lib/utils"

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useRequireAuth()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [conversationLoaded, setConversationLoaded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    return onSnapshot(
      doc(getFirebaseFirestore(), "conversations", id),
      (snapshot) => {
        setConversation(
          snapshot.exists()
            ? mapConversation(snapshot.id, snapshot.data({ serverTimestamps: "estimate" }))
            : null
        )
        setConversationLoaded(true)
      },
      (snapshotError) => {
        setError(snapshotError.message)
        setConversationLoaded(true)
      }
    )
  }, [id, user])

  useEffect(() => {
    if (!user) return
    return onSnapshot(
      query(
        collection(getFirebaseFirestore(), "conversations", id, "messages"),
        orderBy("createdAt", "asc")
      ),
      (snapshot) =>
        setMessages(
          snapshot.docs.map((item) =>
            mapMessage(item.id, item.data({ serverTimestamps: "estimate" }))
          )
        ),
      (snapshotError) => setError(snapshotError.message)
    )
  }, [id, user])

  const unread = conversation && user ? hasUnread(conversation, user.uid) : false

  // Only write a receipt when something is actually unread. Depending on the
  // whole conversation object here would loop: the write lands in the snapshot,
  // which produces a new object, which re-fires the effect, which writes again.
  useEffect(() => {
    if (!user || !unread) return
    void markConversationRead(id, user.uid).catch(() => {})
  }, [id, unread, user])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" })
  }, [messages])

  async function submit() {
    const trimmed = body.trim()
    if (!user || !trimmed) return
    if (trimmed.length > 2000) return setError("Messages are limited to 2000 characters.")
    setSending(true)
    setError("")
    try {
      await sendMessage(id, user.uid, trimmed)
      setBody("")
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Could not send message.")
    } finally {
      setSending(false)
    }
  }

  if (authLoading || !user || !conversationLoaded) return <main className="flex flex-1 items-center justify-center p-8"><p className="text-sm text-muted-foreground">Loading conversation...</p></main>
  if (!conversation) return <main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">Conversation not found.</h1><Button asChild className="mt-5"><Link href="/messages">Back to inbox</Link></Button></main>

  const other = otherParticipant(conversation, user.uid)

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto flex max-w-3xl flex-col px-5 py-8 md:px-8">
        <Button asChild className="self-start" variant="ghost"><Link href="/messages"><ArrowLeft />Inbox</Link></Button>

        <div className="mt-4 flex items-center gap-3">
          <Avatar size="lg">
            {other.photoURL ? <AvatarImage alt={other.name} src={other.photoURL} /> : null}
            <AvatarFallback>{initials(other.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-semibold">{other.name || "Bachelor user"}</p>
            {conversation.gigTitle && conversation.gigSlug ? <Link className="truncate text-sm text-muted-foreground hover:underline" href={`/gigs/${conversation.gigSlug}`}>About: {conversation.gigTitle}</Link> : null}
          </div>
        </div>

        <Card className="mt-6 gap-0 p-0 shadow-none">
          <div className="flex max-h-[60vh] min-h-72 flex-col gap-3 overflow-y-auto p-5">
            {messages.length === 0 ? <p className="m-auto text-sm text-muted-foreground">No messages yet. Say hello.</p> : null}
            {messages.map((message) => {
              const mine = message.senderId === user.uid
              return (
                <div className={`flex ${mine ? "justify-end" : "justify-start"}`} key={message.id}>
                  <div className={`max-w-[75%] px-4 py-2 text-sm whitespace-pre-line ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                    {message.body}
                  </div>
                </div>
              )
            })}
            <div ref={endRef} />
          </div>

          <div className="border-t p-4">
            {error ? <p className="mb-2 text-sm text-destructive">{error}</p> : null}
            <div className="flex items-end gap-2">
              <Textarea
                aria-label="Message"
                className="min-h-11 flex-1 resize-none"
                maxLength={2000}
                onChange={(event) => setBody(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    void submit()
                  }
                }}
                placeholder="Write a message"
                value={body}
              />
              <Button aria-label="Send message" disabled={sending || !body.trim()} onClick={submit} size="icon"><SendHorizontal /></Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Enter to send, Shift+Enter for a new line.</p>
          </div>
        </Card>
      </div>
    </main>
  )
}
