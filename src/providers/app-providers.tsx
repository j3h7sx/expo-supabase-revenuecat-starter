import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { PropsWithChildren } from "react";

import "@/src/i18n";

import { AppAccessProvider } from "@/src/presentation/contexts/app-access-context";
import { AuthProvider } from "@/src/providers/auth-provider";
import { RevenueCatSuperwallProvider } from "@/src/providers/revenuecat-superwall-provider";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RevenueCatSuperwallProvider>
            <AppAccessProvider>{children}</AppAccessProvider>
          </RevenueCatSuperwallProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
