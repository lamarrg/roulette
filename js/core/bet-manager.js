// Bet management and validation

import gameState from './game-state.js';
import RouletteConfig from '../config/roulette-config.js';
import { generateId } from '../utils/helpers.js';

// Validate bet amount
export function validateBetAmount(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { valid: false, error: 'Invalid bet amount' };
  }

  if (amount < RouletteConfig.limits.minBet) {
    return { valid: false, error: `Minimum bet is $${RouletteConfig.limits.minBet}` };
  }

  if (amount > RouletteConfig.limits.maxBet) {
    return { valid: false, error: `Maximum bet is $${RouletteConfig.limits.maxBet}` };
  }

  return { valid: true };
}

// Validate balance for bet
export function validateBalance(amount) {
  const currentBalance = gameState.getBalance();
  const totalCurrentBets = gameState.getTotalBetAmount();
  const availableBalance = currentBalance - totalCurrentBets;

  if (amount > availableBalance) {
    return {
      valid: false,
      error: `Insufficient balance. Available: $${availableBalance.toFixed(2)}`
    };
  }

  return { valid: true };
}

// Validate table maximum
export function validateTableMax(amount) {
  const totalCurrentBets = gameState.getTotalBetAmount();
  const newTotal = totalCurrentBets + amount;

  if (newTotal > RouletteConfig.limits.tableMax) {
    return {
      valid: false,
      error: `Table maximum is $${RouletteConfig.limits.tableMax}`
    };
  }

  return { valid: true };
}

// Validate bet type and numbers
export function validateBet(type, numbers) {
  const betType = RouletteConfig.betTypes[type];

  if (!betType) {
    return { valid: false, error: 'Invalid bet type' };
  }

  if (!Array.isArray(numbers) || numbers.length === 0) {
    return { valid: false, error: 'Invalid numbers' };
  }

  // Check if numbers are valid
  const validNumbers = RouletteConfig.wheelOrder;
  const invalidNumbers = numbers.filter(num => !validNumbers.includes(num));

  if (invalidNumbers.length > 0) {
    return { valid: false, error: `Invalid numbers: ${invalidNumbers.join(', ')}` };
  }

  // Check if number count matches bet type
  if (numbers.length !== betType.numberCount) {
    return {
      valid: false,
      error: `${betType.name} requires ${betType.numberCount} number(s)`
    };
  }

  // Ensure numbers are unique
  const uniqueNumbers = [...new Set(numbers)];
  if (uniqueNumbers.length !== numbers.length) {
    return { valid: false, error: 'Duplicate numbers are not allowed' };
  }

  // Geometry validation for inside bets on the 1–36 grid
  // Note: This implementation intentionally validates ONLY 1–36 for split/corner,
  // since 0/00 split/corner variations are layout-dependent.
  if (type === 'split') {
    const result = validateSplitNumbers(numbers);
    if (!result.valid) return result;
  }

  if (type === 'corner') {
    const result = validateCornerNumbers(numbers);
    if (!result.valid) return result;
  }

  return { valid: true };
}

function areAllIntegers1To36(nums) {
  return nums.every(n => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= 36);
}

function validateSplitNumbers(nums) {
  if (!areAllIntegers1To36(nums)) {
    return { valid: false, error: 'Split bets are only supported for numbers 1-36' };
  }

  const [a, b] = [...nums].sort((x, y) => x - y);

  const isHorizontal = (b === a + 1) && (a % 3 !== 0);
  const isVertical = (b === a + 3);

  if (!isHorizontal && !isVertical) {
    return { valid: false, error: 'Split requires two adjacent numbers' };
  }

  return { valid: true };
}

function validateCornerNumbers(nums) {
  if (!areAllIntegers1To36(nums)) {
    return { valid: false, error: 'Corner bets are only supported for numbers 1-36' };
  }

  const sorted = [...nums].sort((x, y) => x - y);
  const n = sorted[0];

  // Corner is {n, n+1, n+3, n+4} where n is not in rightmost column and not in bottom row.
  if (n % 3 === 0 || n > 32) {
    return { valid: false, error: 'Corner requires four numbers forming a 2x2 square' };
  }

  const expected = [n, n + 1, n + 3, n + 4].sort((x, y) => x - y);
  const matches = expected.every((val, idx) => val === sorted[idx]);

  if (!matches) {
    return { valid: false, error: 'Corner requires four numbers forming a 2x2 square' };
  }

  return { valid: true };
}

// Create a bet object
export function createBet(type, numbers, amount, position = null) {
  return {
    id: generateId(),
    type,
    numbers,
    amount,
    position,
    timestamp: Date.now()
  };
}

