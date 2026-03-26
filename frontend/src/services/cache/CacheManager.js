class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.ttl = new Map();
  }

  /**
   * Set item in cache with optional TTL (in milliseconds)
   */
  set(key, value, ttlMs = 5 * 60 * 1000) {
    // Store in memory
    this.memoryCache.set(key, value);

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify({
        value,
        timestamp: Date.now(),
      }));
    } catch (e) {
      console.warn('Failed to store in localStorage:', e);
    }

    // Set expiration
    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
    }

    const timeoutId = setTimeout(() => {
      this.remove(key);
    }, ttlMs);

    this.ttl.set(key, timeoutId);
  }

  /**
   * Get item from cache
   */
  get(key) {
    // Try memory cache first
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // Try localStorage as fallback
    try {
      const stored = localStorage.getItem(`cache:${key}`);
      if (stored) {
        const { value } = JSON.parse(stored);
        // Restore to memory cache
        this.memoryCache.set(key, value);
        return value;
      }
    } catch (e) {
      console.warn('Failed to retrieve from localStorage:', e);
    }

    return null;
  }

  /**
   * Check if key exists in cache
   */
  has(key) {
    return this.memoryCache.has(key) || localStorage.getItem(`cache:${key}`) !== null;
  }

  /**
   * Remove item from cache
   */
  remove(key) {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache:${key}`);
    } catch (e) {
      console.warn('Failed to remove from localStorage:', e);
    }

    if (this.ttl.has(key)) {
      clearTimeout(this.ttl.get(key));
      this.ttl.delete(key);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.memoryCache.clear();
    this.ttl.forEach((timeoutId) => clearTimeout(timeoutId));
    this.ttl.clear();

    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('cache:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('Failed to clear localStorage cache:', e);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      memorySize: this.memoryCache.size,
      ttlSize: this.ttl.size,
    };
  }
}

export default new CacheManager();
