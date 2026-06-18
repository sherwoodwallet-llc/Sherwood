"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import {
  getDb,
  getFirebaseAuth,
  isFirebaseConfigured,
  MASTER_EMAIL,
} from "./firebase";

export type ManagerProfile = {
  email: string;
  name: string;
  initials: string;
};

type AuthContextValue = {
  configured: boolean;
  loading: boolean;
  user: User | null;
  isMaster: boolean;
  profile: ManagerProfile | null;
  needsProfile: boolean;
  linkSent: boolean;
  pendingEmail: string;
  error: string | null;
  sendLink: (email: string) => Promise<void>;
  saveProfile: (name: string, initials: string) => Promise<void>;
  resetLogin: () => void;
  refreshSession: (options?: { silent?: boolean }) => Promise<boolean>;
  signOutUser: () => Promise<void>;
};

const STORAGE_EMAIL_KEY = "sherwood:pendingEmail";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const configured = isFirebaseConfigured;

  const readPendingEmail = useCallback(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(STORAGE_EMAIL_KEY) ?? "";
  }, []);

  const loadProfile = useCallback(async (current: User) => {
    try {
      const ref = doc(getDb(), "managers", current.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data() as Partial<ManagerProfile>;
        setProfile({
          email: data.email ?? current.email ?? "",
          name: data.name ?? "",
          initials: data.initials ?? "",
        });
      } else {
        setProfile(null);
      }
    } catch {
      // Firestore may not be ready yet; treat as a new user needing profile setup.
      setProfile(null);
    }
  }, []);

  // Complete a magic-link sign-in if the user arrived from their email.
  const completeSignInFromUrl = useCallback(
    async (emailOverride?: string) => {
      if (!configured) return false;
      const auth = getFirebaseAuth();
      if (typeof window === "undefined") return false;
      if (!isSignInWithEmailLink(auth, window.location.href)) return false;

      let email = emailOverride || readPendingEmail();
      if (!email) return false;

      try {
        await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem(STORAGE_EMAIL_KEY);
        setPendingEmail("");
        setLinkSent(false);
        window.history.replaceState({}, document.title, window.location.pathname);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Could not complete sign-in.",
        );
        return false;
      }
    },
    [configured, readPendingEmail],
  );

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    const storedEmail = readPendingEmail();
    if (storedEmail) {
      setPendingEmail(storedEmail);
      setLinkSent(true);
    }

    const auth = getFirebaseAuth();
    let unsub: (() => void) | undefined;

    completeSignInFromUrl(storedEmail || undefined).finally(() => {
      unsub = onAuthStateChanged(auth, async (next) => {
        setUser(next);
        try {
          if (next) {
            await loadProfile(next);
            setLinkSent(false);
            setPendingEmail("");
            window.localStorage.removeItem(STORAGE_EMAIL_KEY);
          } else {
            setProfile(null);
          }
        } finally {
          setLoading(false);
        }
      });
    });

    return () => {
      if (unsub) unsub();
    };
  }, [configured, completeSignInFromUrl, loadProfile, readPendingEmail]);

  const sendLink = useCallback(
    async (email: string) => {
      setError(null);
      const trimmed = email.trim().toLowerCase();
      if (!trimmed) {
        setError("Enter your email.");
        return;
      }
      try {
        const auth = getFirebaseAuth();
        await sendSignInLinkToEmail(auth, trimmed, {
          url: window.location.origin,
          handleCodeInApp: true,
        });
        window.localStorage.setItem(STORAGE_EMAIL_KEY, trimmed);
        setPendingEmail(trimmed);
        setLinkSent(true);
      } catch (err) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code: string }).code)
            : "";
        if (code === "auth/configuration-not-found") {
          setError(
            "Email link sign-in is not enabled yet. In Firebase console: Authentication → Sign-in method → Email/Password → enable it, then turn on Email link (passwordless sign-in).",
          );
        } else {
          setError(
            err instanceof Error ? err.message : "Could not send the sign-in link.",
          );
        }
      }
    },
    [],
  );

  const saveProfile = useCallback(
    async (name: string, initials: string) => {
      if (!user) return;
      const ref = doc(getDb(), "managers", user.uid);
      const payload: ManagerProfile = {
        email: user.email ?? "",
        name: name.trim(),
        initials: initials.trim().toUpperCase(),
      };
      await setDoc(
        ref,
        { ...payload, createdAt: serverTimestamp() },
        { merge: true },
      );
      setProfile(payload);
    },
    [user],
  );

  const resetLogin = useCallback(() => {
    setLinkSent(false);
    setPendingEmail("");
    setError(null);
    window.localStorage.removeItem(STORAGE_EMAIL_KEY);
  }, []);

  const refreshSession = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) setError(null);
      const auth = getFirebaseAuth();

      const completed = await completeSignInFromUrl(
        pendingEmail || readPendingEmail(),
      );
      if (completed && auth.currentUser) return true;

      const current = auth.currentUser;
      if (current) {
        setUser(current);
        await loadProfile(current);
        setLinkSent(false);
        setPendingEmail("");
        window.localStorage.removeItem(STORAGE_EMAIL_KEY);
        return true;
      }

      if (!options?.silent) {
        setError(
          "Not signed in yet. Open the link in your email on this device, then try again.",
        );
      }
      return false;
    },
    [completeSignInFromUrl, loadProfile, pendingEmail, readPendingEmail],
  );

  const signOutUser = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setProfile(null);
    setLinkSent(false);
    setPendingEmail("");
    window.localStorage.removeItem(STORAGE_EMAIL_KEY);
  }, []);

  const isMaster = Boolean(
    user?.email && user.email.toLowerCase() === MASTER_EMAIL.toLowerCase(),
  );

  const needsProfile = Boolean(
    user && !isMaster && (!profile || !profile.name || !profile.initials),
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      configured,
      loading,
      user,
      isMaster,
      profile,
      needsProfile,
      linkSent,
      pendingEmail,
      error,
      sendLink,
      saveProfile,
      resetLogin,
      refreshSession,
      signOutUser,
    }),
    [
      configured,
      loading,
      user,
      isMaster,
      profile,
      needsProfile,
      linkSent,
      pendingEmail,
      error,
      sendLink,
      saveProfile,
      resetLogin,
      refreshSession,
      signOutUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
