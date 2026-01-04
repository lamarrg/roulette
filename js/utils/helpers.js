// Utility helper functions

// Generate a unique ID for bets
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format number as currency
export function formatCurrency(amount) {
  return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Format number without decimal if whole number
export function formatNumber(num) {
  return num % 1 === 0 ? num.toString() : num.toFixed(2);
}

// Sleep/delay function
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce function to limit rapid calls
export function debounce(func, wait) {
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

// Throttle function to limit call frequency
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Get random integer between min and max (inclusive)
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Get random float between min and max
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Shuffle array (Fisher-Yates algorithm)
export function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Calculate distance between two points
export function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Check if point is inside rectangle
export function isPointInRect(x, y, rect) {
  return x >= rect.x &&
         x <= rect.x + rect.width &&
         y >= rect.y &&
         y <= rect.y + rect.height;
}

// Check if point is inside circle
export function isPointInCircle(x, y, cx, cy, radius) {
  return distance(x, y, cx, cy) <= radius;
}

// Clamp number between min and max
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

// Linear interpolation
export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

// Map value from one range to another
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

// Format timestamp to readable date/time
export function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const options = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleString('en-US', options);
}

// Get relative time (e.g., "2 minutes ago")
export function getRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

// Deep clone object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Check if two arrays are equal
export function arraysEqual(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  return arr1.every((val, index) => val === arr2[index]);
}

// Remove duplicates from array
export function unique(array) {
  return [...new Set(array)];
}

// Sum array of numbers
export function sum(array) {
  return array.reduce((acc, val) => acc + val, 0);
}

// Get average of array of numbers
export function average(array) {
  return array.length > 0 ? sum(array) / array.length : 0;
}

// Count occurrences in array
export function countOccurrences(array, value) {
  return array.filter(item => item === value).length;
}

// Get most frequent item in array
export function mostFrequent(array) {
  if (array.length === 0) return null;

  const counts = {};
  let maxCount = 0;
  let maxItem = array[0];

  array.forEach(item => {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxCount = counts[item];
      maxItem = item;
    }
  });

  return maxItem;
}

// Chunk array into smaller arrays
export function chunk(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Parse query string to object
export function parseQueryString(queryString) {
  const params = {};
  const pairs = queryString.substring(1).split('&');

  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  });

  return params;
}

// Create query string from object
export function createQueryString(params) {
  return Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

export default {
  generateId,
  formatCurrency,
  formatNumber,
  sleep,
  debounce,
  throttle,
  randomInt,
  randomFloat,
  shuffleArray,
  distance,
  isPointInRect,
  isPointInCircle,
  clamp,
  lerp,
  mapRange,
  formatTimestamp,
  getRelativeTime,
  deepClone,
  arraysEqual,
  unique,
  sum,
  average,
  countOccurrences,
  mostFrequent,
  chunk,
  parseQueryString,
  createQueryString,
  copyToClipboard
};
