import type { User } from "@supabase/supabase-js";

import { supabase } from "@/src/data/supabase/client";

export type SubscriptionStatus =
  | "unknown"
  | "free"
  | "active"
  | "trialing"
  | "expired"
  | "cancelled";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  onboarding_completed: boolean;
  current_onboarding_step: string | null;
  has_active_entitlement: boolean;
  subscription_status: SubscriptionStatus;
  revenuecat_app_user_id: string | null;
  revenuecat_entitlement_ids: string[] | null;
  subscription_product_id: string | null;
  subscription_expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export async function ensureProfile(user: User) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        revenuecat_app_user_id: user.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )
    .select("*")
    .single<Profile>();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single<Profile>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfileOnboarding(
  userId: string,
  updates: Pick<Profile, "current_onboarding_step" | "onboarding_completed">
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
}
