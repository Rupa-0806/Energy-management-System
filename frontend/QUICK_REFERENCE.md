# 🚀 EMS Frontend - Quick Reference Card

## ⚡ Quick Start

```bash
# Navigate to frontend
cd C:\Users\haris\Desktop\EnergyManagementSystem\frontend

# Start development server
npm run dev

# Server runs on http://localhost:5174
```

---

## 🎯 Main Features (At a Glance)

| Feature | Status | File | Usage |
|---------|--------|------|-------|
| Authentication | ✅ | `src/context/AuthContext.jsx` | `useAuth()` |
| Real-Time WebSocket | ✅ | `src/services/websocket/RealtimeService.js` | `useRealtime()` |
| Offline Mode | ✅ | `src/services/offline/OfflineManager.js` | `useOfflineStatus()` |
| Error Handling | ✅ | `src/components/common/ErrorBoundary.jsx` | Wrap app |
| Caching | ✅ | `src/services/cache/CacheManager.js` | `CacheManager.set()` |
| Performance Monitor | ✅ | `src/services/monitoring/PerformanceMonitor.js` | `PerformanceMonitor.mark()` |
| Logging | ✅ | `src/services/monitoring/Logger.js` | `Logger.info()` |
| PWA / Service Worker | ✅ | `public/sw.js`, `public/manifest.json` | Browser install |

---

## 📦 Hooks Available

```javascript
// Authentication
useAuth()                    // Get auth state & functions

// Real-Time
useRealtime(event, callback)      // Subscribe to events
useRealtimeStatus()                // Connection status
useEnergyReading()                 // Real-time energy data
useDeviceUpdates()                 // Device changes
useAlerts()                        // New alerts

// Offline
useOfflineStatus()           // { isOnline, lastUpdated }
useOnlineOnly()              // Just isOnline boolean

// PWA
usePWA()                     // Install prompt & status
useServiceWorkerUpdates()    // Update detection

// Pagination
usePagination(items, itemsPerPage)  // Pagination logic
```

---

## 💾 Service APIs

### CacheManager
```javascript
CacheManager.set(key, value, ttlMs)      // Store with TTL
CacheManager.get(key)                     // Retrieve
CacheManager.has(key)                     // Check existence
CacheManager.remove(key)                  // Delete
CacheManager.clear()                      // Clear all
CacheManager.getStats()                   // Memory usage
```

### RealtimeService
```javascript
RealtimeService.connect()                 // Connect to server
RealtimeService.disconnect()              // Disconnect
RealtimeService.subscribe(event, cb)      // Listen to event
RealtimeService.emit(event, data)         // Send event
RealtimeService.getStatus()               // Connection status
```

### OfflineManager
```javascript
OfflineManager.subscribe(cb)              // Listen to status changes
OfflineManager.getStatus()                // { isOnline, lastUpdated }
OfflineManager.queueRequest(req)          // Queue when offline
OfflineManager.processQueue(executor)     // Retry queued requests
```

### Logger
```javascript
Logger.debug(message, data)               // Debug level
Logger.info(message, data)                // Info level
Logger.warn(message, data)                // Warning level
Logger.error(message, data)               // Error level
Logger.getLogs(filter)                    // Get all logs
Logger.exportLogs()                       // Download JSON
Logger.clearLogs()                        // Clear all
```

### PerformanceMonitor
```javascript
PerformanceMonitor.mark(name)             // Start mark
PerformanceMonitor.measure(start, end)    // Measure between marks
PerformanceMonitor.reportWebVitals()      // Report Core Web Vitals
PerformanceMonitor.getMetrics()           // Get all metrics
PerformanceMonitor.getMemoryUsage()       // Memory in Chrome
```

---

## 🛠️ Utilities

### Performance Utilities
```javascript
import { debounce, throttle, batchRequests } from './utils/performance';

// Debounce - waits until done
debounce(fn, delay)

// Throttle - limits frequency
throttle(fn, delay)

// Batch - concurrent requests
batchRequests(requests, { concurrency: 3 })
```

### Formatters
```javascript
import { formatEnergy, formatPower, formatCost, formatDate } from './utils/formatters';

formatEnergy(1500)                // "1.5 kWh"
formatPower(2500)                 // "2.5 kW"
formatCost(123.45)                // "$123.45"
formatDate(new Date())            // "Feb 4, 2026"
```

### Validators
```javascript
import { isValidEmail, isValidPassword, validateForm } from './utils/validators';

isValidEmail(email)               // true/false
isValidPassword(pwd)              // true/false + message
validateForm(formData, rules)     // { isValid, errors }
```

