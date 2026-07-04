"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getFirebaseAuth } from "@/lib/firebase"
import { createGig, updateGig } from "@/lib/gigs-service"
import type { Gig, GigCategory, GigLevel, GigStatus, UserProfile } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const categories: GigCategory[] = ["Design", "Development", "Research", "Marketing", "Writing"]
const levels: GigLevel[] = ["Beginner friendly", "Intermediate", "Advanced"]

function generateSlug(title: string) {
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 6)
  return `${title.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60)}-${suffix}`
}

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "U"
}

export function GigForm({
  existingGig,
  mode,
  userProfile,
}: {
  existingGig?: Gig
  mode: "create" | "edit"
  userProfile: UserProfile
}) {
  const router = useRouter()
  const [title, setTitle] = useState(existingGig?.title ?? "")
  const [description, setDescription] = useState(existingGig?.description ?? "")
  const [category, setCategory] = useState<GigCategory>(existingGig?.category ?? "Design")
  const [budget, setBudget] = useState(String(existingGig?.budget ?? ""))
  const [dueDays, setDueDays] = useState(String(existingGig?.dueDays ?? ""))
  const [level, setLevel] = useState<GigLevel>(existingGig?.level ?? "Beginner friendly")
  const [skillsText, setSkillsText] = useState(existingGig?.skills.join(", ") ?? "")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState<GigStatus | null>(null)

  async function submit(status: GigStatus) {
    const skills = skillsText.split(",").map((skill) => skill.trim()).filter(Boolean)
    const budgetNumber = Number(budget)
    const dueDaysNumber = Number(dueDays)

    if (title.trim().length < 10 || title.trim().length > 80) return setError("Title must be between 10 and 80 characters.")
    if (description.trim().length < 50 || description.trim().length > 500) return setError("Description must be between 50 and 500 characters.")
    if (budgetNumber < 10 || budgetNumber > 10000) return setError("Budget must be between 10 and 10,000.")
    if (dueDaysNumber < 1 || dueDaysNumber > 90) return setError("Due days must be between 1 and 90.")
    if (skills.length < 1 || skills.length > 8) return setError("Add between 1 and 8 skills.")
    if (skills.some((skill) => skill.length < 2 || skill.length > 30)) return setError("Each skill must be between 2 and 30 characters.")
    if (new Set(skills.map((skill) => skill.toLowerCase())).size !== skills.length) return setError("Remove duplicate skills.")

    const user = getFirebaseAuth().currentUser
    if (!user) return setError("Log in before saving a gig.")

    setSaving(status)
    setError("")
    try {
      const authorName = userProfile.displayName || user.displayName || "Bachelor seller"
      const data: Partial<Gig> = {
        authorId: user.uid,
        authorName,
        authorInitials: initials(authorName),
        title: title.trim(),
        description: description.trim(),
        category,
        budget: budgetNumber,
        deadline: `Due in ${dueDaysNumber} days`,
        dueDays: dueDaysNumber,
        level,
        skills,
        status,
      }

      if (mode === "create") {
        await createGig({
          ...data,
          slug: generateSlug(title),
          thumbnailPosition: "center",
          rating: 0,
          reviewCount: 0,
        })
      } else if (existingGig) {
        await updateGig(existingGig.id, data)
      }
      router.push("/seller/dashboard")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save gig.")
    } finally {
      setSaving(null)
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader><CardTitle className="font-sans">{mode === "create" ? "Gig details" : "Edit gig"}</CardTitle><CardDescription>Clear details help the right buyers find your offer.</CardDescription></CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" maxLength={80} onChange={(event) => setTitle(event.target.value)} value={title} /></div>
        <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" maxLength={500} onChange={(event) => setDescription(event.target.value)} value={description} /></div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2"><Label>Category</Label><Select onValueChange={(value) => setCategory(value as GigCategory)} value={category}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{categories.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Level</Label><Select onValueChange={(value) => setLevel(value as GigLevel)} value={level}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{levels.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="budget">Budget</Label><Input id="budget" min={10} max={10000} onChange={(event) => setBudget(event.target.value)} type="number" value={budget} /></div>
          <div className="space-y-2"><Label htmlFor="dueDays">Due in days</Label><Input id="dueDays" min={1} max={90} onChange={(event) => setDueDays(event.target.value)} type="number" value={dueDays} /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="skills">Skills</Label><Input id="skills" onChange={(event) => setSkillsText(event.target.value)} placeholder="Figma, Branding, Illustration" value={skillsText} /><p className="text-xs text-muted-foreground">Separate up to 8 skills with commas.</p></div>
        {existingGig ? <Badge variant="secondary">Current status: {existingGig.status}</Badge> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="flex flex-wrap gap-3">
          <Button disabled={saving !== null} onClick={() => submit("published")}>{saving === "published" ? "Publishing..." : "Publish Gig"}</Button>
          <Button disabled={saving !== null} onClick={() => submit("draft")} variant="outline">{saving === "draft" ? "Saving..." : "Save as Draft"}</Button>
          <Button onClick={() => router.push("/seller/dashboard")} variant="ghost">Cancel</Button>
        </div>
      </CardContent>
    </Card>
  )
}
