import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore"

import { getFirebaseFirestore } from "@/lib/firebase"
import { toDate } from "@/lib/firestore-utils"
import type { Gig, Order, OrderStatus } from "@/lib/types"

export function mapOrder(id: string, data: DocumentData): Order {
  return {
    id,
    gigId: String(data.gigId ?? ""),
    gigSlug: String(data.gigSlug ?? ""),
    gigTitle: String(data.gigTitle ?? ""),
    sellerId: String(data.sellerId ?? ""),
    sellerName: String(data.sellerName ?? ""),
    buyerId: String(data.buyerId ?? ""),
    buyerName: String(data.buyerName ?? ""),
    buyerEmail: String(data.buyerEmail ?? ""),
    requirements: String(data.requirements ?? ""),
    amount: Number(data.amount ?? 0),
    dueDays: Number(data.dueDays ?? 0),
    status: data.status,
    paymentStatus: data.paymentStatus,
    paymentRef: data.paymentRef ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  in_progress: "In progress",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
}

/**
 * Creates the order in "pending_payment". The amount is copied from the gig
 * rather than passed in by the caller, and security rules re-check it against
 * the gig document, so a tampered client cannot set its own price.
 */
export async function createOrder(
  gig: Gig,
  buyer: { uid: string; displayName: string; email: string },
  requirements: string
): Promise<string> {
  const snapshot = await addDoc(collection(getFirebaseFirestore(), "orders"), {
    gigId: gig.id,
    gigSlug: gig.slug,
    gigTitle: gig.title,
    sellerId: gig.authorId,
    sellerName: gig.authorName,
    buyerId: buyer.uid,
    buyerName: buyer.displayName,
    buyerEmail: buyer.email,
    requirements,
    amount: gig.budget,
    dueDays: gig.dueDays,
    status: "pending_payment",
    paymentStatus: "pending",
    paymentRef: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return snapshot.id
}

/**
 * Fulfillment transitions only. Security rules reject any write that touches
 * amount, paymentStatus, or the party ids.
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(getFirebaseFirestore(), "orders", id), {
    status,
    updatedAt: serverTimestamp(),
  })
}
