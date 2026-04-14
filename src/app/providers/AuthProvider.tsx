import React, { createContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { auth, db } from '@/shared/config/firebase';
import type { UserProfile } from '@/shared/types/domain';
import type { AuthContextType } from '@/features/auth/types/auth.types';
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
  const profileUnsubRef       = useRef<null | (() => void)>(null);

  // Detectar modo demo al inicio (persistido en sessionStorage)
  useEffect(() => {
    if (sessionStorage.getItem(DEMO_STORAGE_KEY) === '1') {
      setProfile(DEMO_PROFILE);
      setIsDemo(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isDemo) return; // No escuchar Firebase si estamos en demo

    enableAuthPersistence().catch(console.error);
    resolveRedirectSignIn().catch((error) => {
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

  const signInWithGoogle = async () => {
    try {
      await signInWithGoogleProvider();
    } catch (error) {
      console.error('Error signing in with Google', error);
      toast.error(getFirebaseAuthMessage(error));
    }
  };

  /** Entra en modo demo sin Firebase — para desarrollo y demos */
  const signInDemo = () => {
    sessionStorage.setItem(DEMO_STORAGE_KEY, '1');
    setProfile(DEMO_PROFILE);
    setIsDemo(true);
    setLoading(false);
    toast.success('Modo demo activado 🎯');
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

  return (
    <AuthContext.Provider value={{ user, profile, loading, isDemo, signInWithGoogle, signInDemo, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
