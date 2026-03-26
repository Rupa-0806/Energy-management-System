import { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  Activity,
  TrendingUp,
  Thermometer,
  Wifi,
  WifiOff,
  Clock,
  BarChart3,
  Filter,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '../components/common/Card';
import { useRealtimeConnection, useEnergyUpdates } from '../hooks/useRealtime';
import realtimeService from '../services/websocket/RealtimeService';

const MAX_POINTS = 120;
const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatNum(v, d = 2) {
  return v != null && !isNaN(v) ? Number(v).toFixed(d) : '0';
}

// Per-device live line chart
function DeviceLineChart({ deviceData }) {
  const deviceNames = Object.keys(deviceData);
  if (deviceNames.length === 0) return null;

  // Convert to chart points
  const allTimes = new Set();
  deviceNames.forEach((name) => {
    deviceData[name].forEach((p) => allTimes.add(p.time));
  });

  const sortedTimes = [...allTimes].sort();
  const chartData = sortedTimes.map((time) => {
    const point = { time };
    deviceNames.forEach((name) => {
      const entry = deviceData[name].find((p) => p.time === time);
      point[name] = entry ? entry.power : null;
    });
    return point;
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData.slice(-60)} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '9px' }} />
        <YAxis stroke="#94a3b8" style={{ fontSize: '10px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            color: '#e2e8f0',
            fontSize: '11px',
          }}
          formatter={(value, name) => [formatNum(value, 0) + ' W', name]}
        />
        <Legend wrapperStyle={{ fontSize: '11px' }} />
        {deviceNames.map((name, i) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={COLORS[i % COLORS.length]}
            dot={false}
            strokeWidth={1.5}
            connectNulls
            animationDuration={300}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Power vs Voltage real-time chart
function PowerVoltageChart({ readings }) {
  const data = readings.slice(0, 60).reverse().map((r) => ({
    time: formatTime(r.timestamp),
    power: r.power,
    voltage: r.voltage,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="pwrG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="vltG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="time" stroke="#94a3b8" style={{ fontSize: '9px' }} />
        <YAxis yAxisId="left" stroke="#10b981" style={{ fontSize: '10px' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#6366f1" style={{ fontSize: '10px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            color: '#e2e8f0',
          }}
        />
        <Legend />
        <Area yAxisId="left" type="monotone" dataKey="power" stroke="#10b981" fill="url(#pwrG)" name="Power (W)" dot={false} />
        <Area yAxisId="right" type="monotone" dataKey="voltage" stroke="#6366f1" fill="url(#vltG)" name="Voltage (V)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function EnergyMonitoringPage() {
  const { connected } = useRealtimeConnection();
  const { readings, latestReading } = useEnergyUpdates();

  // Per-device time series
  const [deviceData, setDeviceData] = useState({});
  // Dashboard data for aggregate
  const [dashDevices, setDashDevices] = useState([]);
  // Filter state
  const [filterDevice, setFilterDevice] = useState('all');

  // Subscribe to dashboard topic for device list
  useEffect(() => {
    const unsub = realtimeService.onDashboardUpdate((data) => {
      if (data.type === 'DASHBOARD_UPDATE' && data.devices) {
        setDashDevices(data.devices);
      }
    });
    return () => unsub();
  }, []);

  // Build per-device time series from readings
  useEffect(() => {
    if (!latestReading) return;
    setDeviceData((prev) => {
      const name = latestReading.deviceName || `Device ${latestReading.deviceId}`;
      const existing = prev[name] || [];
      const updated = [
        ...existing,
        { time: formatTime(latestReading.timestamp), power: latestReading.power },
      ].slice(-MAX_POINTS);
      return { ...prev, [name]: updated };
    });
  }, [latestReading]);

  // Compute stats from readings
  const totalReadings = readings.length;
  const powers = readings.map((r) => r.power).filter((p) => p != null);
  const avgPower = powers.length > 0 ? powers.reduce((a, b) => a + b, 0) / powers.length : 0;
  const peakPower = powers.length > 0 ? Math.max(...powers) : 0;
  const minPower = powers.length > 0 ? Math.min(...powers) : 0;

  // Get available devices for filter
  const deviceNames = Object.keys(deviceData);
  const filteredDeviceData = filterDevice === 'all'
    ? deviceData
    : { [filterDevice]: deviceData[filterDevice] || [] };

  // Reading log (filtered)
  const filteredReadings = filterDevice === 'all'
    ? readings
    : readings.filter((r) => (r.deviceName || `Device ${r.deviceId}`) === filterDevice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Energy Monitoring</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time energy consumption tracking per device
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          connected
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          {connected ? 'Live' : 'Offline'}
        </div>
      </div>

      {/* Device Filter */}
      <Card animated={false}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by device:</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterDevice('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterDevice === 'all'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              All Devices
            </button>
            {deviceNames.map((name) => (
              <button
                key={name}
                onClick={() => setFilterDevice(name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterDevice === name
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Readings</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalReadings}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Power</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatNum(avgPower, 0)} W</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Peak Power</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatNum(peakPower, 0)} W</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min Power</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatNum(minPower, 0)} W</p>
        </div>
      </div>

      {/* Per-Device Line Chart */}
      <Card title="Per-Device Power (Live)" subtitle="Real-time power consumption per device" animated={false}>
        {Object.keys(filteredDeviceData).length > 0 ? (
          <DeviceLineChart deviceData={filteredDeviceData} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[350px] text-gray-400">
            <Activity size={32} className="animate-pulse" />
            <p className="mt-2 text-sm">Waiting for device data...</p>
          </div>
        )}
      </Card>

      {/* Power vs Voltage */}
      <Card title="Power vs Voltage" subtitle="Dual-axis comparison of power and voltage" animated={false}>
        {filteredReadings.length > 0 ? (
          <PowerVoltageChart readings={filteredReadings} />
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            <p className="text-sm">Waiting for readings...</p>
          </div>
        )}
      </Card>

      {/* Live Reading Log */}
      <Card title="Live Reading Log" subtitle="Most recent energy readings" animated={false}>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white dark:bg-slate-800">
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Time</th>
                <th className="text-left py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Device</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Power</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Voltage</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Current</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">Energy</th>
                <th className="text-right py-2 px-2 text-gray-500 dark:text-gray-400 font-medium">PF</th>
              </tr>
            </thead>
            <tbody>
              {filteredReadings.slice(0, 50).map((r, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-50 dark:border-slate-700/30 ${
                    idx === 0 ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                  }`}
                >
                  <td className="py-2 px-2 text-gray-500 dark:text-gray-400 font-mono text-xs">
                    {formatTime(r.timestamp)}
                  </td>
                  <td className="py-2 px-2 font-medium text-gray-900 dark:text-white text-xs">
                    {r.deviceName}
                  </td>
                  <td className="py-2 px-2 text-right text-emerald-600 dark:text-emerald-400 font-mono text-xs">
                    {formatNum(r.power, 0)} W
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300 font-mono text-xs">
                    {formatNum(r.voltage, 1)} V
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300 font-mono text-xs">
                    {formatNum(r.current, 3)} A
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300 font-mono text-xs">
                    {formatNum(r.energy, 4)} kWh
                  </td>
                  <td className="py-2 px-2 text-right text-gray-700 dark:text-gray-300 font-mono text-xs">
                    {formatNum(r.powerFactor, 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredReadings.length === 0 && (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <p className="text-sm">No readings yet. Data updates every 5 seconds.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
