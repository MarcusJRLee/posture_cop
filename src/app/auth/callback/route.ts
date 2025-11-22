import { getOrCreateSupabaseClient } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

/** Handle the callback from the OAuth provider. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextUrl = searchParams.get("next") ?? "/";

  // If possible, exchange the code for a session.
  if (code) {
    const supabase = await getOrCreateSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${nextUrl}`);
    }
  }

  // Return the user to an error page with instructions.
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
