import type { Session, User } from "@supabase/supabase-js";
import { useEffect, useRef, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabaseClient";
import { ensureProfile, loadPlayerSave, mergeProgress, upsertPlayerSave } from "../services/playerSave";
import { useGameStore } from "../state/useGameStore";

type AuthStatus = "disabled" | "loading" | "guest" | "syncing" | "signed-in" | "error";

export type AuthState = {
  configured: boolean;
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

export function useAuth(): AuthState {
  const configured = isSupabaseConfigured();
  const [status, setStatus] = useState<AuthStatus>(configured ? "loading" : "disabled");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeUserId = useRef<string | null>(null);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setStatus("disabled");
      return;
    }

    let cancelled = false;

    async function hydrate(nextSession: Session | null) {
      setSession(nextSession);
      setError(null);

      if (!nextSession?.user) {
        activeUserId.current = null;
        setStatus("guest");
        return;
      }

      activeUserId.current = nextSession.user.id;
      setStatus("syncing");

      try {
        await ensureProfile(nextSession.user);
        const cloudProgress = await loadPlayerSave(nextSession.user.id);
        const localProgress = useGameStore.getState().progress;
        const nextProgress = cloudProgress ? mergeProgress(localProgress, cloudProgress) : localProgress;
        useGameStore.getState().replaceProgressFromCloud(nextProgress);
        await upsertPlayerSave(nextSession.user.id, nextProgress);
        if (!cancelled) setStatus("signed-in");
      } catch (syncError) {
        if (!cancelled) {
          setError(syncError instanceof Error ? syncError.message : "Cloud save sync failed.");
          setStatus("error");
        }
      }
    }

    supabase.auth.getSession().then(({ data }) => hydrate(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void hydrate(nextSession);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!configured) return undefined;

    return useGameStore.subscribe((state) => {
      const userId = activeUserId.current;
      if (!userId) return;

      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
      }

      saveTimer.current = window.setTimeout(() => {
        void upsertPlayerSave(userId, state.progress).catch((saveError) => {
          setError(saveError instanceof Error ? saveError.message : "Cloud save failed.");
          setStatus("error");
        });
      }, 700);
    });
  }, [configured]);

  async function signIn(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setStatus("loading");
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setStatus("guest");
    }
  }

  async function signUp(email: string, password: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    setStatus("loading");
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      setStatus("guest");
      return;
    }

    if (!data.session) {
      setError("Account created. Check your email if confirmation is enabled, then sign in.");
      setStatus("guest");
    }
  }

  async function signOut() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    activeUserId.current = null;
    setSession(null);
    setStatus("guest");
  }

  return {
    configured,
    status,
    user: session?.user ?? null,
    session,
    error,
    signIn,
    signUp,
    signOut,
  };
}
