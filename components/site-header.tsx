import Link from "next/link"
import { Bell, Heart, MessageCircle, Search } from "lucide-react"

import { AuthDialog } from "@/components/auth-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SiteHeader() {
  return (
    <header className="border-b border-primary/10 bg-background/90">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-6 md:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <Link className="shrink-0 text-2xl font-black tracking-[-0.06em]" href="/">
            bachelor<span className="text-primary">.</span>
          </Link>
          <div className="relative hidden w-full max-w-md sm:block">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search"
              className="h-10 px-4 pl-10"
              placeholder="Search talent and skills"
              type="search"
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <nav className="hidden items-center gap-3 sm:flex">
            <Button aria-label="Messages" className="border-0 shadow-none" size="icon" variant="ghost">
              <MessageCircle />
            </Button>
            <Button aria-label="Notifications" className="border-0 shadow-none" size="icon" variant="ghost">
              <Bell />
            </Button>
            <Button aria-label="Favorites" className="border-0 shadow-none" size="icon" variant="ghost">
              <Heart />
            </Button>
          </nav>
          <AuthDialog />
        </div>
      </div>
    </header>
  )
}
