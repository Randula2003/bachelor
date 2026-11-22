import { Suspense } from "react"

import { GigsBrowser } from "@/components/gigs-browser"

export default function GigsPage() {
  // GigsBrowser reads ?q= with useSearchParams, which needs a Suspense boundary
  // so the rest of the route can still be prerendered.
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-1 items-center justify-center bg-muted/40 p-8">
          <p className="text-sm text-muted-foreground">Loading gigs...</p>
        </main>
      }
    >
      <GigsBrowser />
    </Suspense>
  )
}
