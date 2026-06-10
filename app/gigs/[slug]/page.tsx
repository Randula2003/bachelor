import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
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
import { Separator } from "@/components/ui/separator"
import { gigs } from "@/lib/gigs"

export function generateStaticParams() {
  return gigs.map((gig) => ({ slug: gig.slug }))
}

export default async function GigPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const gig = gigs.find((item) => item.slug === slug)

  if (!gig) notFound()

  return (
    <main className="min-h-screen bg-muted/40">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12">
        <Button asChild variant="ghost">
          <Link href="/gigs">
            <ArrowLeft className="size-4" />
            All gigs
          </Link>
        </Button>

        <div className="relative mt-6 aspect-[16/7] min-h-64 overflow-hidden rounded-xl bg-muted">
          <Image
            alt={gig.title}
            className="object-cover"
            fill
            priority
            sizes="1280px"
            src="/hero.jpg"
            style={{ objectPosition: gig.thumbnailPosition }}
          />
          <Badge className="absolute bottom-5 left-5">{gig.category}</Badge>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{gig.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{gig.account}</p>
                <div className="mt-1 flex items-center gap-1 text-sm">
                  <Star className="size-4 fill-foreground" />
                  <span className="font-semibold">{gig.rating}</span>
                  <span className="text-muted-foreground">({gig.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              {gig.title}
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-muted-foreground">
              {gig.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {gig.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            <Separator className="my-8" />

            <h2 className="text-xl font-semibold">What you will get</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Clear project communication",
                "Original work and source files",
                "Progress updates throughout",
                "One revision after delivery",
              ].map((item) => (
                <div className="flex items-center gap-2 text-sm" key={item}>
                  <CheckCircle2 className="size-4 shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <Separator className="my-8" />

            <h2 className="text-xl font-semibold">Ratings and reviews</h2>
            <Card className="mt-5 gap-5 shadow-none">
              <CardContent className="grid gap-6 sm:grid-cols-[160px_1fr]">
                <div className="flex flex-col items-center justify-center rounded-lg bg-muted p-6 text-center">
                  <p className="text-5xl font-black">{gig.rating}</p>
                  <div className="mt-3 flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star className="size-4 fill-foreground" key={index} />
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{gig.reviews} reviews</p>
                </div>
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((stars, index) => (
                    <div className="flex items-center gap-3 text-xs" key={stars}>
                      <span className="w-6">{stars}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-foreground"
                          style={{ width: `${[88, 9, 2, 1, 0][index]}%` }}
                        />
                      </div>
                      <span className="w-8 text-right text-muted-foreground">
                        {[88, 9, 2, 1, 0][index]}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  name: "Jamie Chen",
                  initials: "JC",
                  text: "Excellent communication and thoughtful work. Everything arrived on time.",
                },
                {
                  name: "Taylor Morgan",
                  initials: "TM",
                  text: "The final result was polished and matched the brief perfectly.",
                },
              ].map((review) => (
                <Card className="gap-4 shadow-none" key={review.name}>
                  <CardHeader>
                    <Avatar>
                      <AvatarFallback>{review.initials}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-sans">{review.name}</CardTitle>
                    <CardDescription className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star className="size-3 fill-foreground" key={index} />
                      ))}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="leading-6 text-muted-foreground">{review.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <aside>
            <Card className="gap-5 shadow-none lg:sticky lg:top-5">
              <CardHeader>
                <CardDescription>Starting at</CardDescription>
                <CardTitle className="font-sans text-3xl">${gig.budget}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4" />
                  {gig.deadline}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock3 className="size-4" />
                  {gig.posted}
                </div>
                <Badge variant="secondary">{gig.level}</Badge>
                <Separator />
                <Button className="w-full" size="lg">
                  Continue
                </Button>
                <Button className="w-full" size="lg" variant="outline">
                  <MessageCircle className="size-4" />
                  Contact {gig.account.split(" ")[0]}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  )
}
