import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type CustomerInfoUpdateListener,
} from "react-native-purchases";

import { env } from "@/src/config/env";

let configured = false;

export function getActiveRevenueCatEntitlementIds(customerInfo: CustomerInfo) {
  return Object.keys(customerInfo.entitlements.active ?? {});
}

export function hasRevenueCatEntitlement(customerInfo: CustomerInfo) {
  return getActiveRevenueCatEntitlementIds(customerInfo).includes(
    env.revenueCatEntitlementId
  );
}

export async function configureRevenueCat() {
  if (configured || Platform.OS !== "ios" || !env.revenueCatIosApiKey) {
    return;
  }

  if (__DEV__) {
    await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  }

  Purchases.configure({
    apiKey: env.revenueCatIosApiKey,
    appUserID: null,
  });
  configured = true;
}

export async function identifyRevenueCatUser(userId: string) {
  await configureRevenueCat();

  if (!configured) {
    return;
  }

  await Purchases.logIn(userId);
}

export async function signOutRevenueCatUser() {
  if (!configured) {
    return;
  }

  await Purchases.logOut();
}

export async function getRevenueCatCustomerInfo() {
  await configureRevenueCat();
  return configured ? Purchases.getCustomerInfo() : null;
}

export function subscribeToRevenueCatCustomerInfo(
  listener: CustomerInfoUpdateListener
) {
  if (!configured) {
    return () => undefined;
  }

  Purchases.addCustomerInfoUpdateListener(listener);

  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export async function findRevenueCatProduct(productId: string) {
  await configureRevenueCat();

  if (!configured) {
    return null;
  }

  const offerings = await Purchases.getOfferings();
  const packages = Object.values(offerings.all).flatMap(
    (offering) => offering.availablePackages
  );

  return (
    packages.find((item) => item.product.identifier === productId)?.product ??
    null
  );
}
