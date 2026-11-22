import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentData,
} from "firebase/firestore"

import { getFirebaseFirestore } from "@/lib/firebase"
import { toDate } from "@/lib/firestore-utils"
import type { Gig } from "@/lib/types"

/**
 * Author id of the seeded example gigs (scripts/seed-gigs.ts). No real person
 * operates this account, so its gigs are shown but cannot be ordered or
 * messaged; security rules enforce the same.
 */
export const SYSTEM_AUTHOR_ID = "system"

export function isExampleGig(gig: Pick<Gig, "authorId">) {
  return gig.authorId === SYSTEM_AUTHOR_ID
}

export function mapGig(id: string, data: DocumentData): Gig {
  return {
    id,
    authorId: String(data.authorId ?? ""),
    authorName: String(data.authorName ?? ""),
    authorInitials: String(data.authorInitials ?? ""),
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    category: data.category,
    budget: Number(data.budget ?? 0),
    deadline: String(data.deadline ?? ""),
    dueDays: Number(data.dueDays ?? 0),
    level: data.level,
    skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
    status: data.status,
    slug: String(data.slug ?? ""),
    thumbnailPosition: String(data.thumbnailPosition ?? "center"),
    rating: Number(data.rating ?? 0),
    reviewCount: Number(data.reviewCount ?? 0),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  }
}

export async function fetchPublishedGigs(): Promise<Gig[]> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "gigs"),
      where("status", "==", "published"),
      orderBy("createdAt", "desc")
    )
  )
  return snapshot.docs.map((item) => mapGig(item.id, item.data()))
}

export async function fetchGigBySlug(slug: string): Promise<Gig | null> {
  const snapshot = await getDocs(
    query(
      collection(getFirebaseFirestore(), "gigs"),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    )
  )
  const item = snapshot.docs[0]
  return item ? mapGig(item.id, item.data()) : null
}

export async function fetchGigById(id: string): Promise<Gig | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "gigs", id))
  return snapshot.exists() ? mapGig(snapshot.id, snapshot.data()) : null
}

export async function createGig(data: Partial<Gig>): Promise<string> {
  const snapshot = await addDoc(collection(getFirebaseFirestore(), "gigs"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return snapshot.id
}

export async function updateGig(id: string, data: Partial<Gig>): Promise<void> {
  await updateDoc(doc(getFirebaseFirestore(), "gigs", id), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteGig(id: string): Promise<void> {
  await deleteDoc(doc(getFirebaseFirestore(), "gigs", id))
}
