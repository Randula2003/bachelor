import Image from "next/image"
import Link from "next/link"
import { BookOpen, ClipboardList, FlaskConical, FolderKanban } from "lucide-react"
import { AuthDialogTrigger } from "@/components/auth-dialog"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const talent = [
  {
    initials: "AR",
    name: "Ari Roberts",
    role: "Brand designer",
    school: "RISD '27",
    rate: "$32/hr",
    rating: "4.9",
    jobs: "18 projects",
    skills: ["Branding", "Figma", "Illustration"],
    color: "bg-zinc-200 text-zinc-800",
  },
  {
    initials: "JM",
    name: "Jordan Mills",
    role: "Full-stack developer",
    school: "Georgia Tech '26",
    rate: "$42/hr",
    rating: "5.0",
    jobs: "12 projects",
    skills: ["Next.js", "Python", "APIs"],
    color: "bg-zinc-300 text-zinc-800",
  },
  {
    initials: "SK",
    name: "Samira Khan",
    role: "Social media strategist",
    school: "NYU '28",
    rate: "$28/hr",
    rating: "4.8",
    jobs: "24 projects",
    skills: ["TikTok", "Copywriting", "Growth"],
    color: "bg-zinc-100 text-zinc-800",
  },
]

const categories = [
  { number: "01", title: "Design & creative", count: "320+ students" },
  { number: "02", title: "Development & tech", count: "280+ students" },
  { number: "03", title: "Writing & research", count: "190+ students" },
  { number: "04", title: "Marketing & media", count: "240+ students" },
]

const services = [
  {
    title: "Assignments",
    icon: ClipboardList,
  },
  {
    title: "Projects",
    icon: FolderKanban,
  },
  {
    title: "Study sessions",
    icon: BookOpen,
  },
  {
    title: "Research",
    icon: FlaskConical,
  },
]

const steps = [
  {
    number: "01",
    title: "Share what you need",
    text: "Post a project in minutes, from a quick logo refresh to a complete web build.",
  },
  {
    number: "02",
    title: "Meet student talent",
    text: "Review verified profiles, portfolios, rates, and real feedback from past clients.",
  },
  {
    number: "03",
    title: "Build something great",
    text: "Collaborate directly, pay securely, and help a student grow their career.",
  },
]

