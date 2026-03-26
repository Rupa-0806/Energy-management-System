import apiClient from './client';

export const energyApi = {
  // Get energy consumption for a device
  getConsumption: async (deviceId, params = {}) => {
    const response = await apiClient.get(`/energy/devices/${deviceId}/consumption`, { params });
    return response.data;
  },

  // Get aggregated energy consumption
  getAggregatedConsumption: async (params = {}) => {
    const response = await apiClient.get('/energy/aggregated', { params });
    return response.data;
  },

  // Get energy data by group
  getGroupConsumption: async (groupId, params = {}) => {
    const response = await apiClient.get(`/energy/groups/${groupId}/consumption`, { params });
    return response.data;
  },

  // Get energy forecast
  getConsumptionForecast: async (params = {}) => {
    const response = await apiClient.get('/energy/forecast', { params });
    return response.data;
  },

  // Get real-time power consumption (current power)
  getRealTimePower: async (deviceId) => {
    const response = await apiClient.get(`/energy/devices/${deviceId}/current-power`);
    return response.data;
  },

  // Get energy statistics
  getStatistics: async (params = {}) => {
    const response = await apiClient.get('/energy/statistics', { params });
    return response.data;
  },

  // Get peak demand times
  getPeakDemandTimes: async (params = {}) => {
    const response = await apiClient.get('/energy/peak-times', { params });
    return response.data;
  },

  // Get energy cost data
  getCostAnalysis: async (params = {}) => {
    const response = await apiClient.get('/energy/cost-analysis', { params });
    return response.data;
  },

  // Get consumption trend comparison
  getTrendComparison: async (params = {}) => {
    const response = await apiClient.get('/energy/trend-comparison', { params });
    return response.data;
  },
};

export default energyApi;
