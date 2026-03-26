// API configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:8081',
  TIMEOUT: 30000,
};

// Device status constants
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  INACTIVE: 'inactive',
  ERROR: 'error',
};

// Device types
export const DEVICE_TYPES = {
  METER: 'meter',
  SENSOR: 'sensor',
  SWITCH: 'switch',
  INVERTER: 'inverter',
  BATTERY: 'battery',
};

// User roles - must match backend User.Role enum exactly
export const USER_ROLES = {
  USER: 'USER',
  TECHNICIAN: 'TECHNICIAN',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
};

// Roles available for self-registration (ADMIN excluded for security)
export const REGISTRATION_ROLES = [
  { value: 'USER', label: 'User', description: 'View dashboards and basic energy data' },
  { value: 'TECHNICIAN', label: 'Technician', description: 'Manage devices and perform maintenance' },
  { value: 'MANAGER', label: 'Manager', description: 'Full access to reports and team management' },
];

// Alert severity levels
export const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency',
};

// Alert status
export const ALERT_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
};

// Time periods for data filtering
export const TIME_PERIODS = {
  '1H': { label: 'Last Hour', value: '1h', minutes: 60 },
  '6H': { label: 'Last 6 Hours', value: '6h', minutes: 360 },
  '24H': { label: 'Last 24 Hours', value: '24h', minutes: 1440 },
  '7D': { label: 'Last 7 Days', value: '7d', minutes: 10080 },
  '30D': { label: 'Last 30 Days', value: '30d', minutes: 43200 },
  '1Y': { label: 'Last Year', value: '1y', minutes: 525600 },
};

// Chart colors
export const CHART_COLORS = [
  '#0ea5e9', // sky blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100],
};

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  PREFERENCES: 'user_preferences',
};

// Default limits for energy thresholds
export const ENERGY_LIMITS = {
  WARNING_THRESHOLD: 80, // % of max
  CRITICAL_THRESHOLD: 95, // % of max
};

// Date format options
export const DATE_FORMAT_OPTIONS = {
  DATE_ONLY: 'MMM dd, yyyy',
  TIME_ONLY: 'HH:mm:ss',
  DATE_TIME: 'MMM dd, yyyy HH:mm',
  FULL: 'EEEE, MMMM dd, yyyy HH:mm:ss',
};
