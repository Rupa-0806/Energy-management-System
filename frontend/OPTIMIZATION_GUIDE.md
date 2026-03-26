# EMS Frontend - Production Best Practices & Optimization Guide

## 🎯 Overview
This guide documents the production-ready optimizations, best practices, and real-time features implemented in the Energy Management System frontend.

---

## 📦 Bundle Size Optimization

### Before Optimization
- Initial bundle: ~800KB (estimated)
- Load time: ~3-4 seconds

### After Optimization
- Initial bundle: ~300KB (estimated)
- Lazy-loaded chunks: ~50-100KB each
- Load time: ~1-2 seconds

### Techniques Used
1. **Code Splitting**: Pages loaded on-demand
2. **Tree Shaking**: Unused code removed
3. **Compression**: Gzip enabled
4. **Dynamic Imports**: `lazy(() => import(...))`
5. **Asset Optimization**: Tailwind CSS purging

---

## ⚡ Performance Metrics

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID/INP (Interaction)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Implementation
```javascript
// Monitored in browser DevTools Console
PerformanceMonitor.reportWebVitals();
Logger.info('Performance metrics:', PerformanceMonitor.getMetrics());
```

---

## 🔄 Real-Time Architecture

### WebSocket Strategy
```
┌─────────────────┐
│   Components    │
└────────┬────────┘
         │
    useRealtime()
         │
┌────────▼────────┐
│ RealtimeService │ ◄─── Socket.IO Client
└────────┬────────┘
         │
   Event Listeners
    (Subscribe/Emit)
```

### Event Flow
```javascript
// Real-time data flow
RealtimeService.subscribeToEnergyReading((data) => {
  // Update UI immediately
  updateDashboard(data);
  // Cache for offline
  CacheManager.set('energy-reading', data);
});
```

### Reconnection Logic
- Auto-reconnect: 5 attempts
- Backoff delay: 1s to 5s exponential
- Fallback to polling if WebSocket fails

---

## 💾 Caching Strategy

### Cache Layers
```
1. Memory Cache (Fast, volatile)
   ↓
2. LocalStorage Cache (Persistent, slower)
   ↓
3. Service Worker Cache (Offline, strategic)
```

### TTL Configuration
```javascript
// API Data: 5 minutes
CacheManager.set('devices', data, 5 * 60 * 1000);

// User Profile: 30 minutes
CacheManager.set('user', data, 30 * 60 * 1000);

// Energy History: 1 hour
CacheManager.set('energy-history', data, 60 * 60 * 1000);
```

### Cache Invalidation
```javascript
// Manual invalidation
CacheManager.remove('devices');

// Automatic on expiration (TTL)
// Scheduled invalidation
setTimeout(() => {
  CacheManager.clear();
}, 24 * 60 * 60 * 1000); // Daily
```

---

## 🌐 Offline-First Architecture

### Network Status Detection
```javascript
// Automatic detection
const { isOnline } = useOfflineStatus();

// Queue requests when offline
if (!isOnline) {
  OfflineManager.queueRequest({
    method: 'POST',
    url: '/api/alerts',
    data: alertData,
  });
}
```

### Offline Data Strategy
```
Online: Real-time API → Display
           ↓
         Cache

Offline: Cache → Display (fallback)
    + Queue Requests
    + Show Offline UI
```

### Sync on Reconnection
```javascript
OfflineManager.subscribe((status) => {
  if (status === 'online') {
    OfflineManager.processQueue(async (request) => {
      return apiClient.request(request);
    });
  }
});
```

---

## 🚀 API Request Optimization

### Debouncing Search
```javascript
import { debounce } from './utils/performance';

const handleSearch = debounce(async (query) => {
  const results = await deviceApi.search(query);
  setResults(results);
}, 300); // Wait 300ms after user stops typing
```

### Throttling Scroll
```javascript
import { throttle } from './utils/performance';

const handleScroll = throttle(() => {
  checkForMoreResults();
}, 1000); // Check max once per second

window.addEventListener('scroll', handleScroll);
```

### Batch Requests
```javascript
import { batchRequests } from './utils/performance';

const results = await batchRequests(
  [
    () => deviceApi.getDevices(),
    () => energyApi.getConsumption(),
    () => alertApi.getAlerts(),
  ],
  {
    concurrency: 3,
    onProgress: ({ completed, total }) => {
      console.log(`Loaded ${completed}/${total}`);
    },
  }
);
```

---

## 📊 Error Handling Strategy

### Global Error Boundary
```
Unhandled Errors
      ↓
ErrorBoundary catches
      ↓
Log to backend
      ↓
Show user-friendly UI
      ↓
Provide recovery options
```

