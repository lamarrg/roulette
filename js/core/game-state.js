// Centralized game state management (Singleton pattern)

import { loadBalance, saveBalance, loadHistory, saveHistory, loadSettings, saveSettings } from '../utils/storage.js';
import RouletteConfig from '../config/roulette-config.js';

class GameState {
  constructor() {
    if (GameState.instance) {
      return GameState.instance;
    }

    this.state = {
      balance: loadBalance(RouletteConfig.defaultBalance),
      currentBets: [],
      history: loadHistory(),
      lastResult: null,
      isSpinning: false,
      settings: loadSettings()
    };

    this.listeners = {
      balanceChange: [],
      betPlaced: [],
      betRemoved: [],
      betsCleared: [],
      spinStart: [],
      spinEnd: [],
      historyUpdate: [],
      settingsChange: []
    };

    GameState.instance = this;
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Get balance
  getBalance() {
    return this.state.balance;
  }

  // Update balance
  updateBalance(amount) {
    const oldBalance = this.state.balance;
    this.state.balance = Math.max(0, amount);
    saveBalance(this.state.balance);
    this.emit('balanceChange', {
      oldBalance,
      newBalance: this.state.balance,
      change: this.state.balance - oldBalance
    });
  }

  // Add to balance
  addToBalance(amount) {
    this.updateBalance(this.state.balance + amount);
  }

  // Subtract from balance
  subtractFromBalance(amount) {
    this.updateBalance(this.state.balance - amount);
  }

  // Reset balance to default
  resetBalance() {
    this.updateBalance(RouletteConfig.defaultBalance);
  }

  // Get current bets
  getCurrentBets() {
    return [...this.state.currentBets];
  }

  // Get total bet amount
  getTotalBetAmount() {
    return this.state.currentBets.reduce((total, bet) => total + bet.amount, 0);
  }

  // Add a bet
  placeBet(bet) {
    this.state.currentBets.push(bet);
    this.emit('betPlaced', bet);
  }

  // Remove a bet by ID
  removeBet(betId) {
    const betIndex = this.state.currentBets.findIndex(b => b.id === betId);
    if (betIndex !== -1) {
      const removedBet = this.state.currentBets.splice(betIndex, 1)[0];
      this.emit('betRemoved', removedBet);
      return removedBet;
    }
    return null;
  }

  // Remove last bet
  removeLastBet() {
    if (this.state.currentBets.length > 0) {
      const removedBet = this.state.currentBets.pop();
      this.emit('betRemoved', removedBet);
      return removedBet;
    }
    return null;
  }

  // Clear all bets
  clearBets() {
    const clearedBets = [...this.state.currentBets];
    this.state.currentBets = [];
    this.emit('betsCleared', clearedBets);
    return clearedBets;
  }

  // Get history
  getHistory() {
    return [...this.state.history];
  }

  // Add to history
  addToHistory(result) {
    this.state.history.unshift(result);

    // Limit history size
    if (this.state.history.length > RouletteConfig.history.maxEntries) {
      this.state.history = this.state.history.slice(0, RouletteConfig.history.maxEntries);
    }

    saveHistory(this.state.history);
    this.emit('historyUpdate', result);
  }

  // Clear history
  clearHistory() {
    this.state.history = [];
    saveHistory(this.state.history);
    this.emit('historyUpdate', null);
  }

  // Get last N spins
  getLastSpins(count = 10) {
    return this.state.history.slice(0, count);
  }

  // Get last result
  getLastResult() {
    return this.state.lastResult;
  }

  // Set last result
  setLastResult(result) {
    this.state.lastResult = result;
  }

  // Check if spinning
  isSpinning() {
    return this.state.isSpinning;
  }

  // Start spin
  startSpin() {
    this.state.isSpinning = true;
    this.emit('spinStart');
  }

  // End spin
  endSpin(result) {
    this.state.isSpinning = false;
    this.setLastResult(result);
    this.emit('spinEnd', result);
  }

  // Get settings
  getSettings() {
    return { ...this.state.settings };
  }

  // Update settings
  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    saveSettings(this.state.settings);
    this.emit('settingsChange', this.state.settings);
  }

  // Get specific setting
  getSetting(key, defaultValue = null) {
    return this.state.settings[key] ?? defaultValue;
  }

  // Set specific setting
  setSetting(key, value) {
    this.state.settings[key] = value;
    saveSettings(this.state.settings);
    this.emit('settingsChange', this.state.settings);
  }

  // Event system
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  // Statistics
  getStatistics() {
    const history = this.state.history;

    if (history.length === 0) {
      return {
        totalSpins: 0,
        totalBet: 0,
        totalWon: 0,
        netProfit: 0,
        biggestWin: 0,
        biggestLoss: 0,
        winRate: 0
      };
    }

    const stats = {
      totalSpins: history.length,
      totalBet: history.reduce((sum, h) => sum + h.totalBet, 0),
      totalWon: history.reduce((sum, h) => sum + h.totalWin, 0),
      netProfit: 0,
      biggestWin: 0,
      biggestLoss: 0,
      wins: 0,
      losses: 0
    };

    stats.netProfit = stats.totalWon - stats.totalBet;

    history.forEach(h => {
      if (h.netProfit > 0) {
        stats.wins++;
        stats.biggestWin = Math.max(stats.biggestWin, h.netProfit);
      } else if (h.netProfit < 0) {
        stats.losses++;
        stats.biggestLoss = Math.min(stats.biggestLoss, h.netProfit);
      }
    });

    stats.winRate = stats.totalSpins > 0 ? (stats.wins / stats.totalSpins) * 100 : 0;

    return stats;
  }

  // Get number frequencies
  getNumberFrequencies() {
    const frequencies = {};

    // Initialize all numbers with 0
    RouletteConfig.wheelOrder.forEach(num => {
      frequencies[num] = 0;
    });

    // Count occurrences
    this.state.history.forEach(h => {
      if (frequencies[h.spinNumber] !== undefined) {
        frequencies[h.spinNumber]++;
      }
    });

    return frequencies;
  }

  // Get hot and cold numbers
  getHotColdNumbers(lastN = 100) {
    const recentHistory = this.state.history.slice(0, lastN);
    const frequencies = {};

    // Initialize
    RouletteConfig.wheelOrder.forEach(num => {
      frequencies[num] = 0;
    });

    // Count
    recentHistory.forEach(h => {
      if (frequencies[h.spinNumber] !== undefined) {
        frequencies[h.spinNumber]++;
      }
    });

    // Sort by frequency
    const sorted = Object.entries(frequencies)
      .sort((a, b) => b[1] - a[1]);

    return {
      hot: sorted.slice(0, 5).map(([num, count]) => ({ number: num, count })),
      cold: sorted.slice(-5).reverse().map(([num, count]) => ({ number: num, count }))
    };
  }

  // Reset everything
  reset() {
    this.state = {
      balance: RouletteConfig.defaultBalance,
      currentBets: [],
      history: [],
      lastResult: null,
      isSpinning: false,
      settings: {
        soundEnabled: true,
        animationSpeed: 'normal'
      }
    };

    saveBalance(this.state.balance);
    saveHistory(this.state.history);
    saveSettings(this.state.settings);
  }
}

// Export singleton instance
const gameState = new GameState();
export default gameState;
