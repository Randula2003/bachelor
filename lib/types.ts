export type UserRole = "buyer" | "seller" | "both"

export interface SellerProfile {
  bio: string
  skills: string[]
  portfolio: string
  verified: boolean
  rating: number
  reviewCount: number
  createdAt: Date
}

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  photoURL: string
  role: UserRole
  sellerProfile: SellerProfile | null
  createdAt: Date
  updatedAt?: Date
}

export type GigStatus = "draft" | "published" | "paused" | "closed"
export type GigCategory = "Design" | "Development" | "Research" | "Marketing" | "Writing"
export type GigLevel = "Beginner friendly" | "Intermediate" | "Advanced"

export interface Gig {
  id: string
  authorId: string
  authorName: string
  authorInitials: string
  title: string
  description: string
  category: GigCategory
  budget: number
  deadline: string
  dueDays: number
  level: GigLevel
  skills: string[]
  status: GigStatus
  slug: string
  thumbnailPosition: string
  rating: number
  reviewCount: number
  createdAt: Date
  updatedAt: Date
}

export type ApplicationStatus = "pending" | "accepted" | "rejected"

export interface Application {
  id: string
  gigId: string
  applicantId: string
  applicantName: string
  applicantEmail: string
  message: string
  status: ApplicationStatus
  createdAt: Date
}
