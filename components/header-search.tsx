"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

/** Header search box: submits to the gigs page, which filters on `?q=`. */
export function HeaderSearch() {
  const router = useRouter()
  const [value, setValue] = useState("")

  return (
    <form
      className="relative hidden w-full max-w-md sm:block"
      onSubmit={(event) => {
        event.preventDefault()
        const query = value.trim()
        router.push(query ? `/gigs?q=${encodeURIComponent(query)}` : "/gigs")
      }}
      role="search"
    >
      <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label="Search gigs"
        className="h-10 px-4 pl-10"
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search gigs and skills"
        type="search"
        value={value}
      />
    </form>
  )
}
