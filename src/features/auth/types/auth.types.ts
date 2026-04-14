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
}
