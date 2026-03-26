/**
 * Production-Ready Google Authentication Service
 * 
 * Handles Google Sign-In with:
 * - FedCM migration support
 * - Automatic fallback mechanisms
 * - Network error retry logic
 * - Multiple authentication strategies
 * - Comprehensive error handling
 */

// Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const SCRIPT_LOAD_TIMEOUT = 10000;

// Auth strategy types
const AUTH_STRATEGY = {
  ONE_TAP: 'one_tap',
  POPUP: 'popup',
  REDIRECT: 'redirect',
  BUTTON: 'button',
};

// Error codes for better debugging
const ERROR_CODES = {
  SCRIPT_LOAD_FAILED: 'GOOGLE_SCRIPT_LOAD_FAILED',
  NOT_INITIALIZED: 'GOOGLE_NOT_INITIALIZED',
  CLIENT_ID_MISSING: 'GOOGLE_CLIENT_ID_MISSING',
  ONE_TAP_FAILED: 'ONE_TAP_FAILED',
  POPUP_CLOSED: 'POPUP_CLOSED_BY_USER',
  POPUP_BLOCKED: 'POPUP_BLOCKED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  FEDCM_ERROR: 'FEDCM_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR',
};

class GoogleAuthService {
  constructor() {
    this.initialized = false;
    this.initializing = false;
    this.initPromise = null;
    this.currentStrategy = AUTH_STRATEGY.ONE_TAP;
    this.credentialCallback = null;
    this.errorCallback = null;
    this.retryCount = 0;
  }

  /**
   * Check if Google Auth is available
   */
  isAvailable() {
    return !!GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== 'your_google_client_id_here';
  }

  /**
   * Initialize Google Identity Services with retry logic
   */
  async initialize(options = {}) {
    if (!this.isAvailable()) {
      console.warn('[GoogleAuth] Client ID not configured, Google Sign-In disabled');
      return false;
    }

    if (this.initialized) {
      return true;
    }

    if (this.initializing && this.initPromise) {
      return this.initPromise;
    }

    this.initializing = true;
    this.initPromise = this._initializeWithRetry(options);
    
    try {
      await this.initPromise;
      return true;
    } catch (error) {
      console.error('[GoogleAuth] Initialization failed:', error);
      return false;
    } finally {
      this.initializing = false;
    }
  }

