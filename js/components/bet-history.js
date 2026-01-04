// Bet History Component
// Displays spin history and statistics

import gameState from '../core/game-state.js';
import RouletteConfig from '../config/roulette-config.js';
import { formatCurrency, formatTimestamp, getRelativeTime } from '../utils/helpers.js';

class BetHistory {
  constructor(containerId, statsId, listId) {
    this.container = document.getElementById(containerId);
    this.statsContainer = document.getElementById(statsId);
    this.listContainer = document.getElementById(listId);
    this.setupListeners();
    this.render();
  }

  setupListeners() {
    gameState.on('historyUpdate', () => {
      this.render();
    });

    gameState.on('spinEnd', () => {
      this.render();
    });
  }

  render() {
    this.renderStats();
    this.renderList();
  }

  renderStats() {
    const stats = gameState.getStatistics();

    this.statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Spins</div>
        <div class="stat-value">${stats.totalSpins}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Bet</div>
        <div class="stat-value">${formatCurrency(stats.totalBet)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Won</div>
        <div class="stat-value">${formatCurrency(stats.totalWon)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Net Profit</div>
        <div class="stat-value ${stats.netProfit >= 0 ? 'positive' : 'negative'}">
          ${formatCurrency(stats.netProfit)}
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Win Rate</div>
        <div class="stat-value">${stats.winRate.toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Biggest Win</div>
        <div class="stat-value positive">${formatCurrency(stats.biggestWin)}</div>
      </div>
    `;
  }

  renderList() {
    const history = gameState.getHistory();

    if (history.length === 0) {
      this.listContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--color-text-muted);">
          No spins yet
        </div>
      `;
      return;
    }

    this.listContainer.innerHTML = history.map(item => this.createHistoryItem(item)).join('');
  }

  createHistoryItem(item) {
    const color = RouletteConfig.getNumberColor(item.spinNumber);
    const profit = item.netProfit;
    const profitClass = profit > 0 ? 'positive' : profit < 0 ? 'negative' : 'neutral';
    const profitSymbol = profit > 0 ? '+' : '';

    return `
      <div class="history-item">
        <div class="history-number ${color}">
          ${item.spinNumber}
        </div>
        <div class="history-details">
          <div class="history-time">${getRelativeTime(item.timestamp)}</div>
          <div class="history-bets">${item.bets?.length || 0} bet${item.bets?.length !== 1 ? 's' : ''}</div>
        </div>
        <div class="history-result">
          <div class="history-profit ${profitClass}">
            ${profitSymbol}${formatCurrency(profit)}
          </div>
        </div>
      </div>
    `;
  }

  toggle() {
    this.container.classList.toggle('hidden');
  }

  show() {
    this.container.classList.remove('hidden');
  }

  hide() {
    this.container.classList.add('hidden');
  }

  clear() {
    gameState.clearHistory();
    this.render();
  }
}

export default BetHistory;
