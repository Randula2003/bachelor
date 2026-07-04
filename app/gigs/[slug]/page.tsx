"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { ArrowLeft, CalendarDays, CheckCircle2, MessageCircle, Star } from "lucide-react"

import { ApplicationModal } from "@/components/application-modal"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getFirebaseAuth } from "@/lib/firebase"
import { isAbortError } from "@/lib/errors"
import { fetchGigBySlug } from "@/lib/gigs-service"
import type { Gig } from "@/lib/types"

export default function GigPage() {
  const { slug } = useParams<{ slug: string }>()
  const [gig, setGig] = useState<Gig | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [applicationOpen, setApplicationOpen] = useState(false)

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), setUser), [])
  useEffect(() => {
    let active = true
    fetchGigBySlug(slug)
      .then((item) => {
        if (active) setGig(item)
      })
      .catch((error) => {
        if (!isAbortError(error)) console.error(error)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) return <main className="flex flex-1 items-center justify-center p-8">Loading gig...</main>
  if (!gig) return <main className="mx-auto max-w-xl px-5 py-16"><h1 className="text-3xl font-bold">Gig not found.</h1><Button asChild className="mt-5"><Link href="/gigs">Browse gigs</Link></Button></main>

  const owner = user?.uid === gig.authorId
  return <main className="min-h-screen bg-muted/40"><div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
    <Button asChild variant="ghost"><Link href="/gigs"><ArrowLeft />All gigs</Link></Button>
    <div className="relative mt-6 aspect-[16/7] min-h-64 overflow-hidden rounded-xl bg-muted"><Image alt={gig.title} className="object-cover" fill priority sizes="1280px" src="/hero.jpg" style={{ objectPosition: gig.thumbnailPosition }} /><Badge className="absolute bottom-5 left-5">{gig.category}</Badge></div>
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]"><div>
      <div className="flex items-center gap-3"><Avatar size="lg"><AvatarFallback>{gig.authorInitials}</AvatarFallback></Avatar><div><p className="font-semibold">{gig.authorName}</p><div className="mt-1 flex items-center gap-1 text-sm"><Star className="size-4 fill-foreground" /><span>{gig.rating.toFixed(1)}</span><span className="text-muted-foreground">({gig.reviewCount} reviews)</span></div></div></div>
      <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">{gig.title}</h1><p className="mt-4 max-w-3xl leading-7 text-muted-foreground">{gig.description}</p><div className="mt-6 flex flex-wrap gap-2">{gig.skills.map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}</div>
      <Separator className="my-8" /><h2 className="text-xl font-semibold">What you will get</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{["Clear project communication", "Original work and source files", "Progress updates throughout", "One revision after delivery"].map((item) => <div className="flex items-center gap-2 text-sm" key={item}><CheckCircle2 className="size-4" />{item}</div>)}</div>
    </div><aside><Card className="gap-5 shadow-none lg:sticky lg:top-5"><CardHeader><CardDescription>Starting at</CardDescription><CardTitle className="font-sans text-3xl">${gig.budget}</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center gap-2 text-sm"><CalendarDays className="size-4" />{gig.deadline}</div><Badge variant="secondary">{gig.level}</Badge><Separator />{owner ? <Button asChild className="w-full"><Link href={`/seller/gigs/${gig.id}/edit`}>Edit gig</Link></Button> : user ? <Button className="w-full" onClick={() => setApplicationOpen(true)}>Apply</Button> : <Button className="w-full" onClick={() => window.dispatchEvent(new CustomEvent("open-auth-dialog", { detail: "login" }))}>Log in to apply</Button>}<Button className="w-full" variant="outline"><MessageCircle />Contact {gig.authorName.split(" ")[0]}</Button></CardContent></Card></aside></div>
  </div>{user ? <ApplicationModal gig={gig} onOpenChange={setApplicationOpen} open={applicationOpen} user={user} /> : null}</main>
}
