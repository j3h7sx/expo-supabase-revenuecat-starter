import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from "react";

import { useAuth } from "@/src/providers/auth-provider";
import {
  resolveAppAccessMode,
  type AppAccessMode,
} from "@/src/services/app-access-service";
import type { Profile } from "@/src/services/profile-service";

type AppAccessContextValue = {
  accessMode: AppAccessMode;
  canWrite: boolean;
  isLocked: boolean;
  isPaywallBlocked: boolean;
  loading: boolean;
  profile: Profile | null;
};

const AppAccessContext = createContext<AppAccessContextValue>({
  accessMode: "full",
  canWrite: true,
  isLocked: false,
  isPaywallBlocked: false,
  loading: true,
  profile: null,
});

export function AppAccessProvider({ children }: PropsWithChildren) {
  const { loading, profile } = useAuth();

  const value = useMemo<AppAccessContextValue>(() => {
    const accessMode = resolveAppAccessMode(profile);

    return {
      accessMode,
      canWrite: accessMode === "full",
      isLocked: accessMode !== "full",
      isPaywallBlocked: accessMode === "paywall_blocked",
      loading,
      profile,
    };
  }, [loading, profile]);

  return (
    <AppAccessContext.Provider value={value}>
      {children}
    </AppAccessContext.Provider>
  );
}

export function useAppAccess() {
  return useContext(AppAccessContext);
}
