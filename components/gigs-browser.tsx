"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowUpDown, Search, SlidersHorizontal, Star } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchPublishedGigs } from "@/lib/gigs-service"
import { isAbortError } from "@/lib/errors"
import type { Gig } from "@/lib/types"

const categories = ["All categories", "Design", "Development", "Research", "Marketing", "Writing"]

/** Gig listing with search, category and sort. Reads the initial search from `?q=` (header search). */
export function GigsBrowser() {
  const queryParam = useSearchParams().get("q") ?? ""
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState(queryParam)
  const [syncedQueryParam, setSyncedQueryParam] = useState(queryParam)
  const [category, setCategory] = useState("All categories")
  const [sort, setSort] = useState("newest")

  // A new header search while already on /gigs changes ?q= without remounting.
  if (queryParam !== syncedQueryParam) {
    setSyncedQueryParam(queryParam)
    setSearch(queryParam)
  }

  useEffect(() => {
    let active = true
    fetchPublishedGigs()
      .then((data) => { if (active) setGigs(data) })
      .catch((loadError) => {
        if (!active || isAbortError(loadError)) return
        setError(loadError instanceof Error ? loadError.message : "Could not load gigs.")
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const visibleGigs = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = gigs.filter((gig) => {
      const matchesCategory = category === "All categories" || gig.category === category
      const matchesSearch = !query || [gig.title, gig.authorName, gig.description, gig.category, ...gig.skills].join(" ").toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
    return filtered.sort((a, b) => {
      if (sort === "budget-high") return b.budget - a.budget
      if (sort === "budget-low") return a.budget - b.budget
      if (sort === "deadline") return a.dueDays - b.dueDays
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }, [category, gigs, search, sort])

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-2xl"><Badge variant="secondary">Open opportunities</Badge><h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">Find your next gig.</h1><p className="mt-4 leading-7 text-muted-foreground">Browse real projects, assignments, and research opportunities matched to student skills.</p></div>
        <Card className="mt-10 gap-4 shadow-none"><CardContent className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
          <div className="relative"><Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search gigs" className="pl-8" onChange={(event) => setSearch(event.target.value)} placeholder="Search gigs, skills, or categories" type="search" value={search} /></div>
          <Select onValueChange={setCategory} value={category}><SelectTrigger className="w-full"><SlidersHorizontal className="size-4 text-muted-foreground" /><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          <Select onValueChange={setSort} value={sort}><SelectTrigger className="w-full"><ArrowUpDown className="size-4 text-muted-foreground" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="newest">Newest first</SelectItem><SelectItem value="budget-high">Budget: high to low</SelectItem><SelectItem value="budget-low">Budget: low to high</SelectItem><SelectItem value="deadline">Deadline: soonest</SelectItem></SelectContent></Select>
        </CardContent></Card>
        <div className="mt-8 flex items-center justify-between"><p className="text-sm text-muted-foreground"><strong className="text-foreground">{visibleGigs.length}</strong> gigs available</p><Badge variant="outline">Published gigs</Badge></div>
        {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading gigs...</p> : null}
        {error ? <Card className="mt-5 p-8 text-center shadow-none"><p className="text-destructive">{error}</p></Card> : null}
        {!loading && !error && visibleGigs.length === 0 ? <Card className="mt-5 items-center py-16 text-center shadow-none"><CardHeader><CardTitle className="font-sans">No gigs are available yet.</CardTitle><CardDescription>Check back after sellers publish new offers.</CardDescription></CardHeader><Button onClick={() => { setSearch(""); setCategory("All categories") }} variant="outline">Clear filters</Button></Card> : null}
        {visibleGigs.length > 0 ? <div className="mt-5 grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">{visibleGigs.map((gig) => <article key={gig.id}><Link className="block" href={`/gigs/${gig.slug}`}><Card className="relative aspect-[4/3] gap-0 overflow-hidden bg-muted py-0 shadow-none"><Image alt={gig.title} className="object-cover transition-transform duration-300 group-hover/card:scale-105" fill sizes="(min-width: 1024px) 25vw, 50vw" src="/hero.jpg" style={{ objectPosition: gig.thumbnailPosition }} /><Badge className="absolute top-3 left-3">{gig.category}</Badge></Card><div className="pt-3"><div className="flex items-center gap-2 text-xs"><Avatar size="sm"><AvatarFallback>{gig.authorInitials}</AvatarFallback></Avatar><span className="truncate font-medium">{gig.authorName}</span></div><h2 className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 font-medium">{gig.title}</h2><div className="mt-2 flex items-center gap-1 text-sm"><Star className="size-4 fill-foreground" /><span className="font-semibold">{gig.reviewCount > 0 ? gig.rating.toFixed(1) : "New"}</span><span className="text-muted-foreground">({gig.reviewCount})</span></div><p className="mt-3 text-sm">From <strong className="text-base">${gig.budget}</strong></p></div></Link></article>)}</div> : null}
      </div>
    </main>
  )
}
