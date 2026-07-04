import { fetchProfile } from "@/src/services/profile-service";

const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1500;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForProfileEntitlement(userId: string) {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    const profile = await fetchProfile(userId);

    if (profile.has_active_entitlement) {
      return profile;
    }

    await delay(POLL_INTERVAL_MS);
  }

  return fetchProfile(userId);
}
