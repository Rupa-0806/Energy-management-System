/**
 * Debounce function - delays execution until after delay ms have passed without being called
 */
export function debounce(func, delay = 300) {
  let timeoutId;

  return function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function - limits execution to at most once per delay ms
 */
export function throttle(func, delay = 300) {
  let lastCall = 0;
  let timeoutId;

  return function throttled(...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        func(...args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Request idle callback polyfill with fallback to setTimeout
 */
export function scheduleIdleCallback(callback, options = {}) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  }
  return setTimeout(callback, 1);
}

/**
 * Cancel idle callback with fallback
 */
export function cancelIdleCallback(id) {
  if ('cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  }
  return clearTimeout(id);
}

/**
 * Batch multiple async operations and execute callbacks
 */
export async function batchRequests(requests, options = {}) {
  const { concurrency = 3, onProgress = null } = options;

  const results = [];
  const executing = new Set();

  for (let i = 0; i < requests.length; i++) {
    const promise = Promise.resolve()
      .then(() => requests[i]())
      .then((result) => {
        results[i] = result;
        executing.delete(promise);
        if (onProgress) onProgress({ completed: i + 1, total: requests.length });
      });

    executing.add(promise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
