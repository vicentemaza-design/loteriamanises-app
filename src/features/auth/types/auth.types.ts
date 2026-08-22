import type { User } from 'firebase/auth';
import type { UserProfile } from '@/shared/types/domain';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  /**
   * True for exactly one render window right after `getRedirectResult`
   * resolves a real, just-completed Google redirect sign-in (the
   * popup-blocked fallback) — as opposed to `user` merely being restored
   * from a persisted session on a cold load. PublicLayout uses this as the
   * one legitimate exception to let a demo-environment visit bypass the
   * "Login must stay visible" rule: see PublicLayout.tsx.
   */
  redirectSignInJustCompleted: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signInDemo: () => void;
  logout: () => Promise<void>;
  /**
   * `silent: true` suppresses the built-in success toast (default copy
   * "Perfil actualizado") so a caller can show its own feedback instead —
   * e.g. the profile-change-verification flow shows "Datos actualizados"
   * after the confirmation modal closes. Error feedback is never suppressed.
   */
  updateProfile: (updates: Partial<UserProfile>, options?: { silent?: boolean }) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
