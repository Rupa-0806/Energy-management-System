export default function EnergyGauge({ current = 0, max = 100, unit = 'kW' }) {
  const percentage = (current / max) * 100;
  const getColor = () => {
    if (percentage < 60) return 'text-success-500';
    if (percentage < 80) return 'text-warning-500';
    return 'text-danger-500';
  };

  const getBgColor = () => {
    if (percentage < 60) return 'from-success-50 to-success-100 dark:from-success-900 dark:to-success-800';
    if (percentage < 80) return 'from-warning-50 to-warning-100 dark:from-warning-900 dark:to-warning-800';
    return 'from-danger-50 to-danger-100 dark:from-danger-900 dark:to-danger-800';
  };

  return (
    <div className={`bg-gradient-to-br ${getBgColor()} rounded-lg p-8`}>
      <div className="text-center">
        {/* Gauge */}
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-300 dark:text-gray-600"
            />

            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(percentage / 100) * 314} 314`}
              strokeLinecap="round"
              className={`${getColor()} transition-all duration-500 transform -rotate-90 origin-center`}
            />
          </svg>

          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-3xl font-bold ${getColor()}`}>{current}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">{unit}</p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Power Consumption
          </p>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {percentage.toFixed(1)}% of {max} {unit}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
