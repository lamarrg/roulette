// Main Application
// Initializes and coordinates all components

import RouletteConfig from './config/roulette-config.js';
import gameState from './core/game-state.js';
import betManager from './core/bet-manager.js';
import payoutCalculator from './core/payout-calculator.js';
import BettingTable from './components/betting-table.js';
import ChipSelector from './components/chip-selector.js';
import RouletteWheel from './components/wheel.js';
import BetHistory from './components/bet-history.js';
import audioManager from './utils/audio.js';
import { formatCurrency } from './utils/helpers.js';

class RouletteGame {
  constructor() {
    this.components = {};
    this.init();
  }

  async init() {
    // Initialize audio
    await audioManager.init();

    // Initialize components
    this.components.table = new BettingTable('betting-table');
    this.components.chipSelector = new ChipSelector('chips');
    this.components.wheel = new RouletteWheel('roulette-wheel', 'ball');
    this.components.history = new BetHistory('history-content', 'history-stats', 'history-list');

    // Set up component interactions
    this.components.chipSelector.onChipSelected = (value) => {
      this.components.table.setSelectedChip(value);
    };

    this.components.table.onBetPlaced = async () => {
      await audioManager.playChip();
      this.updateUI();
    };

    // Initialize UI
    this.setupEventListeners();
    this.updateUI();
    this.updateRecentSpins();

    console.log('Roulette game initialized');
  }

  setupEventListeners() {
    // Spin button
    document.getElementById('spin-button').addEventListener('click', () => {
      this.spin();
    });

    // Clear button
    document.getElementById('clear-button').addEventListener('click', () => {
      this.clearBets();
    });

    // Undo button
    document.getElementById('undo-button').addEventListener('click', () => {
      this.undoBet();
    });

    // Double button
    document.getElementById('double-button').addEventListener('click', () => {
      this.doubleBets();
    });

    // Repeat button
    document.getElementById('repeat-button').addEventListener('click', () => {
      this.repeatBets();
    });

    // Sound toggle
    document.getElementById('sound-toggle').addEventListener('click', () => {
      this.toggleSound();
    });

    // Settings button
    document.getElementById('settings-button').addEventListener('click', () => {
      this.showSettings();
    });

    // History toggle
    document.getElementById('toggle-history').addEventListener('click', () => {
      this.toggleHistory();
    });

    // Modal close buttons
    document.getElementById('close-settings').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('close-result').addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('continue-button').addEventListener('click', () => {
      this.closeModal();
    });

    // Settings controls
    document.getElementById('sound-enabled').addEventListener('change', (e) => {
      audioManager.setEnabled(e.target.checked);
      this.updateSoundIcon();
    });

    document.getElementById('reset-balance').addEventListener('click', () => {
      if (confirm('Reset balance to $1,000?')) {
        gameState.resetBalance();
        this.updateUI();
      }
    });

    document.getElementById('clear-history').addEventListener('click', () => {
      if (confirm('Clear all history?')) {
        gameState.clearHistory();
      }
    });

    // Game state listeners
    gameState.on('balanceChange', () => {
      this.updateUI();
    });

    gameState.on('spinStart', () => {
      this.disableControls();
    });

    gameState.on('spinEnd', (result) => {
      this.enableControls();
      this.updateUI();
      this.updateRecentSpins();
    });
  }

  async spin() {
    const bets = gameState.getCurrentBets();

    if (bets.length === 0) {
      this.showToast('Place at least one bet', 'error');
      return;
    }

    if (gameState.isSpinning()) return;

    // Start spin
    gameState.startSpin();

    // Deduct bet amounts from balance
    const totalBet = betManager.getTotalBetAmount();
    gameState.subtractFromBalance(totalBet);

    // Play spin sound
    await audioManager.playSpin();

    // Generate random result
    const result = this.generateSpinResult();

    // Animate wheel
    await this.components.wheel.spin(result);

    // Stop spin sound
    audioManager.stopSpin();

    // Calculate payouts
    const payoutResult = payoutCalculator.calculateAllPayouts(bets, result);

    // Add winnings to balance
    if (payoutResult.totalWin > 0) {
      gameState.addToBalance(payoutResult.totalWin);
      await audioManager.playWin();
    } else {
      await audioManager.playLose();
    }

    // Add to history
    const historyEntry = {
      timestamp: Date.now(),
      spinNumber: result,
      spinColor: RouletteConfig.getNumberColor(result),
      bets: [...bets],
      totalBet: payoutResult.totalBet,
      totalWin: payoutResult.totalWin,
      netProfit: payoutResult.netProfit
    };
    gameState.addToHistory(historyEntry);

    // Highlight winning number
    this.components.table.highlightWinningNumber(result);

    // Update last result display
    this.updateLastResult(result);

    // Clear bets
    gameState.clearBets();
    this.components.table.clearChips();

    // End spin
    gameState.endSpin(result);

    // Show result modal
    this.showResultModal(payoutResult);
  }

  generateSpinResult() {
    const wheelNumbers = RouletteConfig.wheelOrder;
    const randomIndex = Math.floor(Math.random() * wheelNumbers.length);
    return wheelNumbers[randomIndex];
  }

