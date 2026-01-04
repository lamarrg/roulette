// Betting Table Component
// Renders the American roulette betting table and handles bet placement

import RouletteConfig from '../config/roulette-config.js';
import betManager from '../core/bet-manager.js';
import gameState from '../core/game-state.js';

class BettingTable {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedChip = null;
    this.onBetPlaced = null;
    this.render();
    this.attachListeners();
    this.setupStateListeners();
  }

  render() {
    this.container.innerHTML = '';

    // Create grid for American roulette table
    const grid = RouletteConfig.tableLayout.grid;

    // Add zeros (0 and 00)
    this.addZeroCell(0, 'zero-cell');
    this.addZeroCell('00', 'double-zero-cell');

    // Add number cells (3 rows x 12 columns)
    grid.forEach((row, rowIndex) => {
      row.forEach((number, colIndex) => {
        this.addNumberCell(number, rowIndex + 1, colIndex + 2);
      });
    });

    // Add 2-to-1 column bet labels
    for (let i = 0; i < 3; i++) {
      this.addTwoToOneLabel(i);
    }

    // Add dozen bet areas
    this.addDozenBet(1);
    this.addDozenBet(2);
    this.addDozenBet(3);

    // Add outside bet areas
    this.addOutsideBet('1-18', 'bet-1-18');
    this.addOutsideBet('Even', 'bet-even');
    this.addOutsideBet('Red', 'bet-red');
    this.addOutsideBet('Black', 'bet-black');
    this.addOutsideBet('Odd', 'bet-odd');
    this.addOutsideBet('19-36', 'bet-19-36');
  }

  addZeroCell(number, className) {
    const cell = document.createElement('div');
    cell.className = `table-cell green ${className}`;
    cell.textContent = number;
    cell.dataset.number = number;
    cell.dataset.type = 'straight';
    this.container.appendChild(cell);
  }

  addNumberCell(number, row, col) {
    const cell = document.createElement('div');
    const color = RouletteConfig.getNumberColor(number);

    cell.className = `table-cell ${color}`;
    cell.style.gridRow = row;
    cell.style.gridColumn = col;
    cell.textContent = number;
    cell.dataset.number = number;
    cell.dataset.type = 'straight';
    this.container.appendChild(cell);
  }

  addLineBetArea(lineIndex) {
    const area = document.createElement('div');
    area.className = 'line-bet-area';
    // Position at the boundary between two columns
    // Grid columns 2-13 contain the numbers
    // Line bet areas should be narrow strips between columns
    const gridCol = lineIndex + 3; // Position between columns (after first column of the pair)
    area.style.gridColumn = gridCol;
    area.style.gridRow = '1 / 4'; // Span all 3 rows
    area.textContent = '';
    area.dataset.type = 'line';
    area.dataset.lineIndex = lineIndex;
    this.container.appendChild(area);
  }

  addTwoToOneLabel(rowIndex) {
    const label = document.createElement('div');
    label.className = 'table-cell two-to-one';
    label.style.gridRow = rowIndex + 1;
    label.textContent = '2 to 1';
    label.dataset.type = 'column';
    label.dataset.column = rowIndex + 1;
    this.container.appendChild(label);
  }

  addDozenBet(dozenNumber) {
    const dozen = document.createElement('div');
    dozen.className = `table-cell dozen-bet dozen-${dozenNumber}`;
    dozen.textContent = `${dozenNumber}st 12`;
    if (dozenNumber === 2) dozen.textContent = `${dozenNumber}nd 12`;
    if (dozenNumber === 3) dozen.textContent = `${dozenNumber}rd 12`;
    dozen.dataset.type = 'dozen';
    dozen.dataset.dozen = dozenNumber;
    this.container.appendChild(dozen);
  }

  addOutsideBet(label, className) {
    const bet = document.createElement('div');
    bet.className = `table-cell outside-bet ${className}`;
    bet.textContent = label;
    bet.dataset.type = 'outside';
    bet.dataset.betType = className.replace('bet-', '');
    this.container.appendChild(bet);
  }

  attachListeners() {
    this.container.addEventListener('click', (e) => {
      if (!this.selectedChip) return;
      if (gameState.isSpinning()) return;

      const cell = e.target.closest('.table-cell');
      if (!cell) return;

      this.handleBetPlacement(cell, e);
    });
  }

  handleBetPlacement(cell, event) {
    const type = cell.dataset.type;
    let betType, numbers;

    if (type === 'straight') {
      betType = 'straight';
      numbers = [cell.dataset.number === '00' ? '00' : parseInt(cell.dataset.number)];
    } else if (type === 'line') {
      betType = 'line';
      const lineIndex = parseInt(cell.dataset.lineIndex);
      numbers = this.getLineBetNumbers(lineIndex);
    } else if (type === 'column') {
      betType = 'column';
      const columnNum = parseInt(cell.dataset.column);
      numbers = RouletteConfig.betSets[`column${columnNum}`];
    } else if (type === 'dozen') {
      betType = 'dozen';
      const dozenNum = parseInt(cell.dataset.dozen);
      numbers = RouletteConfig.betSets[`dozen${dozenNum}`];
    } else if (type === 'outside') {
      const outsideBetType = cell.dataset.betType;
      betType = this.getOutsideBetType(outsideBetType);
      numbers = this.getOutsideBetNumbers(outsideBetType);
    }

    if (!betType || !numbers) return;

    // Get click position relative to cell for chip placement
    const rect = cell.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };

    // Place bet
    const result = betManager.placeBet(betType, numbers, this.selectedChip, position);

    if (result.success) {
      this.renderChip(cell, this.selectedChip);
      if (this.onBetPlaced) {
        this.onBetPlaced(result.bet);
      }
    } else {
      this.showError(result.error);
    }
  }

  getOutsideBetType(betType) {
    const map = {
      '1-18': 'low',
      'even': 'even',
      'red': 'red',
      'black': 'black',
      'odd': 'odd',
      '19-36': 'high'
    };
    return map[betType];
  }

  getLineBetNumbers(lineIndex) {
    // Line bet covers 6 numbers (2 adjacent columns, all 3 rows)
    // lineIndex corresponds to the first column index
    const grid = RouletteConfig.tableLayout.grid;
    const numbers = [];

    // Get all 3 numbers from column lineIndex
    for (let row = 0; row < 3; row++) {
      numbers.push(grid[row][lineIndex]);
    }

    // Get all 3 numbers from column lineIndex + 1
    for (let row = 0; row < 3; row++) {
      numbers.push(grid[row][lineIndex + 1]);
    }

    return numbers.sort((a, b) => a - b); // Sort for consistency
  }

  getOutsideBetNumbers(betType) {
    const map = {
      '1-18': RouletteConfig.betSets.low,
      'even': RouletteConfig.betSets.even,
      'red': RouletteConfig.betSets.red,
      'black': RouletteConfig.betSets.black,
      'odd': RouletteConfig.betSets.odd,
      '19-36': RouletteConfig.betSets.high
    };
    return map[betType];
  }

  renderChip(cell, amount) {
    // Check if chip already exists
    let chip = cell.querySelector('.chip-overlay');

    if (chip) {
      // Update existing chip
      const currentValue = parseInt(chip.dataset.value);
      const newValue = currentValue + amount;
      chip.textContent = `$${newValue}`;
      chip.dataset.value = newValue;
    } else {
      // Create new chip
      chip = document.createElement('div');
      chip.className = `chip-overlay chip-${amount}`;
      chip.textContent = `$${amount}`;
      chip.dataset.value = amount;
      cell.appendChild(chip);
    }
  }

  clearChips() {
    const chips = this.container.querySelectorAll('.chip-overlay');
    chips.forEach(chip => chip.remove());
  }

  highlightWinningNumber(number) {
    // Remove previous highlights
    const highlighted = this.container.querySelectorAll('.winning');
    highlighted.forEach(cell => cell.classList.remove('winning'));

    // Highlight winning number
    const cells = this.container.querySelectorAll('.table-cell');
    cells.forEach(cell => {
      if (cell.dataset.number === String(number)) {
        cell.classList.add('winning');

        // Remove highlight after animation
        setTimeout(() => {
          cell.classList.remove('winning');
        }, 2000);
      }
    });
  }

  setSelectedChip(amount) {
    this.selectedChip = amount;
  }

  setupStateListeners() {
    gameState.on('betsCleared', () => {
      this.clearChips();
    });

    gameState.on('betRemoved', () => {
      // Refresh chips display
      this.refreshChips();
    });
  }

  refreshChips() {
    this.clearChips();
    const bets = gameState.getCurrentBets();

    bets.forEach(bet => {
      // Find the corresponding cell
      const cells = this.container.querySelectorAll('.table-cell');
      cells.forEach(cell => {
        if (this.isBetOnCell(bet, cell)) {
          this.renderChip(cell, bet.amount);
        }
      });
    });
  }

  isBetOnCell(bet, cell) {
    const cellType = cell.dataset.type;

    if (cellType === 'straight') {
      const cellNumber = cell.dataset.number === '00' ? '00' : parseInt(cell.dataset.number);
      return bet.type === 'straight' && bet.numbers.includes(cellNumber);
    } else if (cellType === 'line') {
      const lineIndex = parseInt(cell.dataset.lineIndex);
      const lineNumbers = this.getLineBetNumbers(lineIndex);
      return bet.type === 'line' && bet.numbers.length === 6 &&
             bet.numbers.every(n => lineNumbers.includes(n)) &&
             lineNumbers.every(n => bet.numbers.includes(n));
    } else if (cellType === 'column') {
      const columnNum = parseInt(cell.dataset.column);
      return bet.type === 'column' && bet.numbers.length === 12 &&
             bet.numbers.every(n => RouletteConfig.betSets[`column${columnNum}`].includes(n));
    } else if (cellType === 'dozen') {
      const dozenNum = parseInt(cell.dataset.dozen);
      return bet.type === 'dozen' && bet.numbers.length === 12 &&
             bet.numbers.every(n => RouletteConfig.betSets[`dozen${dozenNum}`].includes(n));
    } else if (cellType === 'outside') {
      const betType = this.getOutsideBetType(cell.dataset.betType);
      return bet.type === betType;
    }

    return false;
  }

  showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast error';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  destroy() {
    this.container.innerHTML = '';
  }
}

export default BettingTable;
