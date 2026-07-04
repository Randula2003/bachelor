import { applicationDefault, getApps, initializeApp } from "firebase-admin/app"
import { FieldValue, getFirestore } from "firebase-admin/firestore"

import { gigs } from "../lib/gigs"

if (!getApps().length) {
  initializeApp({ credential: applicationDefault() })
}

const db = getFirestore()

async function seed() {
  await db.collection("users").doc("system").set({
    displayName: "Bachelor marketplace",
    email: "",
    photoURL: "",
    role: "seller",
    sellerProfile: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true })

  const existing = await db.collection("gigs").get()
  const slugs = new Set(existing.docs.map((item) => String(item.data().slug)))

  for (const gig of gigs) {
    if (slugs.has(gig.slug)) continue
    await db.collection("gigs").add({
      authorId: "system",
      authorName: gig.account,
      authorInitials: gig.initials,
      title: gig.title,
      description: gig.description,
      category: gig.category,
      budget: gig.budget,
      deadline: gig.deadline,
      dueDays: gig.dueDays,
      level: gig.level,
      skills: [...gig.skills],
      status: "published",
      slug: gig.slug,
      thumbnailPosition: gig.thumbnailPosition,
      rating: Number(gig.rating),
      reviewCount: gig.reviews,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
}

seed().then(() => {
  console.log("Finished seeding gigs.")
  process.exit(0)
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
