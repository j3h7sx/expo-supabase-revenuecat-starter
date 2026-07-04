import * as AppleAuthentication from "expo-apple-authentication";
import { Redirect } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/src/components/Button";
import { Screen } from "@/src/components/Screen";
import { isSupabaseConfigured } from "@/src/config/env";
import { supabase } from "@/src/data/supabase/client";
import { useAuth } from "@/src/providers/auth-provider";
import {
  getGoogleIdToken,
  isGoogleSignInCancelled,
  isGoogleSignInConfigured,
} from "@/src/services/google-auth-service";
import { colors, radius, spacing } from "@/src/theme";

export default function SignInScreen() {
  const { profile, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (user && profile) {
    return <Redirect href="/" />;
  }

  async function signInWithEmail() {
    if (!isSupabaseConfigured()) {
      Alert.alert("Missing Supabase env", "Fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      Alert.alert("Could not sign in", error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    if (!isSupabaseConfigured()) {
      Alert.alert("Missing Supabase env", "Fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      Alert.alert("Could not create account", error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithApple() {
    if (!isSupabaseConfigured()) {
      Alert.alert("Missing Supabase env", "Fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.");
      return;
    }

    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        throw new Error("Apple did not return an identity token.");
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "apple",
        token: credential.identityToken,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "ERR_REQUEST_CANCELED"
      ) {
        return;
      }

      Alert.alert("Apple Sign-In failed", error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured()) {
      Alert.alert(
        "Missing Supabase env",
        "Fill EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env."
      );
      return;
    }

    if (!isGoogleSignInConfigured()) {
      Alert.alert(
        "Missing Google env",
        "Fill EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID and EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME in .env."
      );
      return;
    }

    setLoading(true);
    try {
      const idToken = await getGoogleIdToken();

      if (!idToken) {
        return;
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      if (isGoogleSignInCancelled(error)) {
        return;
      }

      Alert.alert(
        "Google Sign-In failed",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Starter app</Text>
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.body}>
            Supabase is the required identity layer. Apple and email auth are
            wired as the first iOS-friendly defaults.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            value={email}
          />
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={colors.mutedText}
            secureTextEntry
            style={styles.input}
            value={password}
          />
          <Button loading={loading} onPress={signInWithEmail} title="Sign in" />
          <Button
            disabled={loading}
            onPress={createAccount}
            title="Create account"
            variant="secondary"
          />
          <Button
            disabled={loading}
            onPress={signInWithApple}
            title="Continue with Apple"
            variant="secondary"
          />
          <Button
            disabled={loading}
            onPress={signInWithGoogle}
            title="Continue with Google"
            variant="secondary"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 23,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    gap: spacing.xl,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  form: {
    gap: spacing.sm,
  },
  header: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 38,
    fontWeight: "800",
    lineHeight: 42,
  },
});