// Place a bet
export function placeBet(type, numbers, amount, position = null) {
  // Validate bet type and numbers
  const betValidation = validateBet(type, numbers);
  if (!betValidation.valid) {
    return { success: false, error: betValidation.error };
  }

  // Validate bet amount
  const amountValidation = validateBetAmount(amount);
  if (!amountValidation.valid) {
    return { success: false, error: amountValidation.error };
  }

  // Validate balance
  const balanceValidation = validateBalance(amount);
  if (!balanceValidation.valid) {
    return { success: false, error: balanceValidation.error };
  }

  // Validate table maximum
  const tableMaxValidation = validateTableMax(amount);
  if (!tableMaxValidation.valid) {
    return { success: false, error: tableMaxValidation.error };
  }

  // Create and place bet
  const bet = createBet(type, numbers, amount, position);
  gameState.placeBet(bet);

  return { success: true, bet };
}

// Remove a bet and return amount
export function removeBet(betId) {
  const bet = gameState.removeBet(betId);

  if (bet) {
    return { success: true, bet };
  }

  return { success: false, error: 'Bet not found' };
}

// Remove last bet
export function removeLastBet() {
  const bet = gameState.removeLastBet();

  if (bet) {
    return { success: true, bet };
  }

  return { success: false, error: 'No bets to remove' };
}

// Clear all bets
export function clearAllBets() {
  const bets = gameState.clearBets();
  return { success: true, bets };
}

// Get current bets
export function getCurrentBets() {
  return gameState.getCurrentBets();
}

// Get total bet amount
export function getTotalBetAmount() {
  return gameState.getTotalBetAmount();
}

// Check if user can afford bet
export function canAffordBet(amount) {
  const currentBalance = gameState.getBalance();
  const totalCurrentBets = gameState.getTotalBetAmount();
  return (currentBalance - totalCurrentBets) >= amount;
}

// Get available balance for betting
export function getAvailableBalance() {
  const currentBalance = gameState.getBalance();
  const totalCurrentBets = gameState.getTotalBetAmount();
  return Math.max(0, currentBalance - totalCurrentBets);
}

// Find existing bet at position
export function findBetAtPosition(x, y, tolerance = 20) {
  const bets = gameState.getCurrentBets();

  return bets.find(bet => {
    if (!bet.position) return false;

    const dx = Math.abs(bet.position.x - x);
    const dy = Math.abs(bet.position.y - y);

    return dx <= tolerance && dy <= tolerance;
  });
}

// Find bet by numbers
export function findBetByNumbers(numbers) {
  const bets = gameState.getCurrentBets();

  return bets.find(bet => {
    if (bet.numbers.length !== numbers.length) return false;

    const sorted1 = [...bet.numbers].sort();
    const sorted2 = [...numbers].sort();

    return sorted1.every((num, idx) => num === sorted2[idx]);
  });
}

// Repeat last spin's bets
export function repeatLastBets() {
  const history = gameState.getHistory();

  if (history.length === 0) {
    return { success: false, error: 'No previous bets to repeat' };
  }

  const lastSpin = history[0];
  const betsToRepeat = lastSpin.bets || [];

  if (betsToRepeat.length === 0) {
    return { success: false, error: 'No bets in last spin' };
  }

  // Calculate total amount needed
  const totalAmount = betsToRepeat.reduce((sum, bet) => sum + bet.amount, 0);

  // Check if can afford
  if (!canAffordBet(totalAmount)) {
    return { success: false, error: 'Insufficient balance to repeat bets' };
  }

  // Clear current bets
  clearAllBets();

  // Place each bet
  const placedBets = [];
  for (const bet of betsToRepeat) {
    const result = placeBet(bet.type, bet.numbers, bet.amount, bet.position);
    if (result.success) {
      placedBets.push(result.bet);
    }
  }

  return { success: true, bets: placedBets };
}

// Double all current bets
export function doubleAllBets() {
  const currentBets = gameState.getCurrentBets();

  if (currentBets.length === 0) {
    return { success: false, error: 'No bets to double' };
  }

  // Calculate total amount needed for doubling
  const totalAmount = currentBets.reduce((sum, bet) => sum + bet.amount, 0);

  // Check if can afford
  if (!canAffordBet(totalAmount)) {
    return { success: false, error: 'Insufficient balance to double bets' };
  }

  // Double each bet by placing a new identical bet
  const placedBets = [];
  for (const bet of currentBets) {
    const result = placeBet(bet.type, bet.numbers, bet.amount, bet.position);
    if (result.success) {
      placedBets.push(result.bet);
    }
  }

  return { success: true, bets: placedBets };
}

// Get bet type name
export function getBetTypeName(type) {
  const betType = RouletteConfig.betTypes[type];
  return betType ? betType.name : 'Unknown';
}

// Get bet payout
export function getBetPayout(type) {
  const betType = RouletteConfig.betTypes[type];
  return betType ? betType.payout : 0;
}

// Export all functions
export default {
  validateBetAmount,
  validateBalance,
  validateTableMax,
  validateBet,
  createBet,
  placeBet,
  removeBet,
  removeLastBet,
  clearAllBets,
  getCurrentBets,
  getTotalBetAmount,
  canAffordBet,
  getAvailableBalance,
  findBetAtPosition,
  findBetByNumbers,
  repeatLastBets,
  doubleAllBets,
  getBetTypeName,
  getBetPayout
};
