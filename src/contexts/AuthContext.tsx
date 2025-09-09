import { createContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

export type UserType = "Medical" | "Dental";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userType: UserType | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userType: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper to load user profile from user_profiles table
    const loadUserProfile = async (userId: string) => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("type")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        setUserType(null);
      } else {
        setUserType(data?.type as UserType);
      }
    };

    // Initial session check
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (session) {
          setSession(session);
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error loading auth session:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Setup auto refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id);
        }
      } else if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
        setUserType(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, userType, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
export type { AuthContextType };
