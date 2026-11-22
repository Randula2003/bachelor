import Link from "next/link"

import { AuthDialog } from "@/components/auth-dialog"
import { HeaderSearch } from "@/components/header-search"
import { MessagesButton } from "@/components/messages-button"

export function SiteHeader() {
  return (
    <header className="border-b border-primary/10 bg-background/90">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-6 px-6 md:px-10">
        <div className="flex min-w-0 flex-1 items-center gap-6">
          <Link className="shrink-0 text-2xl font-black tracking-[-0.06em]" href="/" prefetch={false}>
            bachelor<span className="text-primary">.</span>
          </Link>
          <HeaderSearch />
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <nav className="hidden items-center gap-3 sm:flex">
            <MessagesButton />
          </nav>
          <AuthDialog />
        </div>
      </div>
    </header>
  )
}
