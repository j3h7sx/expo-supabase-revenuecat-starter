import {
  CustomPurchaseControllerProvider,
  SuperwallLoaded,
  SuperwallLoading,
  SuperwallProvider,
  useUser,
  type CustomPurchaseControllerContext,
} from "expo-superwall";
import { useEffect, useMemo, type PropsWithChildren } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import Purchases, { type CustomerInfo } from "react-native-purchases";

import { env } from "@/src/config/env";
import { useAuth } from "@/src/providers/auth-provider";
import {
  findRevenueCatProduct,
  getActiveRevenueCatEntitlementIds,
  getRevenueCatCustomerInfo,
  hasRevenueCatEntitlement,
  identifyRevenueCatUser,
  signOutRevenueCatUser,
  subscribeToRevenueCatCustomerInfo,
} from "@/src/services/revenuecat-service";
import { waitForProfileEntitlement } from "@/src/services/subscription-service";
import { colors } from "@/src/theme";

function isUserCancelledPurchase(error: unknown) {
  if (!error || typeof error !== "object" || !("userCancelled" in error)) {
    return false;
  }

  return Boolean((error as { userCancelled?: unknown }).userCancelled);
}

function toSuperwallEntitlements(customerInfo: CustomerInfo) {
  return getActiveRevenueCatEntitlementIds(customerInfo).map((id) => ({
    id,
    type: "SERVICE_LEVEL" as const,
  }));
}

function RevenueCatSuperwallSync() {
  const { profile, refreshProfile, user } = useAuth();
  const { identify, setSubscriptionStatus, signOut, update } = useUser();

  useEffect(() => {
    if (!user) {
      void signOut();
      void signOutRevenueCatUser();
      void setSubscriptionStatus({ status: "UNKNOWN" });
      return;
    }

    void identify(user.id, { restorePaywallAssignments: true });
    void update({
      email: user.email,
      onboardingCompleted: profile?.onboarding_completed ?? false,
      supabaseUserId: user.id,
    });
    void identifyRevenueCatUser(user.id);
  }, [identify, profile?.onboarding_completed, setSubscriptionStatus, signOut, update, user]);

  useEffect(() => {
    let mounted = true;

    async function syncCustomerInfo(customerInfo: CustomerInfo | null) {
      if (!mounted || !customerInfo) {
        return;
      }

      const entitlements = toSuperwallEntitlements(customerInfo);
      await setSubscriptionStatus(
        entitlements.length > 0
          ? { status: "ACTIVE", entitlements }
          : { status: "INACTIVE" }
      );

      if (user && hasRevenueCatEntitlement(customerInfo)) {
        await waitForProfileEntitlement(user.id);
        await refreshProfile();
      }
    }

    getRevenueCatCustomerInfo()
      .then(syncCustomerInfo)
      .catch((error) => console.warn("RevenueCat sync failed", error));

    const unsubscribe = subscribeToRevenueCatCustomerInfo((customerInfo) => {
      void syncCustomerInfo(customerInfo);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [refreshProfile, setSubscriptionStatus, user]);

  return null;
}

function createPurchaseController(
  userId: string | null,
  refreshProfile: () => Promise<void>
): CustomPurchaseControllerContext {
  return {
    onPurchase: async ({ productId, platform }) => {
      if (platform !== "ios" || Platform.OS !== "ios") {
        return {
          type: "failed",
          error: "This starter is configured for iOS purchases first.",
        };
      }

      try {
        const product = await findRevenueCatProduct(productId);

        if (!product) {
          return {
            type: "failed",
            error: `RevenueCat product not found for ${productId}.`,
          };
        }

        const result = await Purchases.purchaseStoreProduct(product);

        if (userId && hasRevenueCatEntitlement(result.customerInfo)) {
          await waitForProfileEntitlement(userId);
          await refreshProfile();
        }

        return { type: "purchased" };
      } catch (error) {
        if (isUserCancelledPurchase(error)) {
          return { type: "cancelled" };
        }

        return {
          type: "failed",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
    onPurchaseRestore: async () => {
      try {
        const customerInfo = await Purchases.restorePurchases();

        if (userId && hasRevenueCatEntitlement(customerInfo)) {
          await waitForProfileEntitlement(userId);
          await refreshProfile();
        }

        return { type: "restored" };
      } catch (error) {
        return {
          type: "failed",
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}

export function RevenueCatSuperwallProvider({ children }: PropsWithChildren) {
  const { refreshProfile, user } = useAuth();
  const controller = useMemo(
    () => createPurchaseController(user?.id ?? null, refreshProfile),
    [refreshProfile, user?.id]
  );

  return (
    <CustomPurchaseControllerProvider controller={controller}>
      <SuperwallProvider apiKeys={{ ios: env.superwallIosApiKey }}>
        <SuperwallLoading>
          <View
            style={{
              alignItems: "center",
              backgroundColor: colors.background,
              flex: 1,
              justifyContent: "center",
            }}
          >
            <ActivityIndicator color={colors.primary} />
          </View>
        </SuperwallLoading>
        <SuperwallLoaded>
          <RevenueCatSuperwallSync />
          {children}
        </SuperwallLoaded>
      </SuperwallProvider>
    </CustomPurchaseControllerProvider>
  );
}
