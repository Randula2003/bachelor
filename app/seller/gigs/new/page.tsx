"use client"

import { GigForm } from "@/components/gig-form"
import { useSellerGuard } from "@/lib/hooks/use-seller-guard"

export default function NewGigPage() {
  const { loading, isSeller, userProfile } = useSellerGuard()
  if (loading || !isSeller || !userProfile) return <main className="flex flex-1 items-center justify-center p-8">Checking seller access...</main>

  return (
    <main className="mx-auto w-full max-w-4xl px-5 py-12 md:px-8">
      <h1 className="text-4xl font-black tracking-[-0.055em]">Create New Gig</h1>
      <p className="mt-3 text-muted-foreground">Publish an offer buyers can discover and hire.</p>
      <div className="mt-8"><GigForm mode="create" userProfile={userProfile} /></div>
    </main>
  )
}
