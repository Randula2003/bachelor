export type UserRole = "buyer" | "seller"

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

export interface ConversationParticipant {
  name: string
  photoURL: string
}

export interface Conversation {
  /** Derived from the two uids, so a pair can only ever have one thread. */
  id: string
  participantIds: string[]
  /** Denormalized so the inbox renders without a lookup per row. */
  participants: Record<string, ConversationParticipant>
  /** The gig the conversation started from, kept as origin context. */
  gigId: string | null
  gigTitle: string | null
  gigSlug: string | null
  lastMessage: string
  lastSenderId: string
  lastMessageAt: Date
  /** Per-uid read receipts, used to derive the unread dot. */
  lastReadAt: Record<string, Date>
  createdAt: Date
}

export interface Message {
  id: string
  senderId: string
  body: string
  createdAt: Date
}

/** Fulfillment state. Advances only after payment clears. */
export type OrderStatus =
  | "pending_payment"
  | "in_progress"
  | "delivered"
  | "completed"
  | "cancelled"

/**
 * Payment state, kept separate from fulfillment so the gateway owns one field.
 * Clients may never write this: security rules pin it to "pending" on create and
 * reject every later change. Only trusted server code (Admin SDK, which bypasses
 * rules) moves it to "paid".
 */
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed"

export interface Order {
  id: string
  gigId: string
  gigSlug: string
  gigTitle: string
  sellerId: string
  sellerName: string
  buyerId: string
  buyerName: string
  buyerEmail: string
  /** What the buyer wants, captured at checkout. */
  requirements: string
  /** Price snapshot, so editing the gig never rewrites past orders. */
  amount: number
  dueDays: number
  status: OrderStatus
  paymentStatus: PaymentStatus
  /** Gateway transaction id. Null until a payment provider is wired up. */
  paymentRef: string | null
  createdAt: Date
  updatedAt: Date
}
