export type AuthMode = "login" | "signup"

export const openAuthDialogEvent = "open-auth-dialog"

/** Opens the global login/signup dialog rendered by <AuthDialog /> in the header. */
export function openAuthDialog(mode: AuthMode = "login") {
  window.dispatchEvent(new CustomEvent<AuthMode>(openAuthDialogEvent, { detail: mode }))
}
