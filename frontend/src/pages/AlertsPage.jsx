import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Check, X, RefreshCw, CheckCheck } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { alertApi } from '../services/api/alertApi';
import { useAlertUpdates } from '../hooks/useRealtime';
import toast from 'react-hot-toast';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { latestAlert } = useAlertUpdates();

  // Fetch alerts from API
  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await alertApi.getAlerts();
      // Handle both paginated and list responses
      const alertList = response.content || response;
      setAlerts(Array.isArray(alertList) ? alertList : []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Handle real-time alert updates
  useEffect(() => {
    if (!latestAlert) return;

    if (latestAlert.type === 'NEW_ALERT' && latestAlert.alert) {
      const newAlert = latestAlert.alert;
      setAlerts(prev => [newAlert, ...prev]);
      toast(
        <div>
          <strong>{newAlert.severity?.toUpperCase()}</strong>: {newAlert.title}
        </div>,
        {
          icon: newAlert.severity === 'CRITICAL' ? '🚨' : '⚠️',
          duration: 5000,
        }
      );
    } else if (latestAlert.type === 'ALERT_ACKNOWLEDGED' && latestAlert.alert) {
      setAlerts(prev => prev.map(a => 
        a.id === latestAlert.alert.id ? { ...a, status: 'ACKNOWLEDGED' } : a
      ));
    } else if (latestAlert.type === 'ALERT_RESOLVED' && latestAlert.alert) {
      setAlerts(prev => prev.map(a => 
        a.id === latestAlert.alert.id ? { ...a, status: 'RESOLVED' } : a
      ));
    } else if (latestAlert.type === 'ALERT_DELETED' && latestAlert.alertId) {
      setAlerts(prev => prev.filter(a => a.id !== latestAlert.alertId));
    }
  }, [latestAlert]);

  const filteredAlerts = alerts.filter((alert) => {
    const status = (alert.status || '').toLowerCase();
    if (filter === 'all') return status !== 'resolved';
    if (filter === 'active') return status === 'active';
    if (filter === 'acknowledged') return status === 'acknowledged';
    if (filter === 'resolved') return status === 'resolved';
    return true;
  });

  const handleAcknowledge = async (alertId) => {
    try {
      await alertApi.acknowledgeAlert(alertId);
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a)));
      toast.success('Alert acknowledged');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      toast.error('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (alertId) => {
    try {
      await alertApi.resolveAlert(alertId);
      setAlerts(alerts.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a)));
      toast.success('Alert resolved');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      // Acknowledge all active alerts
      const activeAlerts = alerts.filter(a => (a.status || '').toUpperCase() === 'ACTIVE');
      await Promise.all(activeAlerts.map(a => alertApi.acknowledgeAlert(a.id)));
      setAlerts(alerts.map(a => 
        (a.status || '').toUpperCase() === 'ACTIVE' ? { ...a, status: 'ACKNOWLEDGED' } : a
      ));
      toast.success(`${activeAlerts.length} alerts acknowledged`);
    } catch (error) {
      console.error('Failed to acknowledge all alerts:', error);
      toast.error('Failed to acknowledge all alerts');
    }
  };

  const getSeverityColor = (severity) => {
    const sev = (severity || '').toLowerCase();
    switch (sev) {
      case 'critical':
        return 'bg-danger-50 dark:bg-danger-900 border-danger-200 dark:border-danger-700';
      case 'warning':
        return 'bg-warning-50 dark:bg-warning-900 border-warning-200 dark:border-warning-700';
      case 'info':
        return 'bg-info-50 dark:bg-info-900 border-info-200 dark:border-info-700';
      default:
        return 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    const sev = (severity || '').toLowerCase();
    switch (sev) {
      case 'critical':
        return 'text-danger-700 dark:text-danger-300 bg-danger-100 dark:bg-danger-800';
      case 'warning':
        return 'text-warning-700 dark:text-warning-300 bg-warning-100 dark:bg-warning-800';
      case 'info':
        return 'text-info-700 dark:text-info-300 bg-info-100 dark:bg-info-800';
      default:
        return 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const activeCount = alerts.filter((a) => (a.status || '').toUpperCase() === 'ACTIVE').length;
  const acknowledgedCount = alerts.filter((a) => (a.status || '').toUpperCase() === 'ACKNOWLEDGED').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor and manage system alerts and notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="md" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
          {activeCount > 0 && (
            <Button variant="warning" size="md" onClick={handleAcknowledgeAll} className="flex gap-2">
              <CheckCheck size={18} />
              Acknowledge All
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-danger-600 dark:text-danger-400 mt-1">{activeCount}</p>
            </div>
            <div className="w-12 h-12 bg-danger-100 dark:bg-danger-900 rounded-lg flex items-center justify-center text-danger-600 dark:text-danger-300">
              <AlertCircle size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Acknowledged</p>
              <p className="text-2xl font-bold text-warning-600 dark:text-warning-400 mt-1">{acknowledgedCount}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center text-warning-600 dark:text-warning-300">
              <Check size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Alerts</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-primary-600 dark:text-primary-300">
              {alerts.length}
            </div>
          </div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'acknowledged', 'resolved'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="animate-spin text-primary-500" size={32} />
            </div>
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card>
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No alerts to display</p>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${getSeverityBadgeColor(alert.severity)}`}>
                      {(alert.severity || 'INFO').toUpperCase()}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      (alert.status || '').toUpperCase() === 'ACTIVE' 
                        ? 'bg-danger-100 text-danger-700 dark:bg-danger-800 dark:text-danger-300'
                        : (alert.status || '').toUpperCase() === 'ACKNOWLEDGED'
                        ? 'bg-warning-100 text-warning-700 dark:bg-warning-800 dark:text-warning-300'
                        : 'bg-success-100 text-success-700 dark:bg-success-800 dark:text-success-300'
                    }`}>
                      {(alert.status || 'ACTIVE').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alert.message}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Device: {alert.deviceName || alert.device || 'N/A'}</span>
                    <span>{formatTime(alert.createdAt)}</span>
                    {alert.acknowledgedBy && (
                      <span>Acknowledged by: {alert.acknowledgedBy}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(alert.status || '').toUpperCase() === 'ACTIVE' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="text-warning-600 dark:text-warning-400"
                      title="Acknowledge"
                    >
                      <Check size={18} />
                    </Button>
                  )}
                  {(alert.status || '').toUpperCase() !== 'RESOLVED' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleResolve(alert.id)}
                      className="text-success-600 dark:text-success-400"
                      title="Resolve"
                    >
                      <X size={18} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
