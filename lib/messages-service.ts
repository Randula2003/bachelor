import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
} from "firebase/firestore"

import { getFirebaseFirestore } from "@/lib/firebase"
import { toDate } from "@/lib/firestore-utils"
import { SYSTEM_AUTHOR_ID } from "@/lib/gigs-service"
import type { Conversation, ConversationParticipant, Gig, Message } from "@/lib/types"
import { fetchUserProfile } from "@/lib/users-service"

/**
 * Conversation ids are the two uids sorted and joined, so "message this person"
 * is an idempotent write to a known id rather than a query-then-create that can
 * race into duplicate threads. Security rules re-derive this and reject any
 * mismatch, keeping the one-thread-per-pair invariant true.
 */
export function conversationIdFor(uidA: string, uidB: string): string {
  return [uidA, uidB].sort().join("_")
}

function mapParticipants(value: DocumentData | undefined): Record<string, ConversationParticipant> {
  if (!value) return {}
  return Object.fromEntries(
    Object.entries(value).map(([uid, participant]) => [
      uid,
      {
        name: String((participant as DocumentData)?.name ?? ""),
        photoURL: String((participant as DocumentData)?.photoURL ?? ""),
      },
    ])
  )
}

function mapReadReceipts(value: DocumentData | undefined): Record<string, Date> {
  if (!value) return {}
  return Object.fromEntries(Object.entries(value).map(([uid, at]) => [uid, toDate(at)]))
}

export function mapConversation(id: string, data: DocumentData): Conversation {
  return {
    id,
    participantIds: Array.isArray(data.participantIds) ? data.participantIds.map(String) : [],
    participants: mapParticipants(data.participants),
    gigId: data.gigId ?? null,
    gigTitle: data.gigTitle ?? null,
    gigSlug: data.gigSlug ?? null,
    lastMessage: String(data.lastMessage ?? ""),
    lastSenderId: String(data.lastSenderId ?? ""),
    lastMessageAt: toDate(data.lastMessageAt),
    lastReadAt: mapReadReceipts(data.lastReadAt),
    createdAt: toDate(data.createdAt),
  }
}

export function mapMessage(id: string, data: DocumentData): Message {
  return {
    id,
    senderId: String(data.senderId ?? ""),
    body: String(data.body ?? ""),
    createdAt: toDate(data.createdAt),
  }
}

/** True when the other party has said something this user has not seen yet. */
export function hasUnread(conversation: Conversation, uid: string): boolean {
  // An empty thread (opened but nobody has written) is never unread.
  if (!conversation.lastSenderId || conversation.lastSenderId === uid) return false
  const readAt = conversation.lastReadAt[uid]
  return !readAt || conversation.lastMessageAt > readAt
}

export function otherParticipant(conversation: Conversation, uid: string) {
  const otherId = conversation.participantIds.find((id) => id !== uid) ?? ""
  return { id: otherId, ...(conversation.participants[otherId] ?? { name: "", photoURL: "" }) }
}

/**
 * Creates the thread if it does not exist and returns its id. Existing threads
 * are left untouched, so the originating gig context is not overwritten when
 * the same pair talk again from a different gig.
 *
 * Names and photos are copied from both users' profile docs, which is exactly
 * what the security rules compare against, so neither side can be impersonated.
 * The check-then-create runs in a transaction so two people opening the same
 * thread at once cannot collide.
 */
export async function openConversation(
  myUid: string,
  theirUid: string,
  gig?: Pick<Gig, "id" | "title" | "slug">
): Promise<string> {
  if (myUid === theirUid) throw new Error("You cannot message yourself.")
  if (theirUid === SYSTEM_AUTHOR_ID) throw new Error("Example listings cannot be messaged.")

  const [me, them] = await Promise.all([fetchUserProfile(myUid), fetchUserProfile(theirUid)])
  if (!me || !them) throw new Error("That user could not be found.")

  const db = getFirebaseFirestore()
  const id = conversationIdFor(myUid, theirUid)
  const conversationRef = doc(db, "conversations", id)

  await runTransaction(db, async (transaction) => {
    if ((await transaction.get(conversationRef)).exists()) return

    transaction.set(conversationRef, {
      participantIds: [myUid, theirUid].sort(),
      participants: {
        [me.uid]: { name: me.displayName, photoURL: me.photoURL },
        [them.uid]: { name: them.displayName, photoURL: them.photoURL },
      },
      gigId: gig?.id ?? null,
      gigTitle: gig?.title ?? null,
      gigSlug: gig?.slug ?? null,
      lastMessage: "",
      lastSenderId: "",
      lastMessageAt: serverTimestamp(),
      lastReadAt: {},
      createdAt: serverTimestamp(),
    })
  })

  return id
}

/**
 * Writes the message and bumps the thread preview atomically. Security rules
 * check that the preview matches the message written in the same batch.
 */
export async function sendMessage(
  conversationId: string,
  senderUid: string,
  body: string
): Promise<void> {
  const db = getFirebaseFirestore()
  const conversationRef = doc(db, "conversations", conversationId)
  const messageRef = doc(collection(conversationRef, "messages"))

  const batch = writeBatch(db)
  batch.set(messageRef, {
    senderId: senderUid,
    body,
    createdAt: serverTimestamp(),
  })
  batch.update(conversationRef, {
    lastMessage: body,
    lastSenderId: senderUid,
    lastMessageAt: serverTimestamp(),
    lastMessageId: messageRef.id,
  })
  await batch.commit()
}

export async function markConversationRead(conversationId: string, uid: string): Promise<void> {
  await updateDoc(doc(getFirebaseFirestore(), "conversations", conversationId), {
    [`lastReadAt.${uid}`]: serverTimestamp(),
  })
}
