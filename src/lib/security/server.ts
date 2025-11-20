/** Ensure the code is running on the server. */
export function ensureServerSide() {
  if (typeof window === "undefined") {
    return;
  }
  throw new Error(
    "ensureServerSide() must not be called on the client. This function is intended for server-side use only."
  );
}
