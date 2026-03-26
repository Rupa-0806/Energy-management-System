import apiClient from './client';

export const deviceApi = {
  // Get all devices
  getDevices: async (params = {}) => {
    const response = await apiClient.get('/devices', { params });
    return response.data;
  },

  // Get device by ID
  getDevice: async (deviceId) => {
    const response = await apiClient.get(`/devices/${deviceId}`);
    return response.data;
  },

  // Create device
  createDevice: async (deviceData) => {
    const response = await apiClient.post('/devices', deviceData);
    return response.data;
  },

  // Update device
  updateDevice: async (deviceId, deviceData) => {
    const response = await apiClient.put(`/devices/${deviceId}`, deviceData);
    return response.data;
  },

  // Delete device
  deleteDevice: async (deviceId) => {
    const response = await apiClient.delete(`/devices/${deviceId}`);
    return response.data;
  },

  // Get device status
  getDeviceStatus: async (deviceId) => {
    const response = await apiClient.get(`/devices/${deviceId}/status`);
    return response.data;
  },

  // Get device groups
  getDeviceGroups: async () => {
    const response = await apiClient.get('/devices/groups');
    return response.data;
  },

  // Create device group
  createDeviceGroup: async (groupData) => {
    const response = await apiClient.post('/devices/groups', groupData);
    return response.data;
  },

  // Add device to group
  addDeviceToGroup: async (groupId, deviceId) => {
    const response = await apiClient.post(`/devices/groups/${groupId}/devices`, { deviceId });
    return response.data;
  },

  // Remove device from group
  removeDeviceFromGroup: async (groupId, deviceId) => {
    const response = await apiClient.delete(`/devices/groups/${groupId}/devices/${deviceId}`);
    return response.data;
  },
};

export default deviceApi;
