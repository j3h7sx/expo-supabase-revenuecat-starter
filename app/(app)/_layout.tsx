import { Redirect, Stack } from "expo-router";

import { useAuth } from "@/src/providers/auth-provider";

export default function AppLayout() {
  const { loading, profile, user } = useAuth();

  if (!loading && !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!loading && profile && !profile.onboarding_completed) {
    return (
      <Redirect
        href={`/(onboarding)/${profile.current_onboarding_step ?? "welcome"}`}
      />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
