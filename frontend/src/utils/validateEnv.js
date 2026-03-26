/**
 * Environment Configuration Validator
 * 
 * Validates required environment variables on app startup.
 * Logs warnings for optional vars and throws errors for required vars in production.
 */

const ENV_CONFIG = {
  // Required in all environments
  required: [
    {
      key: 'VITE_API_URL',
      description: 'Backend API URL',
      example: 'http://localhost:8081/api',
    },
  ],
  
  // Optional but recommended
  optional: [
    {
      key: 'VITE_WS_URL',
      description: 'WebSocket URL for real-time updates',
      example: 'http://localhost:8081',
    },
    {
      key: 'VITE_GOOGLE_CLIENT_ID',
      description: 'Google OAuth Client ID',
      example: 'your-client-id.apps.googleusercontent.com',
    },
  ],
  
  // Feature flags with defaults
  featureFlags: [
    {
      key: 'VITE_ENABLE_MOCK_DATA',
      description: 'Enable mock data for development',
      default: 'false',
    },
    {
      key: 'VITE_ENABLE_SERVICE_WORKER',
      description: 'Enable PWA service worker',
      default: 'true',
    },
    {
      key: 'VITE_ENABLE_ANALYTICS',
      description: 'Enable analytics tracking',
      default: 'false',
    },
  ],
};

/**
 * Validates environment configuration and logs results
 * @param {boolean} strictMode - If true, throws errors for missing required vars
 * @returns {Object} Validation result with errors and warnings
 */
export function validateEnvironment(strictMode = import.meta.env.PROD) {
  const errors = [];
  const warnings = [];
  const config = {};

  // Check required variables
  ENV_CONFIG.required.forEach(({ key, description, example }) => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '') {
      errors.push(`Missing required env var: ${key} (${description}). Example: ${example}`);
    } else {
      config[key] = value;
    }
  });

  // Check optional variables
  ENV_CONFIG.optional.forEach(({ key, description, example }) => {
    const value = import.meta.env[key];
    if (!value || value.trim() === '' || value === 'your_google_client_id_here') {
      warnings.push(`Optional env var not set: ${key} (${description})`);
    } else {
      config[key] = value;
    }
  });

  // Check feature flags (these have defaults, just log for awareness)
  ENV_CONFIG.featureFlags.forEach(({ key, description, default: defaultValue }) => {
    const value = import.meta.env[key] ?? defaultValue;
    config[key] = value;
  });

  // Production-specific checks
  if (import.meta.env.PROD) {
    // Check for localhost in production
    if (config.VITE_API_URL?.includes('localhost')) {
      warnings.push('VITE_API_URL contains localhost - update for production');
    }
    if (config.VITE_WS_URL?.includes('localhost')) {
      warnings.push('VITE_WS_URL contains localhost - update for production');
    }
  }

  // Log results
  if (errors.length > 0) {
    console.error('❌ Environment validation errors:');
    errors.forEach((err) => console.error(`  - ${err}`));
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Environment warnings:');
    warnings.forEach((warn) => console.warn(`  - ${warn}`));
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Environment configuration validated successfully');
  }

  // In strict mode (production), throw if required vars are missing
  if (strictMode && errors.length > 0) {
    throw new Error(
      `Application startup failed due to missing configuration:\n${errors.join('\n')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config,
  };
}

/**
 * Get a validated environment config object
 * Safe to call multiple times - validates once and caches result
 */
let cachedConfig = null;

export function getEnvConfig() {
  if (!cachedConfig) {
    const { config, isValid } = validateEnvironment(false); // Don't throw, let app handle it
    cachedConfig = {
      apiUrl: config.VITE_API_URL || '/api',
      wsUrl: config.VITE_WS_URL || 'http://localhost:8081',
      googleClientId: config.VITE_GOOGLE_CLIENT_ID || '',
      enableMockData: config.VITE_ENABLE_MOCK_DATA === 'true',
      enableServiceWorker: config.VITE_ENABLE_SERVICE_WORKER !== 'false',
      enableAnalytics: config.VITE_ENABLE_ANALYTICS === 'true',
      isValid,
      isProduction: import.meta.env.PROD,
      isDevelopment: import.meta.env.DEV,
    };
  }
  return cachedConfig;
}

// Auto-validate on module load in development
if (import.meta.env.DEV) {
  validateEnvironment(false);
}

export default { validateEnvironment, getEnvConfig };
