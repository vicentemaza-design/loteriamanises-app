/**
 * Feature Flags Configuration
 * Used to enable/disable specific functionalities and behaviors.
 */

export const FEATURE_FLAGS = {
  // Demo Mode: Enables simulated user data and bypasses real logic where needed
  enableDemoMode: true,

  // Logging: Enable verbose API logs for development
  enableVerboseApiLogs: true,

  // Fallback: Use fallback static data if the main provider fails
  enableFallbackData: true,

  // API Config
  requestTimeoutMs: 15000,
  
  // Experimental
  enableNewScanner: false,
};
