"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Star,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const gigs = [
  {
    slug: "student-startup-visual-identity",
    title: "Design a visual identity for a student startup",
    category: "Design",
    budget: 420,
    deadline: "Due in 5 days",
    dueDays: 5,
    posted: "Posted 2 hours ago",
    postedOrder: 1,
    level: "Intermediate",
    description:
      "Create a logo, color system, and compact brand guide for a campus marketplace.",
    skills: ["Branding", "Figma", "Illustration"],
    account: "Ari Roberts",
    initials: "AR",
    thumbnailPosition: "center",
    rating: "4.9",
    reviews: 32,
  },
  {
    slug: "responsive-event-registration-page",
    title: "Build a responsive event registration page",
    category: "Development",
    budget: 650,
    deadline: "Due in 10 days",
    dueDays: 10,
    posted: "Posted 4 hours ago",
    postedOrder: 2,
    level: "Intermediate",
    description: "Develop a polished registration flow with validation and confirmation states.",
    skills: ["Next.js", "TypeScript", "Responsive UI"],
    account: "Jordan Mills",
    initials: "JM",
    thumbnailPosition: "top",
    rating: "5.0",
    reviews: 18,
  },
  {
    slug: "sustainable-packaging-research",
    title: "Research sustainable packaging competitors",
    category: "Research",
    budget: 280,
    deadline: "Due in 7 days",
    dueDays: 7,
    posted: "Posted today",
    postedOrder: 3,
    level: "Beginner friendly",
    description: "Review the market and summarize positioning, pricing, and material choices.",
    skills: ["Market research", "Analysis", "Writing"],
    account: "Samira Khan",
    initials: "SK",
    thumbnailPosition: "bottom",
    rating: "4.8",
    reviews: 46,
  },
  {
    slug: "product-launch-short-form-videos",
    title: "Create short-form videos for a product launch",
    category: "Marketing",
    budget: 500,
    deadline: "Due in 14 days",
    dueDays: 14,
    posted: "Posted yesterday",
    postedOrder: 4,
    level: "Intermediate",
    description: "Plan and edit six vertical videos for a student-focused productivity app.",
    skills: ["Video editing", "TikTok", "Storytelling"],
    account: "Noah Williams",
    initials: "NW",
    thumbnailPosition: "left",
    rating: "4.9",
    reviews: 27,
  },
  {
    slug: "survey-analysis-report",
    title: "Analyze survey results and prepare a report",
    category: "Research",
    budget: 360,
    deadline: "Due in 4 days",
    dueDays: 4,
    posted: "Posted yesterday",
    postedOrder: 5,
    level: "Advanced",
    description: "Clean survey responses, identify key findings, and create a concise report.",
    skills: ["Data analysis", "Excel", "Reporting"],
    account: "Maya Lee",
    initials: "ML",
    thumbnailPosition: "right",
    rating: "5.0",
    reviews: 14,
  },
  {
    slug: "tutoring-service-website-copy",
    title: "Write website copy for a tutoring service",
    category: "Writing",
    budget: 240,
    deadline: "Due in 6 days",
    dueDays: 6,
    posted: "Posted 2 days ago",
    postedOrder: 6,
    level: "Beginner friendly",
    description: "Write clear, friendly copy for five core pages with calls to action.",
    skills: ["Copywriting", "SEO", "Editing"],
    account: "Elena Garcia",
    initials: "EG",
    thumbnailPosition: "20% center",
    rating: "4.7",
    reviews: 21,
  },
  {
    slug: "mobile-study-planner-prototype",
    title: "Prototype a mobile study planner",
    category: "Design",
    budget: 580,
    deadline: "Due in 12 days",
    dueDays: 12,
    posted: "Posted 3 days ago",
    postedOrder: 7,
    level: "Advanced",
    description: "Turn existing requirements into a clickable, tested mobile app prototype.",
    skills: ["Product design", "Figma", "Prototyping"],
    account: "Theo Bennett",
    initials: "TB",
    thumbnailPosition: "80% center",
    rating: "4.9",
    reviews: 39,
  },
  {
    slug: "automated-spreadsheet-reporting",
    title: "Automate weekly spreadsheet reporting",
    category: "Development",
    budget: 720,
    deadline: "Due in 8 days",
    dueDays: 8,
    posted: "Posted 4 days ago",
    postedOrder: 8,
    level: "Advanced",
    description: "Build a script that cleans incoming data and generates weekly summaries.",
    skills: ["Python", "Automation", "Google Sheets"],
    account: "Priya Shah",
    initials: "PS",
    thumbnailPosition: "center 30%",
    rating: "5.0",
    reviews: 24,
  },
]

