import { create } from 'zustand';

export const useAlertStore = create((set) => ({
  // State
  alerts: [],
  alertRules: [],
  activeAlertsCount: 0,
  selectedAlert: null,
  loading: false,
  error: null,
  filters: {
    status: [],
    severity: [],
    device: null,
    search: '',
  },

  // Actions
  setAlerts: (alerts) => set({ alerts }),

  setAlertRules: (rules) => set({ alertRules: rules }),

  setActiveAlertsCount: (count) => set({ activeAlertsCount: count }),

  setSelectedAlert: (alert) => set({ selectedAlert: alert }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  addAlert: (alert) => set((state) => ({
    alerts: [alert, ...state.alerts],
    activeAlertsCount: state.activeAlertsCount + 1,
  })),

  updateAlert: (alertId, updatedData) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? { ...a, ...updatedData } : a
    ),
    selectedAlert: state.selectedAlert?.id === alertId
      ? { ...state.selectedAlert, ...updatedData }
      : state.selectedAlert,
  })),

  removeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== alertId),
  })),

  acknowledgeAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? { ...a, status: 'acknowledged' } : a
    ),
  })),

  resolveAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map(a =>
      a.id === alertId ? { ...a, status: 'resolved' } : a
    ),
    activeAlertsCount: Math.max(0, state.activeAlertsCount - 1),
  })),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters },
  })),

  clearFilters: () => set({
    filters: {
      status: [],
      severity: [],
      device: null,
      search: '',
    },
  }),

  clearError: () => set({ error: null }),
}));

export default useAlertStore;
