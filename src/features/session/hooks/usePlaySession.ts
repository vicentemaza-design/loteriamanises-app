import { usePlaySessionContext } from '../context/PlaySessionContext';

export function usePlaySession() {
  return usePlaySessionContext();
}
