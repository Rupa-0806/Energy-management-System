import apiClient from './client';

export const alertApi = {
  // Get all alerts
  getAlerts: async (params = {}) => {
    const response = await apiClient.get('/alerts', { params });
    return response.data;
  },

  // Get alert by ID
  getAlert: async (alertId) => {
    const response = await apiClient.get(`/alerts/${alertId}`);
    return response.data;
  },

  // Create alert
  createAlert: async (alertData) => {
    const response = await apiClient.post('/alerts', alertData);
    return response.data;
  },

  // Update alert
  updateAlert: async (alertId, alertData) => {
    const response = await apiClient.put(`/alerts/${alertId}`, alertData);
    return response.data;
  },

  // Delete alert
  deleteAlert: async (alertId) => {
    const response = await apiClient.delete(`/alerts/${alertId}`);
    return response.data;
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId) => {
    const response = await apiClient.post(`/alerts/${alertId}/acknowledge`);
    return response.data;
  },

  // Resolve alert
  resolveAlert: async (alertId, notes = '') => {
    const response = await apiClient.post(`/alerts/${alertId}/resolve`, { notes });
    return response.data;
  },

  // Snooze alert
  snoozeAlert: async (alertId, minutes) => {
    const response = await apiClient.post(`/alerts/${alertId}/snooze`, { minutes });
    return response.data;
  },

  // Get active alerts count
  getActiveAlertsCount: async () => {
    const response = await apiClient.get('/alerts/active/count');
    return response.data;
  },

  // Get alert rules
  getAlertRules: async () => {
    const response = await apiClient.get('/alerts/rules');
    return response.data;
  },

  // Create alert rule
  createAlertRule: async (ruleData) => {
    const response = await apiClient.post('/alerts/rules', ruleData);
    return response.data;
  },

  // Update alert rule
  updateAlertRule: async (ruleId, ruleData) => {
    const response = await apiClient.put(`/alerts/rules/${ruleId}`, ruleData);
    return response.data;
  },

  // Delete alert rule
  deleteAlertRule: async (ruleId) => {
    const response = await apiClient.delete(`/alerts/rules/${ruleId}`);
    return response.data;
  },

  // Enable/disable alert rule
  toggleAlertRule: async (ruleId, enabled) => {
    const response = await apiClient.patch(`/alerts/rules/${ruleId}`, { enabled });
    return response.data;
  },
};

export default alertApi;
