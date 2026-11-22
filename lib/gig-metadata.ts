import { getApp, getApps, initializeApp } from "firebase/app"
import { collection, getDocs, getFirestore, limit, query, where } from "firebase/firestore/lite"

import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase"

// Server-only: used by generateMetadata. Runs on its own named app with the
// fetch-based "lite" SDK so it never shares state with the browser client.
const appName = "server-metadata"

export async function fetchPublishedGigSummary(
  slug: string
): Promise<{ title: string; description: string } | null> {
  if (!isFirebaseConfigured) return null

  const app = getApps().some((item) => item.name === appName)
    ? getApp(appName)
    : initializeApp(firebaseConfig, appName)

  // Published gigs are world-readable, so no auth is needed here.
  const snapshot = await getDocs(
    query(
      collection(getFirestore(app), "gigs"),
      where("slug", "==", slug),
      where("status", "==", "published"),
      limit(1)
    )
  )
  const data = snapshot.docs[0]?.data()
  return data ? { title: String(data.title ?? ""), description: String(data.description ?? "") } : null
}

const timeoutMs = 3000

/** Metadata must never break or stall the page, so errors and slow reads fall back to null. */
export async function fetchGigSummaryOrNull(slug: string) {
  try {
    return await Promise.race([
      fetchPublishedGigSummary(slug),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ])
  } catch (error) {
    console.error("Could not load gig metadata", error)
    return null
  }
}
