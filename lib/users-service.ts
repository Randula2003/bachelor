import type { User } from "firebase/auth"
import {
  deleteField,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore"

import { getFirebaseFirestore } from "@/lib/firebase"
import { toDate } from "@/lib/firestore-utils"
import type { SellerProfile, UserProfile } from "@/lib/types"

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
    photoURL: String(data.photoURL ?? ""),
    role: data.role === "seller" ? "seller" : "buyer",
    sellerProfile: mapSellerProfile(data.sellerProfile),
    createdAt: toDate(data.createdAt),
    updatedAt: data.updatedAt ? toDate(data.updatedAt) : undefined,
  }
}

/**
 * Creates the public profile doc on first sign-in, or brings an existing one
 * in line with Firebase Auth. User docs are readable by every signed-in user,
 * so the email is deliberately not stored here; the signed-in user's own
 * email comes from Firebase Auth.
 *
 * Runs in a transaction because sign-up calls this twice at nearly the same
 * moment (the auth listener and the form). Without it both could see "missing"
 * and the second create would land as an update the rules reject.
 */
export async function ensureUserDoc(user: User): Promise<void> {
  const db = getFirebaseFirestore()
  const userRef = doc(db, "users", user.uid)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(userRef)

    if (!snapshot.exists()) {
      transaction.set(userRef, {
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
        role: "buyer",
        sellerProfile: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return
    }

    const data = snapshot.data()
    const patch: Record<string, unknown> = {}
    // Sign-up sets the display name just after the account (and so this doc)
    // already exists, which would otherwise leave the profile nameless.
    if (user.displayName && data.displayName !== user.displayName) {
      patch.displayName = user.displayName
    }
    // Older docs stored the email publicly; strip it.
    if ("email" in data) patch.email = deleteField()

    if (Object.keys(patch).length > 0) {
      transaction.update(userRef, { ...patch, updatedAt: serverTimestamp() })
    }
  })
}

export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const snapshot = await getDoc(doc(getFirebaseFirestore(), "users", uid))
  return snapshot.exists() ? mapUserProfile(snapshot.id, snapshot.data()) : null
}
