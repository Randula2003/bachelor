import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Up to two uppercase initials from a display name, or `fallback` if there is no name. */
export function initials(name: string | null | undefined, fallback = "U") {
  return (
    (name ?? "")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || fallback
  )
}