### Implementation
```javascript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Logger Integration
```javascript
Logger.error('User action failed', {
  action: 'createDevice',
  error: errorMessage,
  timestamp: new Date(),
  userAgent: navigator.userAgent,
});
```

---

## 🔐 Security Best Practices

### API Security
```javascript
// 1. Auth token management
const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

// 2. Automatic token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Refresh token automatically
      const newToken = await refreshAuthToken();
      // Retry request
    }
  }
);

// 3. Secure headers (backend configured)
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
```

### Data Protection
```javascript
// Never log sensitive data
Logger.info('Login attempt', { email: '***' });

// Secure localStorage
CacheManager.set('token', encryptedToken);

// HTTPS only (production)
// SameSite cookies
// CSRF token validation
```

---

## 🧪 Testing Checklist

### Performance Testing
```bash
# Lighthouse audit
npm run build
lighthouse http://localhost:5174

# Bundle analysis
npm install --save-dev webpack-bundle-analyzer
```

### Real-Time Testing
```javascript
// Test WebSocket reconnection
// DevTools → Network → Throttle → Offline
// Observe reconnection logic

// Test event delivery
RealtimeService.subscribe('energy:reading', console.log);
```

### Offline Testing
```javascript
// DevTools → Network → Offline
// Observe offline indicator
// Queue requests
// Go online and verify sync
```

### PWA Testing
```javascript
// Lighthouse PWA audit
// DevTools → Application → Service Workers
// Check cache storage
// Test install prompt
// Verify offline functionality
```

---

## 📈 Monitoring in Production

### Performance Metrics Collection
```javascript
// Automatically collected
PerformanceMonitor.reportWebVitals();

// Dashboard for monitoring
const metrics = PerformanceMonitor.getMetrics();
console.log('Performance:', metrics);
```

### Error Tracking
```javascript
// Automatic error reporting to backend
Logger.error('Critical error occurred', {
  errorType: error.name,
  message: error.message,
  stack: error.stack,
  timestamp: new Date(),
});
```

### User Analytics
```javascript
// Track user actions
Logger.info('Page viewed', { page: 'dashboard' });
Logger.info('Device created', { deviceId: 123 });
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Bundle size analyzed
- [ ] Performance benchmarks met
- [ ] Error handling tested
- [ ] Offline mode tested
- [ ] WebSocket connection tested
- [ ] Security audit passed
- [ ] Environment variables configured

### Deployment
- [ ] Build production bundle: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Deploy to CDN
- [ ] Update service worker
- [ ] Monitor error logs
- [ ] Verify performance metrics
- [ ] Check real-time connectivity
- [ ] Validate offline functionality

### Post-Deployment
- [ ] Monitor error logs (first 24h)
- [ ] Check performance metrics
- [ ] Verify user engagement
- [ ] Track real-time updates
- [ ] Monitor cache hit rates
- [ ] Analyze bundle usage
- [ ] Plan optimization iterations

---

## 💡 Best Practices Summary

### Code Quality
✅ Use ErrorBoundary for all routes
✅ Log all errors to backend
✅ Use TypeScript for large projects
✅ Test error scenarios
✅ Implement retry logic

### Performance
✅ Lazy load routes
✅ Implement caching strategy
✅ Debounce/throttle events
✅ Monitor Core Web Vitals
✅ Optimize images and assets

### Reliability
✅ Implement offline support
✅ Handle network failures gracefully
✅ Queue failed requests
✅ Provide user feedback
✅ Auto-recovery mechanisms

### Security
✅ Validate user input
✅ Never log sensitive data
✅ Use HTTPS only
✅ Implement CSRF protection
✅ Regular security audits

### UX/DX
✅ Show loading states (skeletons)
✅ Provide error messages
✅ Confirm destructive actions
✅ Support keyboard navigation
✅ Mobile-first design

---

## 📚 Additional Resources

### Documentation
- [Vite Guide](https://vitejs.dev)
- [React Best Practices](https://react.dev)
- [Web Vitals](https://web.dev/vitals/)
- [Service Workers](https://developers.google.com/web/tools/workbox)
- [PWA Checklist](https://web.dev/pwa-checklist/)

### Tools
- Lighthouse (DevTools)
- React DevTools
- Redux DevTools
- Network Throttling
- Memory Profiler

---

## 🎓 Learning Resources

### Performance
- Chrome DevTools Performance Tab
- Lighthouse Audits
- WebPageTest.org
- GTmetrix

### Real-Time
- Socket.IO Documentation
- WebSocket API
- Server-Sent Events

### Security
- OWASP Top 10
- Content Security Policy
- Secure Headers

---

**Last Updated**: February 4, 2026
**Status**: ✅ Production Ready
**Version**: 1.0.0
