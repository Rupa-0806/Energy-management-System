class OfflineManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = [];
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    if (!this.isOnline) {
      this.isOnline = true;
      this.notifyListeners('online');
      console.log('Application is now online');
    }
  }

  handleOffline() {
    if (this.isOnline) {
      this.isOnline = false;
      this.notifyListeners('offline');
      console.log('Application is now offline');
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(status) {
    this.listeners.forEach(callback => callback(status));
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      lastUpdated: new Date(),
    };
  }

  /**
   * Queue requests when offline and retry when online
   */
  queueRequest(request) {
    const queuedRequests = JSON.parse(localStorage.getItem('queued_requests') || '[]');
    queuedRequests.push({
      ...request,
      timestamp: Date.now(),
    });
    localStorage.setItem('queued_requests', JSON.stringify(queuedRequests));
  }

  /**
   * Process queued requests when coming back online
   */
  async processQueue(executor) {
    const queuedRequests = JSON.parse(localStorage.getItem('queued_requests') || '[]');
    if (queuedRequests.length === 0) return;

    const results = [];
    for (const request of queuedRequests) {
      try {
        const result = await executor(request);
        results.push({ success: true, ...result });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    localStorage.removeItem('queued_requests');
    return results;
  }
}

export default new OfflineManager();
