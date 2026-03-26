import axios from 'axios';

const API_BASE = '/api/public/stats';

export const publicStatsApi = {
  /**
   * Fetch public statistics (no auth required)
   */
  getStats: async () => {
    const response = await axios.get(API_BASE);
    return response.data;
  },
};

export default publicStatsApi;
