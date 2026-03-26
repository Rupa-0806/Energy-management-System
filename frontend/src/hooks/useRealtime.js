import { useEffect, useState, useCallback, useRef } from 'react';
import realtimeService from '../services/websocket/RealtimeService';

/**
 * Hook to manage WebSocket connection lifecycle
 */
export function useRealtimeConnection() {
  const [connected, setConnected] = useState(realtimeService.isConnected());

  useEffect(() => {
    realtimeService.connect();

    const unsub = realtimeService.onConnectionChange((data) => {
      setConnected(data.connected);
    });

    return () => {
      unsub();
    };
  }, []);

  return { connected };
}

/**
 * Hook to subscribe to real-time energy updates
 */
export function useEnergyUpdates() {
  const [readings, setReadings] = useState([]);
  const [latestReading, setLatestReading] = useState(null);
  const maxReadings = 100;

  useEffect(() => {
    const unsub = realtimeService.onEnergyUpdate((data) => {
      if (data.type === 'NEW_READING' && data.reading) {
        setLatestReading(data.reading);
        setReadings((prev) => {
          const updated = [data.reading, ...prev];
          return updated.slice(0, maxReadings);
        });
      }
    });

    return () => unsub();
  }, []);

  const clearReadings = useCallback(() => {
    setReadings([]);
    setLatestReading(null);
  }, []);

  return { readings, latestReading, clearReadings };
}

/**
 * Hook to subscribe to real-time device updates
 */
export function useDeviceUpdates() {
  const [deviceUpdates, setDeviceUpdates] = useState([]);
  const [latestUpdate, setLatestUpdate] = useState(null);

  useEffect(() => {
    const unsub = realtimeService.onDeviceUpdate((data) => {
      setLatestUpdate(data);
      setDeviceUpdates((prev) => [data, ...prev].slice(0, 50));
    });

    return () => unsub();
  }, []);

  return { deviceUpdates, latestUpdate };
}

/**
 * Hook to subscribe to real-time alert updates
 */
export function useAlertUpdates() {
  const [alerts, setAlerts] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);

  useEffect(() => {
    const unsub = realtimeService.onAlertUpdate((data) => {
      setLatestAlert(data);
      setAlerts((prev) => [data, ...prev].slice(0, 50));
    });

    return () => unsub();
  }, []);

  return { alerts, latestAlert };
}

/**
 * Hook for real-time dashboard with aggregated stats
 */
export function useRealtimeDashboard() {
  const { readings, latestReading } = useEnergyUpdates();
  const [stats, setStats] = useState({
    totalPower: 0,
    avgPower: 0,
    peakPower: 0,
    readingsCount: 0,
    devicesReporting: new Set(),
  });

  useEffect(() => {
    if (readings.length === 0) return;

    const powers = readings.map((r) => r.power);
    const totalPower = powers.reduce((sum, p) => sum + p, 0);
    const devices = new Set(readings.map((r) => r.deviceId));

    setStats({
      totalPower: Math.round(totalPower * 100) / 100,
      avgPower: Math.round((totalPower / powers.length) * 100) / 100,
      peakPower: Math.round(Math.max(...powers) * 100) / 100,
      readingsCount: readings.length,
      devicesReporting: devices,
    });
  }, [readings]);

  return { stats, readings, latestReading };
}

export default useRealtimeConnection;
