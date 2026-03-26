import { AlertCircle, Check, Clock } from 'lucide-react';

export default function AlertsSummary({ alerts = [] }) {
  const activeAlerts = alerts.filter((a) => a.status === 'active').length;
  const acknowledgedAlerts = alerts.filter((a) => a.status === 'acknowledged').length;
  const criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <AlertCircle className="text-primary-500" size={24} />
        Alerts Summary
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Active Alerts */}
        <div className="bg-danger-50 dark:bg-danger-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-danger-600 dark:text-danger-300 uppercase tracking-wide">
                Active Alerts
              </p>
              <p className="text-2xl font-bold text-danger-700 dark:text-danger-200 mt-2">{activeAlerts}</p>
            </div>
            <AlertCircle className="text-danger-500 opacity-20" size={32} />
          </div>
        </div>

        {/* Acknowledged Alerts */}
        <div className="bg-warning-50 dark:bg-warning-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-warning-600 dark:text-warning-300 uppercase tracking-wide">
                Acknowledged
              </p>
              <p className="text-2xl font-bold text-warning-700 dark:text-warning-200 mt-2">{acknowledgedAlerts}</p>
            </div>
            <Clock className="text-warning-500 opacity-20" size={32} />
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-danger-50 dark:bg-danger-900 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-danger-600 dark:text-danger-300 uppercase tracking-wide">
                Critical
              </p>
              <p className="text-2xl font-bold text-danger-700 dark:text-danger-200 mt-2">{criticalAlerts}</p>
            </div>
            <AlertCircle className="text-danger-500 opacity-20" size={32} />
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Recent Alerts</h4>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-danger-500'
                      : alert.severity === 'warning'
                        ? 'bg-warning-500'
                        : 'bg-info-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
