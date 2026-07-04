import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

import { env } from "@/src/config/env";

let configured = false;

export function isGoogleSignInConfigured() {
  return Boolean(env.googleWebClientId || env.googleIosClientId);
}

export function configureGoogleSignIn() {
  if (configured || !isGoogleSignInConfigured()) {
    return;
  }

  GoogleSignin.configure({
    iosClientId: env.googleIosClientId || undefined,
    webClientId: env.googleWebClientId || undefined,
  });
  configured = true;
}

export async function getGoogleIdToken() {
  configureGoogleSignIn();

  const response = await GoogleSignin.signIn();

  if (response.type === "cancelled") {
    return null;
  }

  if (!response.data.idToken) {
    throw new Error("Google did not return an ID token.");
  }

  return response.data.idToken;
}

export function isGoogleSignInCancelled(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return error.code === statusCodes.SIGN_IN_CANCELLED;
}
