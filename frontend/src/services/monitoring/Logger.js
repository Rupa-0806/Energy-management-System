class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 500;
    this.levels = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
    this.currentLevel = this.levels.INFO;
  }

  setLevel(level) {
    this.currentLevel = this.levels[level] || this.levels.INFO;
  }

  addLog(level, message, data = null) {
    const log = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logs.push(log);

    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Send to backend in production
    if (process.env.NODE_ENV === 'production' && level === 'ERROR') {
      this.reportError(log);
    }
  }

  debug(message, data) {
    if (this.currentLevel <= this.levels.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
      this.addLog('DEBUG', message, data);
    }
  }

  info(message, data) {
    if (this.currentLevel <= this.levels.INFO) {
      console.info(`[INFO] ${message}`, data);
      this.addLog('INFO', message, data);
    }
  }

  warn(message, data) {
    if (this.currentLevel <= this.levels.WARN) {
      console.warn(`[WARN] ${message}`, data);
      this.addLog('WARN', message, data);
    }
  }

  error(message, data) {
    if (this.currentLevel <= this.levels.ERROR) {
      console.error(`[ERROR] ${message}`, data);
      this.addLog('ERROR', message, data);
    }
  }

  getLogs(filter = {}) {
    let filtered = this.logs;

    if (filter.level) {
      filtered = filtered.filter((log) => log.level === filter.level);
    }

    if (filter.limit) {
      filtered = filtered.slice(-filter.limit);
    }

    return filtered;
  }

  clearLogs() {
    this.logs = [];
  }

  async reportError(log) {
    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (apiUrl) {
        await fetch(`${apiUrl}/logs/errors`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...log,
            userAgent: navigator.userAgent,
            url: window.location.href,
          }),
        });
      }
    } catch (e) {
      console.error('Failed to report error:', e);
    }
  }

  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

export default new Logger();
