export function isAbortError(error: unknown) {
  const value =
    error && typeof error === "object"
      ? (error as { message?: unknown; name?: unknown })
      : null
  const message = typeof value?.message === "string" ? value.message.toLowerCase() : ""
  const name = typeof value?.name === "string" ? value.name : ""

  return (
    name === "AbortError" ||
    message.includes("aborted a request") ||
    message.includes("signal is aborted")
  )
}
