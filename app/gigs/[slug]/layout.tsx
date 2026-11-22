import type { Metadata } from "next"

import { fetchGigSummaryOrNull } from "@/lib/gig-metadata"

// The page itself is a Client Component (it needs the signed-in user), and
// metadata can only come from a Server Component, so it lives here.
export async function generateMetadata({ params }: LayoutProps<"/gigs/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const gig = await fetchGigSummaryOrNull(slug)
  if (!gig) return { title: "Gig not found | bachelor." }
  return {
    title: `${gig.title} | bachelor.`,
    description: gig.description,
    openGraph: { title: gig.title, description: gig.description, images: ["/hero.jpg"] },
  }
}

export default function GigLayout({ children }: LayoutProps<"/gigs/[slug]">) {
  return children
}
