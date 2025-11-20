"use server";

import { getOrCreateSupabaseClient } from "@/lib/supabase/client";
import { User } from "@/lib/auth/types";
import type { UserResponse, User as SupabaseUser } from "@supabase/supabase-js";

/** Get the current user. */
export async function getUser(): Promise<User | null> {
  const supabase = getOrCreateSupabaseClient();
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
