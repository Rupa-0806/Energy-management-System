import { create } from 'zustand';

export const useEnergyStore = create((set) => ({
  // State
  consumptionData: [],
  realTimePower: 0,
  statistics: null,
  selectedTimePeriod: '24h',
  loading: false,
  error: null,

  // Actions
  setConsumptionData: (data) => set({ consumptionData: data }),

  setRealTimePower: (power) => set({ realTimePower: power }),

  setStatistics: (stats) => set({ statistics: stats }),

  setSelectedTimePeriod: (period) => set({ selectedTimePeriod: period }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  updateConsumptionData: (newData) => set((state) => ({
    consumptionData: [...state.consumptionData, newData],
  })),

  clearError: () => set({ error: null }),

  reset: () => set({
    consumptionData: [],
    realTimePower: 0,
    statistics: null,
    selectedTimePeriod: '24h',
    loading: false,
    error: null,
  }),
}));

export default useEnergyStore;
