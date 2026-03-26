import { create } from 'zustand';

export const useDeviceStore = create((set) => ({
  // State
  devices: [],
  selectedDevice: null,
  deviceGroups: [],
  loading: false,
  error: null,
  filters: {
    status: [],
    type: [],
    group: null,
    search: '',
  },

  // Actions
  setDevices: (devices) => set({ devices }),
  
  setSelectedDevice: (device) => set({ selectedDevice: device }),

  setDeviceGroups: (groups) => set({ deviceGroups: groups }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  addDevice: (device) => set((state) => ({
    devices: [...state.devices, device],
  })),

  updateDevice: (deviceId, updatedData) => set((state) => ({
    devices: state.devices.map(d =>
      d.id === deviceId ? { ...d, ...updatedData } : d
    ),
    selectedDevice: state.selectedDevice?.id === deviceId
      ? { ...state.selectedDevice, ...updatedData }
      : state.selectedDevice,
  })),

  removeDevice: (deviceId) => set((state) => ({
    devices: state.devices.filter(d => d.id !== deviceId),
    selectedDevice: state.selectedDevice?.id === deviceId ? null : state.selectedDevice,
  })),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  clearFilters: () => set({
    filters: {
      status: [],
      type: [],
      group: null,
      search: '',
    },
  }),

  clearError: () => set({ error: null }),
}));

export default useDeviceStore;
