import apiClient from './client';

export const reportApi = {
  // Get all reports for current user
  getReports: async (params = {}) => {
    const response = await apiClient.get('/reports', { params });
    return response.data;
  },

  // Get report by ID
  getReport: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}`);
    return response.data;
  },

  // Generate a new report
  generateReport: async (reportData) => {
    const response = await apiClient.post('/reports/generate', reportData);
    return response.data;
  },

  // Download report
  downloadReport: async (reportId) => {
    const response = await apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete report
  deleteReport: async (reportId) => {
    const response = await apiClient.delete(`/reports/${reportId}`);
    return response.data;
  },

  // Export data as CSV
  exportData: async (params = {}) => {
    const response = await apiClient.get('/reports/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  // Helper to trigger download
  triggerDownload: (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default reportApi;
