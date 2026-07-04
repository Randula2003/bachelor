import type { User } from "firebase/auth"
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore"

import { getFirebaseFirestore } from "@/lib/firebase"
import type { SellerProfile, UserProfile, UserRole } from "@/lib/types"

function toDate(value: unknown): Date {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate()
  }
  return value instanceof Date ? value : new Date(0)
}

function mapSellerProfile(value: DocumentData | null | undefined): SellerProfile | null {
  if (!value) return null
  return {
    bio: String(value.bio ?? ""),
    skills: Array.isArray(value.skills) ? value.skills.map(String) : [],
    portfolio: String(value.portfolio ?? ""),
    verified: Boolean(value.verified),
    rating: Number(value.rating ?? 0),
    reviewCount: Number(value.reviewCount ?? 0),
    createdAt: toDate(value.createdAt),
  }
}

export function mapUserProfile(uid: string, data: DocumentData): UserProfile {
  return {
    uid,
    displayName: String(data.displayName ?? ""),
    email: String(data.email ?? ""),
    photoURL: String(data.photoURL ?? ""),
    role: (data.role ?? "buyer") as UserRole,
    sellerProfile: mapSellerProfile(data.sellerProfile),
    createdAt: toDate(data.createdAt),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
  }
}

export async function ensureUserDoc(user: User): Promise<void> {
  const userRef = doc(getFirebaseFirestore(), "users", user.uid)
  const snapshot = await getDoc(userRef)
  if (snapshot.exists()) return

  await setDoc(userRef, {
    displayName: user.displayName ?? "",
    email: user.email ?? "",
    photoURL: user.photoURL ?? "",
    role: "buyer",
    sellerProfile: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "users", uid))
  return snapshot.exists() ? mapUserProfile(snapshot.id, snapshot.data()) : null
}
