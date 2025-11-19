/**
 * Performance optimization utilities
 * Includes debounce, throttle, and lazy loading helpers
 */

/**
 * Debounce function - delays execution until after wait time has passed since last call
 * Perfect for input handlers, search, window resize, etc.
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function - ensures function is called at most once per specified time period
 * Perfect for scroll handlers, mouse movements, button clicks
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request Animation Frame throttle - for smooth 60fps animations
 * @param {Function} func - Function to throttle
 * @returns {Function} RAF throttled function
 */
export function rafThrottle(func) {
  let rafId = null;
  return function executedFunction(...args) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        func.apply(this, args);
        rafId = null;
      });
    }
  };
}

/**
 * Lazy load images when they enter viewport
 * @param {HTMLImageElement} img - Image element
 * @param {string} src - Image source URL
 */
export function lazyLoadImage(img, src) {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  } else {
    // Fallback for older browsers
    img.src = src;
  }
}

/**
 * Prevent rapid repeated clicks (click throttle)
 * @param {Function} func - Click handler function
 * @param {number} delay - Minimum delay between clicks (ms)
 * @returns {Function} Click-throttled function
 */
export function preventRapidClicks(func, delay = 500) {
  let lastClick = 0;
  return function executedFunction(...args) {
    const now = Date.now();
    if (now - lastClick >= delay) {
      lastClick = now;
      return func.apply(this, args);
    }
  };
}

/**
 * Batch state updates to reduce re-renders
 * @param {Function} callback - Function containing state updates
 */
export function batchUpdates(callback) {
  // In React 18+, updates are automatically batched
  // This is a wrapper for backwards compatibility
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => callback());
  } else {
    setTimeout(callback, 0);
  }
}

/**
 * Memoize expensive function results
 * @param {Function} func - Function to memoize
 * @returns {Function} Memoized function
 */
export function memoize(func) {
  const cache = new Map();
  return function memoizedFunction(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - DOM element
 * @returns {boolean} True if element is visible in viewport
 */
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Performance monitor - track component render times
 * @param {string} componentName - Name of component
 * @param {Function} callback - Function to measure
 */
export function measurePerformance(componentName, callback) {
  const startTime = performance.now();
  const result = callback();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (duration > 16) { // More than one frame (60fps = 16.67ms per frame)
    console.warn(`⚠️ ${componentName} took ${duration.toFixed(2)}ms to render (slow)`);
  }
  
  return result;
}

/**
 * Simple event listener cleanup helper
 * @param {HTMLElement} element - DOM element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export function addCleanableListener(element, event, handler) {
  element.addEventListener(event, handler);
  return () => element.removeEventListener(event, handler);
}
