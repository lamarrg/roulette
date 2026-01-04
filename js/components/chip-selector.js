// Chip Selector Component
// Handles chip denomination selection

import RouletteConfig from '../config/roulette-config.js';
import gameState from '../core/game-state.js';
import betManager from '../core/bet-manager.js';

class ChipSelector {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedChip = null;
    this.onChipSelected = null;
    this.render();
    this.attachListeners();
    this.setupStateListeners();

    // Select first chip by default
    if (RouletteConfig.chipDenominations.length > 0) {
      this.selectChip(RouletteConfig.chipDenominations[0]);
    }
  }

  render() {
    this.container.innerHTML = '';

    RouletteConfig.chipDenominations.forEach(value => {
      const chip = this.createChip(value);
      this.container.appendChild(chip);
    });
  }

  createChip(value) {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.dataset.value = value;
    chip.textContent = `$${value}`;

    // Check if player can afford this chip
    this.updateChipAvailability(chip);

    return chip;
  }

  attachListeners() {
    this.container.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip || chip.classList.contains('disabled')) return;

      const value = parseInt(chip.dataset.value);
      this.selectChip(value);
    });
  }

  selectChip(value) {
    // Remove previous selection
    const chips = this.container.querySelectorAll('.chip');
    chips.forEach(c => c.classList.remove('selected'));

    // Select new chip
    const selectedChipElement = this.container.querySelector(`[data-value="${value}"]`);
    if (selectedChipElement && !selectedChipElement.classList.contains('disabled')) {
      selectedChipElement.classList.add('selected');
      this.selectedChip = value;

      if (this.onChipSelected) {
        this.onChipSelected(value);
      }
    }
  }

  getSelectedChip() {
    return this.selectedChip;
  }

  updateChipAvailability(chip = null) {
    const chips = chip ? [chip] : this.container.querySelectorAll('.chip');
    const availableBalance = betManager.getAvailableBalance();

    chips.forEach(c => {
      const value = parseInt(c.dataset.value);
      if (value > availableBalance) {
        c.classList.add('disabled');
      } else {
        c.classList.remove('disabled');
      }
    });

    // If currently selected chip is now disabled, select a lower one
    if (this.selectedChip && this.selectedChip > availableBalance) {
      const affordableChip = RouletteConfig.chipDenominations
        .reverse()
        .find(val => val <= availableBalance);

      if (affordableChip) {
        this.selectChip(affordableChip);
      } else {
        this.selectedChip = null;
        const chips = this.container.querySelectorAll('.chip');
        chips.forEach(c => c.classList.remove('selected'));
      }
    }
  }

  setupStateListeners() {
    gameState.on('balanceChange', () => {
      this.updateChipAvailability();
    });

    gameState.on('betPlaced', () => {
      this.updateChipAvailability();
    });

    gameState.on('betRemoved', () => {
      this.updateChipAvailability();
    });

    gameState.on('betsCleared', () => {
      this.updateChipAvailability();
    });
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export default ChipSelector;