  clearBets() {
    betManager.clearAllBets();
    this.components.table.clearChips();
    this.updateUI();
  }

  undoBet() {
    const result = betManager.removeLastBet();
    if (result.success) {
      this.components.table.refreshChips();
      this.updateUI();
    }
  }

  async doubleBets() {
    const result = betManager.doubleAllBets();
    if (result.success) {
      this.components.table.refreshChips();
      this.updateUI();
      await audioManager.playChip();
    } else {
      this.showToast(result.error, 'error');
    }
  }

  async repeatBets() {
    const result = betManager.repeatLastBets();
    if (result.success) {
      this.components.table.refreshChips();
      this.updateUI();
      await audioManager.playChip();
    } else {
      this.showToast(result.error, 'error');
    }
  }

  toggleSound() {
    const enabled = !audioManager.isEnabled();
    audioManager.setEnabled(enabled);
    this.updateSoundIcon();
    document.getElementById('sound-enabled').checked = enabled;
  }

  updateSoundIcon() {
    const icon = document.querySelector('.sound-icon');
    icon.textContent = audioManager.isEnabled() ? '🔊' : '🔇';
  }

  showSettings() {
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('settings-modal').style.display = 'block';
    document.getElementById('result-modal').style.display = 'none';
  }

  showResultModal(payoutResult) {
    const modal = document.getElementById('result-modal');
    const overlay = document.getElementById('modal-overlay');

    // Update result number
    const numberEl = document.getElementById('modal-result-number');
    const colorEl = document.getElementById('modal-result-color');

    numberEl.textContent = payoutResult.spinNumber;
    numberEl.className = `result-number-large ${payoutResult.spinColor}`;
    colorEl.textContent = payoutResult.spinColor.charAt(0).toUpperCase() + payoutResult.spinColor.slice(1);

    // Update summary
    document.getElementById('modal-total-bet').textContent = formatCurrency(payoutResult.totalBet);
    document.getElementById('modal-total-win').textContent = formatCurrency(payoutResult.totalWin);

    const netResult = document.getElementById('modal-net-result');
    netResult.textContent = formatCurrency(payoutResult.netProfit);
    netResult.className = `summary-value ${payoutResult.netProfit >= 0 ? 'positive' : 'negative'}`;

    // Show modal
    modal.style.display = 'block';
    overlay.classList.remove('hidden');
  }

  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('settings-modal').style.display = 'none';
    document.getElementById('result-modal').style.display = 'none';
  }

  toggleHistory() {
    this.components.history.toggle();
    const toggleText = document.getElementById('history-toggle-text');
    const isHidden = document.getElementById('history-content').classList.contains('hidden');
    toggleText.textContent = isHidden ? 'Show' : 'Hide';
  }

  updateUI() {
    // Update balance display
    const balance = gameState.getBalance();
    document.getElementById('balance-display').textContent = formatCurrency(balance);

    // Update total bet
    const totalBet = betManager.getTotalBetAmount();
    document.getElementById('total-bet').textContent = formatCurrency(totalBet);

    // Update available balance
    const availableBalance = betManager.getAvailableBalance();
    document.getElementById('available-balance').textContent = formatCurrency(availableBalance);

    // Enable/disable spin button
    const spinButton = document.getElementById('spin-button');
    if (totalBet > 0 && !gameState.isSpinning()) {
      spinButton.disabled = false;
    } else {
      spinButton.disabled = true;
    }

    // Update button states
    const hasBalances = totalBet > 0;
    document.getElementById('clear-button').disabled = !hasBalances || gameState.isSpinning();
    document.getElementById('undo-button').disabled = !hasBalances || gameState.isSpinning();
    document.getElementById('double-button').disabled = !hasBalances || gameState.isSpinning();

    const hasHistory = gameState.getHistory().length > 0;
    document.getElementById('repeat-button').disabled = !hasHistory || gameState.isSpinning();
  }

  updateLastResult(number) {
    const resultNumber = document.getElementById('result-number');
    const color = RouletteConfig.getNumberColor(number);
    resultNumber.textContent = number;
    resultNumber.className = `result-number ${color}`;
  }

  disableControls() {
    document.getElementById('spin-button').disabled = true;
    document.getElementById('clear-button').disabled = true;
    document.getElementById('undo-button').disabled = true;
    document.getElementById('double-button').disabled = true;
    document.getElementById('repeat-button').disabled = true;
  }

  enableControls() {
    // Will be updated by updateUI()
    this.updateUI();
  }

  showToast(message, type = 'error') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  updateRecentSpins() {
    const recentSpinsContainer = document.getElementById('recent-spins');
    const history = gameState.getHistory();
    const maxSpins = 15; // Show last 15 spins
    const recentSpins = history.slice(0, maxSpins);

    if (recentSpins.length === 0) {
      recentSpinsContainer.innerHTML = '';
      return;
    }

    // Build HTML for recent spins (newest first)
    recentSpinsContainer.innerHTML = recentSpins.map(item => {
      const color = RouletteConfig.getNumberColor(item.spinNumber);
      return `<div class="recent-spin-number ${color}">${item.spinNumber}</div>`;
    }).join('');
  }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RouletteGame();
  });
} else {
  new RouletteGame();
}
