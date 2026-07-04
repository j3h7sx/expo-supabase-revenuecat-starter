function readPublicEnv(name: string, fallback = "") {
  return process.env[name] ?? fallback;
}

export const env = {
  supabaseUrl: readPublicEnv("EXPO_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: readPublicEnv("EXPO_PUBLIC_SUPABASE_ANON_KEY"),
  googleWebClientId: readPublicEnv("EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"),
  googleIosClientId: readPublicEnv("EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"),
  googleIosUrlScheme: readPublicEnv(
    "EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME",
    "com.googleusercontent.apps.your-reversed-ios-client-id"
  ),
  superwallIosApiKey: readPublicEnv("EXPO_PUBLIC_SUPERWALL_IOS_API_KEY"),
  superwallOnboardingPlacement: readPublicEnv(
    "EXPO_PUBLIC_SUPERWALL_ONBOARDING_PLACEMENT",
    "onboarding_paywall"
  ),
  superwallLockedFeaturePlacement: readPublicEnv(
    "EXPO_PUBLIC_SUPERWALL_LOCKED_FEATURE_PLACEMENT",
    "locked_feature"
  ),
  revenueCatIosApiKey: readPublicEnv("EXPO_PUBLIC_REVENUECAT_IOS_API_KEY"),
  revenueCatEntitlementId: readPublicEnv(
    "EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID",
    "pro"
  ),
};

export function isSupabaseConfigured() {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function assertPublicEnv() {
  const missing = [
    ["EXPO_PUBLIC_SUPABASE_URL", env.supabaseUrl],
    ["EXPO_PUBLIC_SUPABASE_ANON_KEY", env.supabaseAnonKey],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    throw new Error(
      `Missing required env vars: ${missing.map(([name]) => name).join(", ")}`
    );
  }
}
