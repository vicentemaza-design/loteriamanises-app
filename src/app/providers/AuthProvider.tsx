import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { auth, db } from '@/shared/config/firebase';
import type { UserProfile } from '@/shared/types/domain';
import type { AuthContextType } from '@/features/auth/types/auth.types';
import { createApiClient } from '@/services/api/factory/createApiClient';
import { RUNTIME_CONFIG } from '@/config/runtime';
import {
  enableAuthPersistence,
  getFirebaseAuthMessage,
  logoutUser,
  resolveRedirectSignIn,
  signInWithGoogleProvider,
} from '@/features/auth/services/auth.service';

// ---- Perfil de demostración ----
const DEMO_PROFILE: UserProfile = {
  uid: 'demo-user',
  email: 'demo@loteriamanises.com',
  displayName: 'Usuario Demo',
  balance: 47.50,
  photoURL: undefined,
};

const DEMO_STORAGE_KEY = 'manises_demo_mode';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo]   = useState(false);
  const [redirectSignInJustCompleted, setRedirectSignInJustCompleted] = useState(false);
  const profileUnsubRef       = useRef<null | (() => void)>(null);

  // Detectar modo demo al inicio (persistido en sessionStorage)
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_STORAGE_KEY) === '1') {
      setProfile(DEMO_PROFILE);
      setIsDemo(true);
      setLoading(false);
      // El saldo demo persiste en localStorage (ver wallet.mock.ts), a
      // diferencia del resto de DEMO_PROFILE — se sincroniza aparte para que
      // un refresh de página no lo resetee al valor inicial fijo.
      createApiClient()
        .then((client) => client.wallet.getBalance('demo-user'))
        .then(({ balance }) => setProfile((prev) => prev ? { ...prev, balance } : prev))
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (isDemo) return; // No escuchar Firebase si estamos en demo

    enableAuthPersistence().catch(console.error);
    resolveRedirectSignIn()
      .then((result) => {
        // Non-null ONLY when a pending redirect sign-in (the popup-blocked
        // fallback) just resolved on this exact page load — never for a
        // plain persisted-session restore. See auth.types.ts for why this
        // distinction matters in a demo-enabled deployment.
        if (result) setRedirectSignInJustCompleted(true);
      })
      .catch((error) => {
        console.error('Redirect sign-in error:', error);
        toast.error(getFirebaseAuthMessage(error));
      });

    const timeoutId = setTimeout(() => setLoading(false), 10000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId);
      profileUnsubRef.current?.();
      profileUnsubRef.current = null;

      try {
        setUser(firebaseUser);

        if (!firebaseUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // In a demo-enabled deployment, the FUNCTIONAL dataset (balance,
        // tickets, movements...) always comes from the shared demo fixtures,
        // regardless of which real identity (Google/email) signed in. Only
        // the identity fields below reflect the real Firebase user; real
        // Firestore is intentionally not read/written for this profile.
        if (RUNTIME_CONFIG.demoEnabled) {
          const client = await createApiClient();
          const { balance } = await client.wallet.getBalance('demo-user');
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Usuario',
            balance,
            photoURL: firebaseUser.photoURL || undefined,
          });
          setLoading(false);
          return;
        }

        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef).catch((err) => {
          console.error('Error fetching user doc:', err);
          return null;
        });

        if (userDoc && !userDoc.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Usuario',
            balance: 10,
            photoURL: firebaseUser.photoURL || undefined,
          };
          await setDoc(userDocRef, {
            ...newProfile,
            createdAt: new Date().toISOString(),
          }).catch(console.error);
        }

        profileUnsubRef.current = onSnapshot(
          userDocRef,
          (snapshot) => {
            if (snapshot.exists()) setProfile(snapshot.data() as UserProfile);
          },
          console.error
        );

        setLoading(false);
      } catch (error) {
        console.error('Auth state change error:', error);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      profileUnsubRef.current?.();
      unsubscribe();
    };
  }, [isDemo]);

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const outcome = await signInWithGoogleProvider();
      return outcome === 'success';
    } catch (error) {
      console.error('Error signing in with Google', error);
      toast.error(getFirebaseAuthMessage(error));
      return false;
    }
  };

  /** Entra en modo demo sin Firebase — para desarrollo y demos */
  const signInDemo = () => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, '1');
    setProfile(DEMO_PROFILE);
    setIsDemo(true);
    setLoading(false);
    toast.success('Modo demo activado 🎯');
    // Mismo saldo persistente que el resto de la app (ver wallet.mock.ts) —
    // si ya hubo actividad demo en este navegador, respeta ese saldo en vez
    // del valor inicial fijo de DEMO_PROFILE.
    createApiClient()
      .then((client) => client.wallet.getBalance('demo-user'))
      .then(({ balance }) => setProfile((prev) => prev ? { ...prev, balance } : prev))
      .catch(console.error);
  };

  const logout = async () => {
    if (isDemo) {
      sessionStorage.removeItem(DEMO_STORAGE_KEY);
      setProfile(null);
      setUser(null);
      setIsDemo(false);
      setLoading(false);
      return;
    }
    try {
      await logoutUser();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>, options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (isDemo) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      if (!silent) toast.success('Perfil actualizado en demo 🎯');
      return;
    }
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, updates, { merge: true });
        if (!silent) toast.success('Perfil actualizado');
      } catch (err) {
        console.error('Error updating profile:', err);
        toast.error('Error al actualizar el perfil');
      }
    }
  };

  const refreshProfile = useCallback(async () => {
    if (isDemo || RUNTIME_CONFIG.demoEnabled) {
      const client = await createApiClient();
      const { balance } = await client.wallet.getBalance('demo-user');
      setProfile((prev: UserProfile | null) => prev ? { ...prev, balance } : null);
      return;
    }
    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const snapshot = await getDoc(userDocRef);
        if (snapshot.exists()) setProfile(snapshot.data() as UserProfile);
      } catch (err) {
        console.error('Error refreshing profile:', err);
      }
    }
  }, [isDemo, user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemo, redirectSignInJustCompleted, signInWithGoogle, signInDemo, logout, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
