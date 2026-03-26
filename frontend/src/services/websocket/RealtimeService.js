import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { API_CONFIG } from '../../utils/constants';

// WebSocket URL - uses full backend URL to support any frontend port
// Backend context-path=/api, so WebSocket endpoint is at /api/ws
const getWsUrl = () => {
  // Use configured WS_URL for explicit backend URL
  const baseUrl = API_CONFIG.WS_URL || 'http://localhost:8081';
  return `${baseUrl}/api/ws`;
};

class RealtimeService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
    this.listeners = new Map();
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
  }

  connect() {
    if (this.client && this.connected) return;

    const wsUrl = getWsUrl();
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('[STOMP]', str);
        }
      },
      onConnect: () => {
        console.log('[RealtimeService] Connected to WebSocket');
        this.connected = true;
        this.reconnectAttempts = 0;
        this._notifyListeners('connection', { connected: true });
        this._resubscribeAll();
      },
      onDisconnect: () => {
        console.log('[RealtimeService] Disconnected from WebSocket');
        this.connected = false;
        this._notifyListeners('connection', { connected: false });
      },
      onStompError: (frame) => {
        console.error('[RealtimeService] STOMP error:', frame.headers.message);
        this._notifyListeners('error', { message: frame.headers.message });
      },
    });

    this.client.activate();
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  _resubscribeAll() {
    // Re-subscribe to all topics after reconnect
    const topics = new Set();
    this.listeners.forEach((_, key) => {
      const topic = key.split(':')[0];
      topics.add(topic);
    });
    topics.forEach((topic) => this._subscribe(topic));
  }

  _subscribe(topic) {
    if (!this.client || !this.connected) return;
    if (this.subscriptions.has(topic)) return;

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        this._notifyListeners(topic, data);
      } catch (e) {
        console.error('[RealtimeService] Error parsing message:', e);
      }
    });

    this.subscriptions.set(topic, subscription);
  }

  _notifyListeners(topic, data) {
    this.listeners.forEach((callback, key) => {
      if (key.startsWith(topic + ':') || key === topic) {
        callback(data);
      }
    });
  }

  // Subscribe to energy readings
  onEnergyUpdate(callback) {
    const key = `/topic/energy:${Date.now()}_${Math.random()}`;
    this.listeners.set(key, callback);
    this._subscribe('/topic/energy');
    return () => {
      this.listeners.delete(key);
    };
  }

  // Subscribe to device updates
  onDeviceUpdate(callback) {
    const key = `/topic/devices:${Date.now()}_${Math.random()}`;
    this.listeners.set(key, callback);
    this._subscribe('/topic/devices');
    return () => {
      this.listeners.delete(key);
    };
  }

  // Subscribe to alert updates
  onAlertUpdate(callback) {
    const key = `/topic/alerts:${Date.now()}_${Math.random()}`;
    this.listeners.set(key, callback);
    this._subscribe('/topic/alerts');
    return () => {
      this.listeners.delete(key);
    };
  }

  // Subscribe to dashboard updates
  onDashboardUpdate(callback) {
    const key = `/topic/dashboard:${Date.now()}_${Math.random()}`;
    this.listeners.set(key, callback);
    this._subscribe('/topic/dashboard');
    return () => {
      this.listeners.delete(key);
    };
  }

  // Subscribe to connection status
  onConnectionChange(callback) {
    const key = `connection:${Date.now()}_${Math.random()}`;
    this.listeners.set(key, callback);
    return () => {
      this.listeners.delete(key);
    };
  }

  // Send a message to the server
  send(destination, body) {
    if (this.client && this.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }

  isConnected() {
    return this.connected;
  }
}

// Singleton instance
const realtimeService = new RealtimeService();
export default realtimeService;
