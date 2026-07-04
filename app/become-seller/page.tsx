"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, serverTimestamp, updateDoc } from "firebase/firestore"

import { AuthDialogTrigger } from "@/components/auth-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getFirebaseAuth, getFirebaseFirestore } from "@/lib/firebase"
import { isAbortError } from "@/lib/errors"
import { ensureUserDoc, fetchUserProfile } from "@/lib/users-service"

function parseSkills(value: string) {
  return value.split(",").map((skill) => skill.trim()).filter(Boolean)
}

export default function BecomeSellerPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [bio, setBio] = useState("")
  const [skillsText, setSkillsText] = useState("")
  const [portfolio, setPortfolio] = useState("")
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const skills = parseSkills(skillsText)

  useEffect(() => onAuthStateChanged(getFirebaseAuth(), (currentUser) => {
    setUser(currentUser)
    void (async () => {
      try {
        if (currentUser) {
          await ensureUserDoc(currentUser)
          const profile = await fetchUserProfile(currentUser.uid)
          if (profile?.role === "seller" || profile?.role === "both") {
            router.replace("/seller/dashboard")
            return
          }
        }
        setLoading(false)
      } catch (error) {
        if (!isAbortError(error)) setError(error instanceof Error ? error.message : "Could not load profile.")
      }
    })()
  }), [router])

  function validate() {
    if (bio.trim().length < 50 || bio.trim().length > 500) {
      return "Bio must be between 50 and 500 characters."
    }
    if (skills.length < 2 || skills.length > 10) return "Add between 2 and 10 skills."
    if (skills.some((skill) => skill.length < 2 || skill.length > 30)) {
      return "Each skill must be between 2 and 30 characters."
    }
    if (new Set(skills.map((skill) => skill.toLowerCase())).size !== skills.length) {
      return "Remove duplicate skills."
    }
    if (portfolio) {
      try {
        new URL(portfolio)
      } catch {
        return "Enter a valid portfolio URL."
      }
    }
    if (!terms) return "Accept the seller terms to continue."
    return ""
  }

  function review() {
    const message = validate()
    setError(message)
    if (!message) setStep(2)
  }

  async function submit() {
    if (!user) return
    setSaving(true)
    setError("")
    try {
      await updateDoc(doc(getFirebaseFirestore(), "users", user.uid), {
        role: "seller",
        sellerProfile: {
          bio: bio.trim(),
          skills,
          portfolio,
          verified: false,
          rating: 0,
          reviewCount: 0,
          createdAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      })
      window.dispatchEvent(new CustomEvent("user-role-updated", { detail: "seller" }))
      router.push("/seller/dashboard")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create seller profile.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <main className="flex flex-1 items-center justify-center p-8">Loading...</main>

  if (!user) {
    return (
      <main className="mx-auto flex max-w-xl flex-1 items-center px-5 py-16">
        <Card className="w-full shadow-none">
          <CardHeader>
            <CardTitle className="font-sans">Log in to start selling</CardTitle>
            <CardDescription>Create a seller profile and publish your first gig.</CardDescription>
          </CardHeader>
          <CardContent><AuthDialogTrigger mode="login">Log in</AuthDialogTrigger></CardContent>
        </Card>
      </main>
    )
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 md:px-8">
      <Badge variant="secondary">Step {step} of 2</Badge>
      <h1 className="mt-4 text-4xl font-black tracking-[-0.055em]">Become a seller.</h1>
      <p className="mt-3 text-muted-foreground">Tell buyers what you do best.</p>

      <Card className="mt-8 shadow-none">
        {step === 1 ? (
          <>
            <CardHeader>
              <CardTitle className="font-sans">Seller profile</CardTitle>
              <CardDescription>Use clear details that help buyers trust your work.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" maxLength={500} onChange={(event) => setBio(event.target.value)} value={bio} /></div>
              <div className="space-y-2"><Label htmlFor="skills">Skills</Label><Input id="skills" onChange={(event) => setSkillsText(event.target.value)} placeholder="Figma, Branding, Illustration" value={skillsText} /><p className="text-xs text-muted-foreground">Separate 2–10 skills with commas.</p></div>
              <div className="space-y-2"><Label htmlFor="portfolio">Portfolio URL</Label><Input id="portfolio" onChange={(event) => setPortfolio(event.target.value)} placeholder="https://example.com" type="url" value={portfolio} /></div>
              <label className="flex items-start gap-3 text-sm"><Checkbox checked={terms} onCheckedChange={(checked) => setTerms(checked === true)} /><span>I agree to the seller terms and will provide accurate information.</span></label>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button onClick={review}>Review profile</Button>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader><CardTitle className="font-sans">Review seller profile</CardTitle><CardDescription>Confirm your details before becoming a seller.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
              <div><Badge variant="secondary">Bio</Badge><p className="mt-2 leading-7">{bio}</p></div>
              <div><Badge variant="secondary">Skills</Badge><div className="mt-2 flex flex-wrap gap-3">{skills.map((skill) => <Badge key={skill}>{skill}</Badge>)}</div></div>
              <div><Badge variant="secondary">Portfolio</Badge><p className="mt-2">{portfolio || "Not provided"}</p></div>
              <p className="text-sm text-muted-foreground">Seller terms accepted.</p>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <div className="flex gap-3"><Button onClick={submit} disabled={saving}>{saving ? "Creating..." : "Become a seller"}</Button><Button onClick={() => setStep(1)} variant="outline">Back</Button></div>
            </CardContent>
          </>
        )}
      </Card>
    </main>
  )
}
