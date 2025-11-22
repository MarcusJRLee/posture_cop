import { CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ensureServerSide } from "@/lib/security/server";

// Ensure that this file is only imported on the server.
ensureServerSide();

interface Cookie {
  name: string;
  value: string;
  options?: CookieOptions;
}

/** Get the Supabase client with cookie-based session handling. */
export async function getOrCreateSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Cookie[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (reason: unknown) {
            console.error("setAll error: ", reason);
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
