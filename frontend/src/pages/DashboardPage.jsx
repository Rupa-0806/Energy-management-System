import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Gauge,
  AlertCircle,
  DollarSign,
  Activity,
  Wifi,
  WifiOff,
  TrendingUp,
  TrendingDown,
  Thermometer,
  Clock,
  Server,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import KPICard from '../components/common/KPICard';
import Card from '../components/common/Card';
import EnergyGauge from '../components/charts/EnergyGauge';
import { useRealtimeConnection, useEnergyUpdates, useAlertUpdates } from '../hooks/useRealtime';
import realtimeService from '../services/websocket/RealtimeService';

const COST_PER_KWH = 0.12;
const MAX_CHART_POINTS = 60;

function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatNumber(num, decimals = 2) {
  if (num == null || isNaN(num)) return '0';
  return Number(num).toFixed(decimals);
}

// Real-time power chart that scrolls
function LivePowerChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="voltageGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '10px' }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            color: '#e2e8f0',
            fontSize: '12px',
          }}
          formatter={(value, name) => [formatNumber(value) + (name === 'power' ? ' W' : ' V'), name]}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="power"
          stroke="#10b981"
          fill="url(#powerGradient)"
          strokeWidth={2}
          dot={false}
          name="Power (W)"
          animationDuration={300}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Device power bar chart
function DevicePowerChart({ devices }) {
  const chartData = devices.map((d) => ({
    name: d.deviceName?.replace(/\s+/g, '\n').substring(0, 15) || 'Unknown',
    power: Math.round(d.power || 0),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '9px' }} angle={-20} textAnchor="end" height={60} />
        <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            color: '#e2e8f0',
          }}
          formatter={(value) => [formatNumber(value) + ' W', 'Power']}
        />
        <Bar dataKey="power" fill="#10b981" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Connection status indicator
function ConnectionStatus({ connected }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
      connected
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }`}>
      <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
      {connected ? 'Live' : 'Disconnected'}
      {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
    </div>
  );
}

// Live alerts feed
function LiveAlertsFeed({ alerts }) {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
        <AlertCircle size={32} />
        <p className="mt-2 text-sm">No recent alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
      {alerts.slice(0, 10).map((alert, idx) => (
        <div
          key={idx}
          className={`p-3 rounded-lg border-l-4 ${
            alert.severity === 'CRITICAL'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
              : alert.severity === 'WARNING'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.message}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              alert.severity === 'CRITICAL'
                ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
            }`}>
              {alert.severity}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Clock size={10} />
            {formatTime(alert.timestamp)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { connected } = useRealtimeConnection();
  const { readings, latestReading } = useEnergyUpdates();
  const { alerts: liveAlerts } = useAlertUpdates();

  // Dashboard state from WebSocket
  const [dashboardData, setDashboardData] = useState({
    totalPower: 0,
    totalEnergy: 0,
    avgPower: 0,
    activeDevices: 0,
    estimatedCost: 0,
    devices: [],
  });

  // Chart data for live power over time
  const [chartData, setChartData] = useState([]);

  // Subscribe to dashboard topic
  useEffect(() => {
    const unsub = realtimeService.onDashboardUpdate((data) => {
      if (data.type === 'DASHBOARD_UPDATE') {
        setDashboardData({
          totalPower: data.totalPower || 0,
          totalEnergy: data.totalEnergy || 0,
          avgPower: data.avgPower || 0,
          activeDevices: data.activeDevices || 0,
          estimatedCost: data.estimatedCost || 0,
          devices: data.devices || [],
        });

        setChartData((prev) => {
          const newPoint = {
            time: formatTime(data.timestamp),
            power: data.totalPower || 0,
            avg: data.avgPower || 0,
          };
          const updated = [...prev, newPoint];
          return updated.slice(-MAX_CHART_POINTS);
        });
      }
    });

    return () => unsub();
  }, []);

  // Compute peak power from readings so far
  const peakPower = chartData.length > 0
    ? Math.max(...chartData.map((d) => d.power))
    : 0;

  // Compute max capacity (sum of all device power ratings)
  const maxCapacity = dashboardData.devices.reduce((sum, d) => sum + (d.power || 0), 0) + 1000;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Real-Time Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live energy monitoring across all devices
          </p>
        </div>
        <ConnectionStatus connected={connected} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Live Power"
          value={formatNumber(dashboardData.totalPower, 0)}
          unit="W"
          icon={Zap}
          animated={false}
        />
        <KPICard
          title="Average Power"
          value={formatNumber(dashboardData.avgPower, 0)}
          unit="W"
          icon={Gauge}
          animated={false}
        />
        <KPICard
          title="Active Devices"
          value={dashboardData.activeDevices}
          icon={Server}
          animated={false}
        />
        <KPICard
          title="Estimated Cost"
          value={'$' + formatNumber(dashboardData.estimatedCost, 4)}
          icon={DollarSign}
          animated={false}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Power Gauge */}
        <div>
          <EnergyGauge
            current={Math.round(dashboardData.totalPower / 1000)}
            max={Math.round(maxCapacity / 1000)}
            unit="kW"
          />
          {/* Latest reading info */}
          {latestReading && (
            <div className="mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Activity size={14} className="text-emerald-500" />
                Latest Reading
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Device</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                    {latestReading.deviceName}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Power</span>
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatNumber(latestReading.power)} W
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Voltage</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {formatNumber(latestReading.voltage)} V
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Current</span>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {formatNumber(latestReading.current, 3)} A
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Power Chart */}
        <div className="lg:col-span-2">
          <Card title="Live Power Consumption" subtitle="Real-time total power across all devices" animated={false}>
            {chartData.length > 0 ? (
              <LivePowerChart data={chartData} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px] text-gray-400">
                <Activity size={32} className="animate-pulse" />
                <p className="mt-2 text-sm">Waiting for real-time data...</p>
                <p className="text-xs mt-1">Data updates every 5 seconds</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Power Distribution */}
        <Card title="Device Power Distribution" subtitle="Current power per device" animated={false}>
          {dashboardData.devices.length > 0 ? (
            <DevicePowerChart devices={dashboardData.devices} />
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              <p className="text-sm">Waiting for device data...</p>
            </div>
          )}
        </Card>

        {/* Live Alerts */}
        <Card title="Live Alerts" subtitle="Real-time alert notifications" icon={AlertCircle} animated={false}>
          <LiveAlertsFeed alerts={liveAlerts} />
        </Card>
      </div>

      {/* Device Status Table */}
      {dashboardData.devices.length > 0 && (
        <Card title="Device Status" subtitle="Live status of all active devices" animated={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Device</th>
                  <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Power</th>
                  <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Voltage</th>
                  <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Temperature</th>
                  <th className="text-center py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.devices.map((device, idx) => (
                  <tr key={idx} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">{device.deviceName}</td>
                    <td className="py-3 px-2 text-right text-emerald-600 dark:text-emerald-400 font-mono">
                      {formatNumber(device.power, 0)} W
                    </td>
                    <td className="py-3 px-2 text-right text-gray-700 dark:text-gray-300 font-mono">
                      {formatNumber(device.voltage, 1)} V
                    </td>
                    <td className="py-3 px-2 text-right font-mono">
                      <span className={`flex items-center justify-end gap-1 ${
                        device.temperature > 50
                          ? 'text-red-500'
                          : device.temperature > 40
                          ? 'text-yellow-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        <Thermometer size={12} />
                        {formatNumber(device.temperature, 1)}°C
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        device.status === 'ONLINE'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : device.status === 'WARNING'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {device.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
