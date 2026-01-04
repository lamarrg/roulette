// American Roulette Configuration
// Single source of truth for all game rules, payouts, and number layouts

export const RouletteConfig = {
  // Game variant
  variant: 'american',

  // Starting balance
  defaultBalance: 1000,

  // Chip denominations
  chipDenominations: [1, 5, 10, 25, 100, 500],

  // Bet limits
  limits: {
    minBet: 1,
    maxBet: 1000,
    tableMax: 10000
  },

  // Wheel number order (clockwise from 0)
  wheelOrder: [
    0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1,
    '00', 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2
  ],

  // Number colors
  colors: {
    0: 'green',
    '00': 'green',
    1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red',
    6: 'black', 7: 'red', 8: 'black', 9: 'red', 10: 'black',
    11: 'black', 12: 'red', 13: 'black', 14: 'red', 15: 'black',
    16: 'red', 17: 'black', 18: 'red', 19: 'red', 20: 'black',
    21: 'red', 22: 'black', 23: 'red', 24: 'black', 25: 'red',
    26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
    31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red'
  },

  // Betting table layout (3x12 grid + 0/00)
  tableLayout: {
    // Grid positions for main numbers (row 0-2, col 0-11)
    grid: [
      [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],  // Row 0 (top)
      [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],  // Row 1 (middle)
      [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]   // Row 2 (bottom)
    ],
    // Zero positions (top of table)
    zeros: [0, '00']
  },

  // Bet type definitions with payouts and validation
  betTypes: {
    straight: {
      name: 'Straight Up',
      payout: 35,
      numberCount: 1,
      description: 'Single number bet'
    },
    split: {
      name: 'Split',
      payout: 17,
      numberCount: 2,
      description: 'Two adjacent numbers'
    },
    street: {
      name: 'Street',
      payout: 11,
      numberCount: 3,
      description: 'Three numbers in a row'
    },
    corner: {
      name: 'Corner',
      payout: 8,
      numberCount: 4,
      description: 'Four numbers in a square'
    },
    line: {
      name: 'Line',
      payout: 5,
      numberCount: 6,
      description: 'Six numbers across two rows'
    },
    dozen: {
      name: 'Dozen',
      payout: 2,
      numberCount: 12,
      description: '1st 12, 2nd 12, or 3rd 12'
    },
    column: {
      name: 'Column',
      payout: 2,
      numberCount: 12,
      description: 'One of three vertical columns'
    },
    red: {
      name: 'Red',
      payout: 1,
      numberCount: 18,
      description: 'All red numbers'
    },
    black: {
      name: 'Black',
      payout: 1,
      numberCount: 18,
      description: 'All black numbers'
    },
    even: {
      name: 'Even',
      payout: 1,
      numberCount: 18,
      description: 'All even numbers'
    },
    odd: {
      name: 'Odd',
      payout: 1,
      numberCount: 18,
      description: 'All odd numbers'
    },
    low: {
      name: 'Low (1-18)',
      payout: 1,
      numberCount: 18,
      description: 'Numbers 1-18'
    },
    high: {
      name: 'High (19-36)',
      payout: 1,
      numberCount: 18,
      description: 'Numbers 19-36'
    }
  },

  // Predefined bet number sets
  betSets: {
    red: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    black: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    even: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
    odd: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
    low: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    high: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    dozen1: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    dozen2: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    dozen3: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    column1: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
    column2: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    column3: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36]
  },

  // Animation settings
  animation: {
    spinDuration: 4000,        // 4 seconds
    minRevolutions: 5,
    maxRevolutions: 8,
    easing: 'cubic-bezier(0.17, 0.67, 0.12, 0.99)'
  },

  // Sound settings
  sounds: {
    enabled: true,
    volume: 0.7,
    files: {
      chip: 'assets/sounds/chip.mp3',
      spin: 'assets/sounds/spin.mp3',
      win: 'assets/sounds/win.mp3',
      lose: 'assets/sounds/lose.mp3'
    }
  },

  // History settings
  history: {
    maxEntries: 50,
    showHotColdNumbers: true,
    hotNumberThreshold: 3    // Number appears 3+ times in last 10 spins
  },

  // Helper methods
  getNumberColor(number) {
    return this.colors[number] || null;
  },

  isRedNumber(number) {
    return this.betSets.red.includes(number);
  },

  isBlackNumber(number) {
    return this.betSets.black.includes(number);
  },

  isEvenNumber(number) {
    return this.betSets.even.includes(number);
  },

  isOddNumber(number) {
    return this.betSets.odd.includes(number);
  },

  getWheelAngle(number) {
    const index = this.wheelOrder.indexOf(number);
    if (index === -1) return 0;

    // Calculate angle (38 numbers total)
    const anglePerNumber = 360 / 38;
    return index * anglePerNumber;
  },

  getNumberPosition(number) {
    // Find position in grid
    for (let row = 0; row < this.tableLayout.grid.length; row++) {
      const col = this.tableLayout.grid[row].indexOf(number);
      if (col !== -1) {
        return { row, col };
      }
    }

    // Check if it's a zero
    if (this.tableLayout.zeros.includes(number)) {
      return { row: -1, col: this.tableLayout.zeros.indexOf(number) };
    }

    return null;
  }
};

export default RouletteConfig;
