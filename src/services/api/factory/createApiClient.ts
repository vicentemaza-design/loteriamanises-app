import { RUNTIME_CONFIG } from '@/config/runtime';
import type { IApiProvider } from '../providers/api.provider';

/**
 * createApiClient
 * Factory function that returns the active implementation of the IApiProvider.
 */
export async function createApiClient(): Promise<IApiProvider> {
  const providerType = RUNTIME_CONFIG.apiProvider;

  switch (providerType) {
    case 'mock': {
      const { MockAdapter } = await import('../adapters/mock/mock.adapter');
      return new MockAdapter();
    }
    
    case 'firebase': {
      const { FirebaseAdapter } = await import('../adapters/firebase/firebase.adapter');
      return new FirebaseAdapter();
    }
    
    case 'http':
      throw new Error('HttpAdapter not yet implemented');
      
    default:
      throw new Error(`Unknown API Provider: ${providerType}`);
  }
}