const categories = ["All categories", ...Array.from(new Set(gigs.map((gig) => gig.category)))]

export default function GigsPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All categories")
  const [sort, setSort] = useState("newest")

  const visibleGigs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = gigs.filter((gig) => {
      const matchesCategory = category === "All categories" || gig.category === category
      const matchesQuery =
        !normalizedQuery ||
        [gig.title, gig.account, gig.description, gig.category, ...gig.skills]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)

      return matchesCategory && matchesQuery
    })

    return [...filtered].sort((a, b) => {
      if (sort === "budget-high") return b.budget - a.budget
      if (sort === "budget-low") return a.budget - b.budget
      if (sort === "deadline") return a.dueDays - b.dueDays
      return a.postedOrder - b.postedOrder
    })
  }, [category, query, sort])

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-16">
        <div className="max-w-2xl">
          <Badge variant="secondary">Open opportunities</Badge>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
            Find your next gig.
          </h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            Browse real projects, assignments, and research opportunities matched to
            student skills.
          </p>
        </div>

        <Card className="mt-10 gap-4 shadow-none">
          <CardContent className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="Search gigs"
                className="pl-8"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search gigs, skills, or categories"
                type="search"
                value={query}
              />
            </div>
            <Select onValueChange={setCategory} value={category}>
              <SelectTrigger className="w-full">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSort} value={sort}>
              <SelectTrigger className="w-full">
                <ArrowUpDown className="size-4 text-muted-foreground" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="budget-high">Budget: high to low</SelectItem>
                <SelectItem value="budget-low">Budget: low to high</SelectItem>
                <SelectItem value="deadline">Deadline: soonest</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            <strong className="font-semibold text-foreground">{visibleGigs.length}</strong>{" "}
            gigs available
          </p>
          <Badge variant="outline">Updated today</Badge>
        </div>

        {visibleGigs.length > 0 ? (
          <div className="mt-5 grid gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
            {visibleGigs.map((gig) => (
              <article key={gig.title}>
                <Link className="block w-full text-left" href={`/gigs/${gig.slug}`}>
                  <Card className="relative aspect-[4/3] gap-0 overflow-hidden bg-muted py-0 shadow-none">
                    <Image
                      alt={gig.title}
                      className="object-cover transition-transform duration-300 group-hover/card:scale-105"
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      src="/hero.jpg"
                      style={{ objectPosition: gig.thumbnailPosition }}
                    />
                    <Badge className="absolute top-3 left-3">{gig.category}</Badge>
                  </Card>
                  <div className="pt-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Avatar size="sm">
                        <AvatarFallback>{gig.initials}</AvatarFallback>
                      </Avatar>
                      <span className="truncate font-medium">{gig.account}</span>
                    </div>
                    <h2 className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 font-medium">
                      {gig.title}
                    </h2>
                    <div className="mt-2 flex items-center gap-1 text-sm">
                      <Star className="size-4 fill-foreground" />
                      <span className="font-semibold">{gig.rating}</span>
                      <span className="text-muted-foreground">({gig.reviews})</span>
                    </div>
                    <p className="mt-3 text-sm">
                      From <strong className="text-base">${gig.budget}</strong>
                    </p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <Card className="mt-5 items-center py-16 text-center shadow-none">
            <CardHeader>
              <CardTitle>No gigs found</CardTitle>
              <CardDescription>Try a different search or category.</CardDescription>
            </CardHeader>
            <Button
              onClick={() => {
                setQuery("")
                setCategory("All categories")
              }}
              variant="outline"
            >
              Clear filters
            </Button>
          </Card>
        )}
      </div>

    </main>
  )
}
