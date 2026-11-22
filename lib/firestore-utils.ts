import type { Timestamp } from "firebase/firestore"

/**
 * Converts a Firestore Timestamp to a Date. Missing values map to the epoch so
 * sorting and comparisons never throw. Read snapshots with
 * `{ serverTimestamps: "estimate" }` to avoid epoch values for pending writes.
 */
export function toDate(value: unknown): Date {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate()
  }
  return value instanceof Date ? value : new Date(0)
}