export default function Home() {
  return (
    <main className="overflow-hidden">
      <section className="relative isolate h-[calc(100svh-10rem)] overflow-hidden border-b border-primary/10">
        <Image
          alt="Students collaborating on a project"
          className="-z-20 object-cover"
          fill
          priority
          sizes="100vw"
          src="/hero.jpg"
        />
        <div className="absolute inset-0 -z-10 bg-black/35" />
        <div className="mx-auto flex h-full max-w-7xl items-center px-5 py-20 md:px-8">
          <div className="max-w-3xl text-white">
            <Badge className="mb-7 bg-white px-3 py-1 text-primary hover:bg-white/90">
              Student talent, ready when you are
            </Badge>
            <h1 className="text-5xl leading-[0.98] font-black tracking-[-0.065em] sm:text-7xl lg:text-8xl">
              Great work starts with fresh perspective.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/80 sm:text-lg">
              Find skilled university students for your next design, development,
              marketing, or research project.
            </p>
            <div className="mt-9 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <Button
                asChild
                className="h-11 bg-white px-6 text-primary hover:bg-white/90"
                size="lg"
              >
                <Link href="/gigs">Find student talent</Link>
              </Button>
              <AuthDialogTrigger
                className="h-11 border-white/40 bg-white/10 px-6 text-white hover:bg-white/20 hover:text-white"
                mode="signup"
                size="lg"
                variant="outline"
              >
                Start freelancing
              </AuthDialogTrigger>
            </div>
            <div className="mt-9 flex items-center gap-3">
              <AvatarGroup className="*:data-[slot=avatar]:ring-white">
                {talent.map((person) => (
                  <Avatar key={person.initials}>
                    <AvatarFallback className="bg-white text-primary">
                      {person.initials}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>
              <p className="text-sm text-white/75">
                <strong className="font-semibold text-white">1,200+ students</strong>
                <span className="block">verified and ready to work</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 px-5 py-8 md:grid-cols-4 md:px-8">
          {services.map(({ icon: Icon, title }) => (
            <Card className="gap-0 bg-background/95 py-0 shadow-none backdrop-blur-sm" key={title}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-4" />
                </div>
                <CardTitle className="font-sans text-sm">{title}</CardTitle>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8" id="talent">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Badge variant="outline">Fresh talent</Badge>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] sm:text-5xl">
              Meet your next collaborator.
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link href="/gigs">Explore all talent</Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {talent.map((person) => (
            <Card
              className="gap-5 border-primary/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
              key={person.name}
            >
              <CardHeader>
                <Avatar className="size-14">
                  <AvatarFallback className={`text-base font-bold ${person.color}`}>
                    {person.initials}
                  </AvatarFallback>
                </Avatar>
                <CardAction>
                  <Badge variant="secondary">{person.rate}</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <CardTitle className="font-sans text-xl">{person.name}</CardTitle>
                <CardDescription className="mt-1">
                  {person.role} - {person.school}
                </CardDescription>
                <div className="mt-5 flex flex-wrap gap-2">
                  {person.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t text-sm">
                <span className="font-semibold">{person.rating} rating</span>
                <span className="text-muted-foreground">{person.jobs}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary text-white" id="categories">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <Badge className="bg-white text-primary hover:bg-white">
            Browse by skill
          </Badge>
          <h2 className="mt-5 max-w-2xl text-5xl font-black tracking-[-0.065em] sm:text-6xl">
            Whatever the brief, there is a student for it.
          </h2>
          <div className="mt-14 border-t border-white/15">
            {categories.map((category) => (
              <div
                className="group grid gap-3 border-b border-white/15 py-7 transition-colors hover:text-white/70 sm:grid-cols-[70px_1fr_auto] sm:items-center"
                key={category.number}
              >
                <span className="text-sm text-white/35">{category.number}</span>
                <h3 className="text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  {category.title}
                </h3>
                <span className="text-sm text-white/45 group-hover:text-white/70">
                  {category.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8" id="how-it-works">
        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <Badge variant="outline">How it works</Badge>
            <h2 className="mt-5 text-5xl font-black tracking-[-0.065em]">
              Good work starts with a good match.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-muted-foreground">
              Bachelor makes finding and hiring emerging talent simple, transparent,
              and rewarding for everyone involved.
            </p>
            <Button className="mt-8" size="lg">
              Post a project
            </Button>
          </div>
          <div>
            {steps.map((step) => (
              <Card className="mb-4 gap-4 border-primary/10 shadow-none" key={step.number}>
                <CardHeader>
                  <Badge variant="secondary">{step.number}</Badge>
                  <CardTitle className="mt-3 font-sans text-2xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-xl leading-7 text-muted-foreground">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-8 md:px-8">
        <Card className="mx-auto max-w-7xl overflow-hidden border-0 bg-primary px-2 py-14 text-primary-foreground shadow-none sm:px-10 sm:py-20">
          <CardContent className="flex flex-col items-center text-center">
            <Badge className="bg-primary-foreground text-primary hover:bg-primary-foreground">
              Your next project starts here
            </Badge>
            <h2 className="mt-6 max-w-4xl text-5xl leading-[0.98] font-black tracking-[-0.07em] sm:text-7xl">
              Hire potential. Build something brilliant.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-primary-foreground/70">
              Join the marketplace where student ambition meets real opportunity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="bg-foreground text-background hover:bg-foreground/90" size="lg">
                <Link href="/gigs">Find student talent</Link>
              </Button>
              <Button
                className="border-primary-foreground/25 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                size="lg"
                variant="outline"
              >
                Start freelancing
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <a className="text-xl font-black tracking-[-0.06em]" href="#">
          bachelor<span className="text-primary">.</span>
        </a>
        <p className="text-sm text-muted-foreground">
          Real projects. Real experience. Built by students.
        </p>
        <div className="flex gap-5 text-sm font-medium">
          <a href="#">About</a>
          <a href="#">Safety</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </main>
  )
}