---

## 🎨 Components

### Layout
```jsx
<MainLayout>           // Main container with nav
  <Sidebar />          // Side navigation
  <Navbar />           // Top navigation
  {children}
</MainLayout>
```

### UI Components
```jsx
<Button variant="primary" size="md">Click</Button>
<Card title="Title" icon={<Icon />}>Content</Card>
<KPICard title="Energy" value={100} unit="kW" trend="+5%" />
```

### Charts
```jsx
<EnergyChart data={data} />        // Line chart with Recharts
<EnergyGauge percent={75} />       // SVG gauge visualization
```

### Loaders
```jsx
<SkeletonLoader count={3} height="h-12" />
<KPICardSkeleton />
<TableSkeleton rows={5} cols={4} />
<ChartSkeleton />
```

### Alerts
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>

<OfflineIndicator />   // Shows when offline
```

---

## 📝 Environment Setup

Create `.env.local`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=http://localhost:8080
```

Or use defaults:
```javascript
import.meta.env.VITE_API_URL  // Defaults in App
```

---

## 🔍 Debugging Tips

### DevTools Console
```javascript
// Check WebSocket
RealtimeService.getStatus()

// View cache
CacheManager.getStats()

// Check offline status
OfflineManager.getStatus()

// Performance metrics
PerformanceMonitor.getMetrics()

// All error logs
Logger.getLogs()

// Export logs
Logger.exportLogs()
```

### Network Tab
- Observe lazy-loaded chunks
- Monitor WebSocket messages
- Check cache behavior
- See service worker requests

### Application Tab
- View service worker status
- Check cache storage
- Inspect localStorage
- Verify manifest.json

---

## 📊 Performance Checklist

- [ ] Initial load < 2s
- [ ] Lighthouse score > 85
- [ ] Core Web Vitals all green
- [ ] Zero console errors
- [ ] Service worker active
- [ ] Cache hits on repeat visits
- [ ] Offline mode working
- [ ] WebSocket connecting
- [ ] Errors logging to backend
- [ ] PWA installable

---

## 🚀 Deployment Commands

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Format code
npm run format

# Check for unused imports
npm run lint:fix
```

---

## 📋 File Structure Quick Reference

```
src/
├── pages/              7 pages (lazy-loaded)
├── components/
│   ├── common/         Reusable UI components
│   ├── layouts/        MainLayout, Sidebar, Navbar
│   ├── charts/         EnergyChart, EnergyGauge
│   └── features/       Feature-specific components
├── services/
│   ├── api/            API client & endpoints
│   ├── websocket/      Real-time WebSocket
│   ├── cache/          Caching layer
│   ├── monitoring/     Performance & logging
│   └── offline/        Offline management
├── hooks/              Custom React hooks
├── context/            React Context (Auth)
├── stores/             Zustand state (backup)
├── utils/              Utilities & helpers
└── styles/             Global CSS
```

---

## 🎯 Common Tasks

### Add Real-Time Updates
```javascript
// Use hook
const energyReading = useEnergyReading();

// Or subscribe directly
RealtimeService.subscribeToEnergyReading((data) => {
  setState(data);
});
```

### Handle Offline
```javascript
const { isOnline } = useOfflineStatus();

if (!isOnline) {
  OfflineManager.queueRequest(request);
}
```

### Cache Data
```javascript
import CacheManager from './services/cache/CacheManager';

CacheManager.set('key', data, 5 * 60 * 1000);
```

### Log Events
```javascript
import Logger from './services/monitoring/Logger';

Logger.info('User action', { action: 'login' });
Logger.error('Failed request', error);
```

### Monitor Performance
```javascript
PerformanceMonitor.mark('task-start');
// ... do work ...
PerformanceMonitor.measure('task', 'task-start', 'task-end');
```

---

## ⚠️ Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "process is not defined" | Using process.env | Use `import.meta.env.VITE_*` |
| WebSocket fails | Server not running | Start backend server on port 8080 |
| Offline not working | SW not registered | Check /public/sw.js exists |
| Cache not persisting | localStorage full | Clear other app data |
| Lazy loading stuck | Network error | Check DevTools Network tab |

---

## 📞 Quick Links

- **Dev Server**: http://localhost:5174
- **API Base**: http://localhost:8080/api
- **WebSocket**: ws://localhost:8080
- **Docs**: `PRODUCTION_FEATURES.md`, `OPTIMIZATION_GUIDE.md`

---

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: February 4, 2026