  async _initializeWithRetry(options, attempt = 1) {
    try {
      await this._loadGoogleScript();
      await this._initializeGSI(options);
      this.initialized = true;
      console.log('[GoogleAuth] Initialized successfully');
      return true;
    } catch (error) {
      if (attempt < MAX_RETRIES) {
        console.warn(`[GoogleAuth] Init attempt ${attempt} failed, retrying...`);
        await this._delay(RETRY_DELAY * attempt);
        return this._initializeWithRetry(options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Load Google Identity Services script
   */
  _loadGoogleScript() {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', () => reject(new Error(ERROR_CODES.SCRIPT_LOAD_FAILED)));
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      const timeout = setTimeout(() => {
        reject(new Error(ERROR_CODES.SCRIPT_LOAD_FAILED));
      }, SCRIPT_LOAD_TIMEOUT);

      script.onload = () => {
        clearTimeout(timeout);
        // Wait for google object to be available
        const checkGoogle = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkGoogle);
            resolve();
          }
        }, 50);
        
        setTimeout(() => {
          clearInterval(checkGoogle);
          if (!window.google?.accounts?.id) {
            reject(new Error(ERROR_CODES.SCRIPT_LOAD_FAILED));
          }
        }, 3000);
      };

      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(ERROR_CODES.SCRIPT_LOAD_FAILED));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Initialize Google Sign-In with FedCM support
   */
  async _initializeGSI(options = {}) {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.id) {
        reject(new Error(ERROR_CODES.NOT_INITIALIZED));
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => this._handleCredentialResponse(response),
          auto_select: options.autoSelect ?? false,
          cancel_on_tap_outside: options.cancelOnTapOutside ?? true,
          context: options.context ?? 'signin',
          ux_mode: 'popup',
          // FedCM migration support
          use_fedcm_for_prompt: true,
          // Error handling callback
          error_callback: (error) => this._handleError(error),
          // Intermediate iframe support for better UX
          itp_support: true,
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle credential response from Google
   */
  _handleCredentialResponse(response) {
    this.retryCount = 0;
    
    if (response.credential) {
      console.log('[GoogleAuth] Credential received successfully');
      if (this.credentialCallback) {
        this.credentialCallback({
          success: true,
          credential: response.credential,
          selectBy: response.select_by,
        });
      }
    } else {
      this._handleError({
        type: 'credential_missing',
        message: 'No credential in response',
      });
    }
  }

  /**
   * Comprehensive error handling
   */
  _handleError(error) {
    console.error('[GoogleAuth] Error:', error);
    
    let errorCode = ERROR_CODES.UNKNOWN;
    let errorMessage = 'An error occurred during Google Sign-In';
    let canRetry = false;

    if (typeof error === 'string') {
      if (error.includes('NetworkError') || error.includes('FedCM')) {
        errorCode = ERROR_CODES.FEDCM_ERROR;
        errorMessage = 'Network error during authentication. Please check your connection.';
        canRetry = true;
      }
    } else if (error?.type) {
      switch (error.type) {
        case 'popup_closed':
          errorCode = ERROR_CODES.POPUP_CLOSED;
          errorMessage = 'Sign-in popup was closed. Please try again.';
          break;
        case 'popup_failed_to_open':
          errorCode = ERROR_CODES.POPUP_BLOCKED;
          errorMessage = 'Popup was blocked. Please allow popups for this site.';
          canRetry = true;
          break;
        default:
          if (error.message?.includes('NetworkError')) {
            errorCode = ERROR_CODES.NETWORK_ERROR;
            errorMessage = 'Network error. Please check your internet connection.';
            canRetry = true;
          }
      }
    }

    // Attempt retry for retryable errors
    if (canRetry && this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(`[GoogleAuth] Retrying... (attempt ${this.retryCount}/${MAX_RETRIES})`);
      setTimeout(() => this._tryFallbackStrategy(), RETRY_DELAY * this.retryCount);
      return;
    }

    if (this.errorCallback) {
      this.errorCallback({
        code: errorCode,
        message: errorMessage,
        originalError: error,
        canRetry: canRetry && this.retryCount < MAX_RETRIES,
      });
    }
  }

  /**
   * Try fallback authentication strategy
   */
  async _tryFallbackStrategy() {
    switch (this.currentStrategy) {
      case AUTH_STRATEGY.ONE_TAP:
        console.log('[GoogleAuth] Falling back to popup strategy');
        this.currentStrategy = AUTH_STRATEGY.POPUP;
        return this.signIn();
      case AUTH_STRATEGY.POPUP:
        console.log('[GoogleAuth] Falling back to button strategy');
        this.currentStrategy = AUTH_STRATEGY.BUTTON;
        return this._useButtonStrategy();
      default:
        this._handleError({
          type: 'all_strategies_failed',
          message: 'All authentication strategies failed',
        });
    }
  }

  /**
   * Main sign-in method with automatic fallbacks
   */
  async signIn(options = {}) {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        this._handleError({
          type: 'initialization_failed',
          message: 'Failed to initialize Google Sign-In',
        });
        return;
      }
    }

    // Reset strategy if explicitly calling signIn
    if (options.resetStrategy) {
      this.currentStrategy = AUTH_STRATEGY.ONE_TAP;
      this.retryCount = 0;
    }

