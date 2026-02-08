"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createClient } from "./supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  email: string;
}

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

function getClient(): SupabaseClient {
  return createClient();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const clientRef = useRef<SupabaseClient | null>(null);

  // Lazily initialize client on mount (client-side only)
  function sb(): SupabaseClient {
    if (!clientRef.current) clientRef.current = getClient();
    return clientRef.current;
  }

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await sb()
      .from("profiles")
      .select("id, username, email")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }, []);

  useEffect(() => {
    const supabase = sb();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) fetchProfile(u.id);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        fetchProfile(u.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = useCallback(async (email: string, password: string, username: string): Promise<string | null> => {
    const supabase = sb();
    // Check username uniqueness first
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.toLowerCase().trim())
      .maybeSingle();

    if (existing) return "Username is already taken.";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username.toLowerCase().trim() },
      },
    });
    if (error) return error.message;
    return null;
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await sb().auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await sb().auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = "/auth/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
