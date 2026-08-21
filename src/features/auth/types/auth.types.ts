import type { User } from 'firebase/auth';
import type { UserProfile } from '@/shared/types/domain';

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isDemo: boolean;
  signInWithGoogle: () => Promise<void>;
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
