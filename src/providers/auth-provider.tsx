import type { Session, User } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { supabase } from "@/src/data/supabase/client";
import {
  ensureProfile,
  fetchProfile,
  type Profile,
} from "@/src/services/profile-service";

type AuthContextValue = {
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  session: Session | null;
  user: User | null;
};

const AuthContext = createContext<AuthContextValue>({
  loading: true,
  profile: null,
  refreshProfile: async () => undefined,
  session: null,
  user: null,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    const currentUser = session?.user;

    if (!currentUser) {
      setProfile(null);
      return;
    }

    setProfile(await fetchProfile(currentUser.id));
  }, [session?.user]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialSession() {
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;

      if (!mounted) {
        return;
      }

      setSession(currentSession);
      if (currentSession?.user) {
        setProfile(await ensureProfile(currentSession.user));
      }
      setLoading(false);
    }

    loadInitialSession().catch((error) => {
      console.warn("Failed to load session", error);
      if (mounted) {
        setLoading(false);
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (!nextSession?.user) {
        setProfile(null);
        return;
      }

      ensureProfile(nextSession.user)
        .then(setProfile)
        .catch((error) => console.warn("Failed to ensure profile", error));
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      profile,
      refreshProfile,
      session,
      user: session?.user ?? null,
    }),
    [loading, profile, refreshProfile, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
