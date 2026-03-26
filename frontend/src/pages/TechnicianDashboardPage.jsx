import { useState, useEffect, useCallback } from 'react';
import { 
  Wrench, AlertCircle, Zap, FileText, RefreshCw, 
  CheckCircle, Clock, Play, Pause, Lightbulb,
  AlertTriangle, ArrowRight, User
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import toast from 'react-hot-toast';
import apiClient from '../services/api/client';
import { useAlertUpdates } from '../hooks/useRealtime';

export default function TechnicianDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [maintenanceQueue, setMaintenanceQueue] = useState([]);
  const [assignedAlerts, setAssignedAlerts] = useState([]);
  const [optimizationTips, setOptimizationTips] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [activeTab, setActiveTab] = useState('maintenance');
  const [selectedTask, setSelectedTask] = useState(null);
  const { latestAlert } = useAlertUpdates();

  // Fetch technician dashboard data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [maintenanceRes, alertsRes, tipsRes, dashboardRes] = await Promise.all([
        apiClient.get('/technician/maintenance'),
        apiClient.get('/technician/alerts/assigned'),
        apiClient.get('/technician/optimization-tips'),
        apiClient.get('/technician/dashboard')
      ]);
      setMaintenanceQueue(maintenanceRes.data || []);
      setAssignedAlerts(alertsRes.data || []);
      setOptimizationTips(tipsRes.data || []);
      setDashboard(dashboardRes.data || {});
    } catch (error) {
      console.error('Failed to fetch technician data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle real-time alert updates
  useEffect(() => {
    if (!latestAlert) return;

    if (latestAlert.type === 'ALERT_ASSIGNED' && latestAlert.alert) {
      setAssignedAlerts(prev => [latestAlert.alert, ...prev]);
      toast(`New alert assigned: ${latestAlert.alert.title}`, { icon: '🔔' });
    }
  }, [latestAlert]);

  // Start working on a maintenance task
  const handleStartTask = async (taskId) => {
    try {
      await apiClient.post(`/technician/maintenance/${taskId}/start`);
      setMaintenanceQueue(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: 'IN_PROGRESS' } : t
      ));
      toast.success('Task started');
    } catch (error) {
      toast.error('Failed to start task');
    }
  };

  // Complete a maintenance task
  const handleCompleteTask = async (taskId, notes = '') => {
    try {
      await apiClient.post(`/technician/maintenance/${taskId}/complete`, { notes });
      setMaintenanceQueue(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task completed');
      setSelectedTask(null);
    } catch (error) {
      toast.error('Failed to complete task');
    }
  };

  // Acknowledge an alert
  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await apiClient.post(`/technician/alerts/${alertId}/acknowledge`);
      setAssignedAlerts(prev => prev.map(a => 
        a.id === alertId ? { ...a, status: 'ACKNOWLEDGED' } : a
      ));
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
    }
  };

  // Resolve an alert
  const handleResolveAlert = async (alertId, resolution = '') => {
    try {
      await apiClient.post(`/technician/alerts/${alertId}/resolve`, { resolution });
      setAssignedAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success('Alert resolved');
    } catch (error) {
      toast.error('Failed to resolve alert');
    }
  };

  // Generate a report
  const handleGenerateReport = async (type) => {
    try {
      toast.loading('Generating report...', { id: 'report' });
      const response = await apiClient.post('/reports/generate', { type, format: 'text' });
      toast.success('Report generated', { id: 'report' });
    } catch (error) {
      toast.error('Failed to generate report', { id: 'report' });
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-warning-100 text-warning-700 dark:bg-warning-800 dark:text-warning-300';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300';
      case 'COMPLETED': return 'bg-success-100 text-success-700 dark:bg-success-800 dark:text-success-300';
      case 'ACTIVE': return 'bg-danger-100 text-danger-700 dark:bg-danger-800 dark:text-danger-300';
      case 'ACKNOWLEDGED': return 'bg-warning-100 text-warning-700 dark:bg-warning-800 dark:text-warning-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'border-l-danger-500';
      case 'MEDIUM': return 'border-l-warning-500';
      case 'LOW': return 'border-l-info-500';
      default: return 'border-l-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return <AlertCircle className="text-danger-500" size={20} />;
      case 'WARNING': return <AlertTriangle className="text-warning-500" size={20} />;
      default: return <Lightbulb className="text-info-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Wrench className="text-primary-500" />
            Technician Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Maintenance tasks and alert resolution
          </p>
        </div>
        <Button variant="secondary" onClick={fetchData}>
          <RefreshCw size={18} />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Tasks</p>
              <p className="text-2xl font-bold text-warning-600 mt-1">
                {dashboard?.pendingTasks || maintenanceQueue.filter(t => t.status === 'PENDING').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
              <Clock className="text-warning-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {dashboard?.inProgressTasks || maintenanceQueue.filter(t => t.status === 'IN_PROGRESS').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Play className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</p>
              <p className="text-2xl font-bold text-danger-600 mt-1">
                {dashboard?.assignedAlerts || assignedAlerts.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger-100 dark:bg-danger-900 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-danger-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
              <p className="text-2xl font-bold text-success-600 mt-1">
                {dashboard?.completedToday || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-success-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700 pb-2">
        {[
          { id: 'maintenance', label: 'Maintenance Queue', icon: Wrench },
          { id: 'alerts', label: 'Assigned Alerts', icon: AlertCircle },
          { id: 'tips', label: 'Optimization Tips', icon: Lightbulb },
          { id: 'reports', label: 'Reports', icon: FileText }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
            {tab.id === 'alerts' && assignedAlerts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-danger-500 text-white text-xs rounded-full">
                {assignedAlerts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          {maintenanceQueue.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-success-500 mb-3" size={48} />
                <p className="text-gray-500">No pending maintenance tasks</p>
              </div>
            </Card>
          ) : (
            maintenanceQueue.map(task => (
              <div
                key={task.id}
                className={`border-l-4 ${getPriorityColor(task.priority)} bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{task.title || task.deviceName}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      {task.priority && (
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          task.priority === 'HIGH' ? 'bg-danger-100 text-danger-700' :
                          task.priority === 'MEDIUM' ? 'bg-warning-100 text-warning-700' :
                          'bg-info-100 text-info-700'
                        }`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Device: {task.deviceName || 'N/A'}</span>
                      <span>Location: {task.location || 'N/A'}</span>
                      {task.scheduledFor && <span>Scheduled: {new Date(task.scheduledFor).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {task.status === 'PENDING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartTask(task.id)}
                        className="flex gap-1"
                      >
                        <Play size={16} />
                        Start
                      </Button>
                    )}
                    {task.status === 'IN_PROGRESS' && (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => setSelectedTask(task)}
                        className="flex gap-1"
                      >
                        <CheckCircle size={16} />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {assignedAlerts.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CheckCircle className="mx-auto text-success-500 mb-3" size={48} />
                <p className="text-gray-500">No assigned alerts</p>
              </div>
            </Card>
          ) : (
            assignedAlerts.map(alert => (
              <Card key={alert.id}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Device: {alert.deviceName || 'N/A'}</span>
                      <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.status === 'ACTIVE' && (
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tips Tab */}
      {activeTab === 'tips' && (
        <div className="space-y-4">
          {optimizationTips.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <Lightbulb className="mx-auto text-warning-500 mb-3" size={48} />
                <p className="text-gray-500">No optimization tips available</p>
              </div>
            </Card>
          ) : (
            optimizationTips.map((tip, idx) => (
              <Card key={idx}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="text-warning-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tip.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{tip.description}</p>
                    {tip.potentialSavings && (
                      <div className="flex items-center gap-2 text-sm text-success-600">
                        <Zap size={16} />
                        <span>Potential savings: {tip.potentialSavings}</span>
                      </div>
                    )}
                    {tip.deviceName && (
                      <div className="mt-2 text-xs text-gray-500">
                        Applies to: {tip.deviceName}
                      </div>
                    )}
                  </div>
                  {tip.actionable && (
                    <Button variant="secondary" size="sm" className="flex gap-1">
                      Apply <ArrowRight size={14} />
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <Card title="Generate Reports">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                onClick={() => handleGenerateReport('daily')}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                    <FileText className="text-primary-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Daily Summary</p>
                    <p className="text-sm text-gray-500">Tasks and alerts for today</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleGenerateReport('maintenance')}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center">
                    <Wrench className="text-success-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Maintenance Log</p>
                    <p className="text-sm text-gray-500">Completed maintenance tasks</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleGenerateReport('device')}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center">
                    <Zap className="text-warning-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Device Status</p>
                    <p className="text-sm text-gray-500">Current device health report</p>
                  </div>
                </div>
              </div>

              <div 
                onClick={() => handleGenerateReport('efficiency')}
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-info-100 dark:bg-info-900 rounded-lg flex items-center justify-center">
                    <Lightbulb className="text-info-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Efficiency Report</p>
                    <p className="text-sm text-gray-500">Energy optimization analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Complete Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Complete Task</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Mark &quot;{selectedTask.title || selectedTask.deviceName}&quot; as completed?
            </p>
            <textarea
              placeholder="Add completion notes (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg mb-4 dark:bg-slate-700 dark:text-white"
              rows={3}
              id="completion-notes"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setSelectedTask(null)}>Cancel</Button>
              <Button 
                variant="success" 
                onClick={() => {
                  const notes = document.getElementById('completion-notes').value;
                  handleCompleteTask(selectedTask.id, notes);
                }}
              >
                Complete Task
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
