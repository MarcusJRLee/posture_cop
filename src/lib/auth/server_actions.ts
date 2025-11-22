"use server";

import { getOrCreateSupabaseClient } from "@/lib/supabase/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/lib/auth/types";
import type { UserResponse, User as SupabaseUser } from "@supabase/supabase-js";

/** Log out the current user. */
export async function logOut() {
  const supabase = await getOrCreateSupabaseClient();
  await supabase.auth.signOut();

  // Clear the Supabase access token cookie.
  (await cookies()).delete("sb-access-token");

  // Force a full page to reload to /.
  redirect("/");
}

/** Log in a user using email and password. */
export async function logIn(email: string, password: string) {
  const supabase = await getOrCreateSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

/** Sign up a new user using email and password. */
export async function signUp(email: string, password: string) {
  const supabase = await getOrCreateSupabaseClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
}

/** Resend confirmation email to a user. */
export async function resendConfirmationEmail(email: string) {
  const supabase = await getOrCreateSupabaseClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });
  if (error) throw error;
}

/** Sign in with Google. */
export async function signInWithGoogle(redirectTo: string) {
  const supabase = await getOrCreateSupabaseClient();

  // Build the callback URL with the final destination as a query param.
  const callbackUrl = new URL("/auth/callback", redirectTo);
  callbackUrl.searchParams.set("next", new URL(redirectTo).pathname || "/");

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
    },
  });

  if (error) throw error;

  // This will redirect the user to Google
  if (data.url) {
    redirect(data.url);
  }
}

/** Get the current user. */
export async function getUser(): Promise<User | null> {
  const supabase = await getOrCreateSupabaseClient();
  const userResponse: UserResponse = await supabase.auth.getUser();
  const sbUser: SupabaseUser | null = userResponse.data.user;

  if (!sbUser || !sbUser.email || !sbUser.id) return null;

  const user: User = {
    id: sbUser.id,
    email: sbUser.email,
    created_at: sbUser.created_at,
    updated_at: sbUser.updated_at,
  };
  return user;
}
