// localStorage wrapper with error handling

const STORAGE_PREFIX = 'roulette-';

// Storage keys
export const StorageKeys = {
  BALANCE: `${STORAGE_PREFIX}balance`,
  HISTORY: `${STORAGE_PREFIX}history`,
  SETTINGS: `${STORAGE_PREFIX}settings`
};

// Check if localStorage is available
function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

// Save data to localStorage
export function save(key, value) {
  if (!isStorageAvailable()) {
    console.warn('localStorage is not available');
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded');
    } else {
      console.error('Error saving to localStorage:', e);
    }
    return false;
  }
}

// Load data from localStorage
export function load(key, defaultValue = null) {
  if (!isStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
}

// Remove item from localStorage
export function remove(key) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (e) {
    console.error('Error removing from localStorage:', e);
    return false;
  }
}

// Clear all roulette-related data
export function clearAll() {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    Object.values(StorageKeys).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (e) {
    console.error('Error clearing localStorage:', e);
    return false;
  }
}

// Get storage usage information
export function getStorageInfo() {
  if (!isStorageAvailable()) {
    return { available: false };
  }

  try {
    let totalSize = 0;
    Object.values(StorageKeys).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        totalSize += item.length * 2; // Approximate size in bytes (UTF-16)
      }
    });

    return {
      available: true,
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      keys: Object.values(StorageKeys).filter(key => localStorage.getItem(key) !== null)
    };
  } catch (e) {
    console.error('Error getting storage info:', e);
    return { available: false, error: e.message };
  }
}

// Balance management
export function saveBalance(balance) {
  return save(StorageKeys.BALANCE, balance);
}

export function loadBalance(defaultBalance = 1000) {
  return load(StorageKeys.BALANCE, defaultBalance);
}

// History management
export function saveHistory(history) {
  return save(StorageKeys.HISTORY, history);
}

export function loadHistory() {
  return load(StorageKeys.HISTORY, []);
}

// Settings management
export function saveSettings(settings) {
  return save(StorageKeys.SETTINGS, settings);
}

export function loadSettings() {
  return load(StorageKeys.SETTINGS, {
    soundEnabled: true,
    animationSpeed: 'normal'
  });
}

// Migrate old data format if needed
export function migrateData() {
  try {
    // Check for any old format data and migrate if necessary
    // This is a placeholder for future schema changes
    const settings = loadSettings();

    // Ensure settings have all required fields
    const defaultSettings = {
      soundEnabled: true,
      animationSpeed: 'normal'
    };

    const migratedSettings = { ...defaultSettings, ...settings };
    saveSettings(migratedSettings);

    return true;
  } catch (e) {
    console.error('Error migrating data:', e);
    return false;
  }
}

// Export/import functionality
export function exportData() {
  if (!isStorageAvailable()) {
    return null;
  }

  try {
    const data = {
      balance: loadBalance(),
      history: loadHistory(),
      settings: loadSettings(),
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  } catch (e) {
    console.error('Error exporting data:', e);
    return null;
  }
}

export function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    if (data.balance !== undefined) saveBalance(data.balance);
    if (data.history) saveHistory(data.history);
    if (data.settings) saveSettings(data.settings);

    return true;
  } catch (e) {
    console.error('Error importing data:', e);
    return false;
  }
}

export default {
  StorageKeys,
  save,
  load,
  remove,
  clearAll,
  getStorageInfo,
  saveBalance,
  loadBalance,
  saveHistory,
  loadHistory,
  saveSettings,
  loadSettings,
  migrateData,
  exportData,
  importData
};