    try {
      switch (this.currentStrategy) {
        case AUTH_STRATEGY.ONE_TAP:
          return this._useOneTapStrategy();
        case AUTH_STRATEGY.POPUP:
          return this._usePopupStrategy();
        case AUTH_STRATEGY.BUTTON:
          return this._useButtonStrategy();
        default:
          return this._useOneTapStrategy();
      }
    } catch (error) {
      this._handleError(error);
    }
  }

  /**
   * One Tap strategy (recommended for FedCM)
   */
  _useOneTapStrategy() {
    return new Promise((resolve) => {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isDisplayed()) {
          console.log('[GoogleAuth] One Tap prompt displayed');
          resolve({ displayed: true });
        } else if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.log('[GoogleAuth] One Tap not displayed:', reason);
          
          // Handle specific not-displayed reasons
          if (['opt_out_or_no_session', 'browser_not_supported', 'secure_http_required'].includes(reason)) {
            // Fall back to popup strategy
            this.currentStrategy = AUTH_STRATEGY.POPUP;
            resolve(this._usePopupStrategy());
          } else {
            this._tryFallbackStrategy();
            resolve({ displayed: false, reason });
          }
        } else if (notification.isSkippedMoment()) {
          const reason = notification.getSkippedReason();
          console.log('[GoogleAuth] One Tap skipped:', reason);
          
          // Fall back to popup
          this.currentStrategy = AUTH_STRATEGY.POPUP;
          resolve(this._usePopupStrategy());
        } else if (notification.isDismissedMoment()) {
          const reason = notification.getDismissedReason();
          console.log('[GoogleAuth] One Tap dismissed:', reason);
          
          if (reason === 'credential_returned') {
            resolve({ success: true });
          } else {
            this._tryFallbackStrategy();
            resolve({ dismissed: true, reason });
          }
        }
      });
    });
  }

  /**
   * Popup strategy with hidden button
   */
  async _usePopupStrategy() {
    return new Promise((resolve) => {
      try {
        // Create a hidden container for the button
        const container = document.createElement('div');
        container.id = 'google-signin-hidden-container';
        container.style.cssText = 'position: fixed; top: -9999px; left: -9999px; opacity: 0;';
        document.body.appendChild(container);

        window.google.accounts.id.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          click_listener: () => {
            console.log('[GoogleAuth] Hidden button clicked');
          },
        });

        // Wait for button to render then click it
        requestAnimationFrame(() => {
          setTimeout(() => {
            const button = container.querySelector('[role="button"]') || 
                          container.querySelector('div[tabindex="0"]') ||
                          container.querySelector('div');
            
            if (button) {
              button.click();
              console.log('[GoogleAuth] Popup triggered via hidden button');
            } else {
              console.warn('[GoogleAuth] Could not find button to click');
              this._tryFallbackStrategy();
            }
            
            // Clean up after a delay
            setTimeout(() => {
              container.remove();
            }, 5000);
            
            resolve({ strategy: 'popup' });
          }, 100);
        });
      } catch (error) {
        console.error('[GoogleAuth] Popup strategy failed:', error);
        this._tryFallbackStrategy();
        resolve({ error });
      }
    });
  }

  /**
   * Button strategy - render visible button
   */
  async _useButtonStrategy(containerId = 'google-signin-button') {
    if (!window.google?.accounts?.id) {
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[GoogleAuth] Container #${containerId} not found for button`);
      return;
    }

    window.google.accounts.id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 300,
    });

    console.log('[GoogleAuth] Button rendered in container');
  }

  /**
   * Set credential callback
   */
  onCredential(callback) {
    this.credentialCallback = callback;
    return this;
  }

  /**
   * Set error callback
   */
  onError(callback) {
    this.errorCallback = callback;
    return this;
  }

  /**
   * Cancel any ongoing prompts
   */
  cancel() {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.cancel();
    }
  }

  /**
   * Revoke access (for logout)
   */
  async revoke(email) {
    return new Promise((resolve) => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.revoke(email, (response) => {
          console.log('[GoogleAuth] Revoke response:', response);
          resolve(response);
        });
      } else {
        resolve(null);
      }
    });
  }

  /**
   * Render a custom Google Sign-In button
   */
  renderButton(containerId, options = {}) {
    if (!window.google?.accounts?.id) {
      console.warn('[GoogleAuth] Cannot render button - not initialized');
      return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`[GoogleAuth] Container #${containerId} not found`);
      return;
    }

    window.google.accounts.id.renderButton(container, {
      type: options.type || 'standard',
      theme: options.theme || 'outline',
      size: options.size || 'large',
      text: options.text || 'signin_with',
      shape: options.shape || 'rectangular',
      logo_alignment: options.logoAlignment || 'left',
      width: options.width,
    });
  }

  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();

// Export class for testing
export { GoogleAuthService, AUTH_STRATEGY, ERROR_CODES };

export default googleAuthService;
