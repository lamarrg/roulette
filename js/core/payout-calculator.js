// Payout calculation engine
// Single source of truth for all payout calculations

import RouletteConfig from '../config/roulette-config.js';

// Calculate payout for a single bet
export function calculateBetPayout(bet, spinNumber) {
  // Check if bet wins
  const isWinner = bet.numbers.includes(spinNumber);

  if (!isWinner) {
    return {
      isWinner: false,
      payout: 0,
      winAmount: 0,
      totalReturn: 0,
      originalBet: bet.amount
    };
  }

  // Get payout multiplier
  const betType = RouletteConfig.betTypes[bet.type];
  const payoutMultiplier = betType ? betType.payout : 0;

  // Calculate amounts
  const payout = bet.amount * payoutMultiplier;
  const totalReturn = bet.amount + payout; // Original bet + winnings

  return {
    isWinner: true,
    payout,
    winAmount: payout,
    totalReturn,
    originalBet: bet.amount,
    payoutMultiplier
  };
}

// Calculate payouts for all bets
export function calculateAllPayouts(bets, spinNumber) {
  const results = {
    spinNumber,
    spinColor: RouletteConfig.getNumberColor(spinNumber),
    totalBet: 0,
    totalWin: 0,
    totalReturn: 0,
    netProfit: 0,
    winningBets: [],
    losingBets: [],
    betCount: bets.length
  };

  // Calculate total bet amount
  results.totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);

  // Process each bet
  bets.forEach(bet => {
    const betResult = calculateBetPayout(bet, spinNumber);

    if (betResult.isWinner) {
      results.winningBets.push({
        ...bet,
        ...betResult
      });
      results.totalWin += betResult.totalReturn;
    } else {
      results.losingBets.push({
        ...bet,
        ...betResult
      });
    }
  });

  // Calculate net profit (total returns - total bets)
  results.netProfit = results.totalWin - results.totalBet;
  results.totalReturn = results.totalWin;

  return results;
}

// Get payout odds for a bet type
export function getPayoutOdds(betType) {
  const type = RouletteConfig.betTypes[betType];
  return type ? type.payout : 0;
}

// Get payout description for a bet type
export function getPayoutDescription(betType) {
  const type = RouletteConfig.betTypes[betType];
  if (!type) return 'Unknown bet';

  return `${type.name}: ${type.payout}:1 (${type.description})`;
}

// Calculate potential win for a bet
export function calculatePotentialWin(betType, amount) {
  const odds = getPayoutOdds(betType);
  const payout = amount * odds;
  const totalReturn = amount + payout;

  return {
    betAmount: amount,
    payout,
    totalReturn,
    odds,
    oddsDisplay: `${odds}:1`
  };
}

// Calculate house edge for a bet type
export function calculateHouseEdge(betType) {
  // American roulette has 38 numbers (0, 00, 1-36)
  const totalNumbers = 38;
  const type = RouletteConfig.betTypes[betType];

  if (!type) return 0;

  const numbersCovered = type.numberCount;
  const payout = type.payout;

  // True odds
  const trueOdds = (totalNumbers - numbersCovered) / numbersCovered;

  // House edge = (true odds - payout odds) / (true odds + 1)
  const houseEdge = ((trueOdds - payout) / (trueOdds + 1)) * 100;

  return houseEdge;
}

// Get all bet type payouts
export function getAllPayouts() {
  return Object.entries(RouletteConfig.betTypes).map(([type, info]) => ({
    type,
    name: info.name,
    payout: info.payout,
    oddsDisplay: `${info.payout}:1`,
    numberCount: info.numberCount,
    description: info.description,
    houseEdge: calculateHouseEdge(type)
  }));
}

// Check if number wins for specific bet type
export function doesNumberWin(betType, numbers, spinNumber) {
  return numbers.includes(spinNumber);
}

// Calculate expected value for a bet
export function calculateExpectedValue(betType, amount) {
  const totalNumbers = 38;
  const type = RouletteConfig.betTypes[betType];

  if (!type) return 0;

  const numbersCovered = type.numberCount;
  const payout = type.payout;

  // Probability of winning
  const probWin = numbersCovered / totalNumbers;

  // Expected value = (probability of win × payout) - (probability of loss × bet amount)
  const expectedWin = probWin * (amount * payout);
  const expectedLoss = (1 - probWin) * amount;
  const expectedValue = expectedWin - expectedLoss;

  return {
    expectedValue,
    probWin,
    probWinPercent: (probWin * 100).toFixed(2),
    probLoss: 1 - probWin,
    probLossPercent: ((1 - probWin) * 100).toFixed(2)
  };
}

// Analyze a collection of bets
export function analyzeBets(bets) {
  const analysis = {
    totalBets: bets.length,
    totalAmount: 0,
    betTypes: {},
    numbersCovered: new Set(),
    duplicateNumbers: [],
    coverage: 0
  };

  bets.forEach(bet => {
    // Total amount
    analysis.totalAmount += bet.amount;

    // Track bet types
    if (!analysis.betTypes[bet.type]) {
      analysis.betTypes[bet.type] = {
        count: 0,
        totalAmount: 0,
        bets: []
      };
    }
    analysis.betTypes[bet.type].count++;
    analysis.betTypes[bet.type].totalAmount += bet.amount;
    analysis.betTypes[bet.type].bets.push(bet);

    // Track numbers covered
    bet.numbers.forEach(num => {
      if (analysis.numbersCovered.has(num)) {
        if (!analysis.duplicateNumbers.includes(num)) {
          analysis.duplicateNumbers.push(num);
        }
      }
      analysis.numbersCovered.add(num);
    });
  });

  // Calculate coverage percentage
  analysis.coverage = (analysis.numbersCovered.size / 38) * 100;

  return analysis;
}

// Simulate multiple spins to test bet strategy
export function simulateSpins(bets, spinCount = 1000) {
  const results = {
    totalSpins: spinCount,
    totalBet: 0,
    totalWon: 0,
    netProfit: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    biggestWin: 0,
    biggestLoss: 0,
    spinResults: []
  };

  const betAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);

  for (let i = 0; i < spinCount; i++) {
    // Random spin result
    const spinNumber = RouletteConfig.wheelOrder[Math.floor(Math.random() * 38)];

    // Calculate payouts
    const spinResult = calculateAllPayouts(bets, spinNumber);

    results.totalBet += spinResult.totalBet;
    results.totalWon += spinResult.totalWin;

    if (spinResult.netProfit > 0) {
      results.wins++;
      results.biggestWin = Math.max(results.biggestWin, spinResult.netProfit);
    } else if (spinResult.netProfit < 0) {
      results.losses++;
      results.biggestLoss = Math.min(results.biggestLoss, spinResult.netProfit);
    } else {
      results.pushes++;
    }

    // Store only summary for large simulations
    if (i < 100) {
      results.spinResults.push(spinResult);
    }
  }

  results.netProfit = results.totalWon - results.totalBet;
  results.winRate = (results.wins / spinCount) * 100;
  results.avgWin = results.wins > 0 ? results.biggestWin / results.wins : 0;
  results.avgLoss = results.losses > 0 ? Math.abs(results.biggestLoss) / results.losses : 0;

  return results;
}

// Export all functions
export default {
  calculateBetPayout,
  calculateAllPayouts,
  getPayoutOdds,
  getPayoutDescription,
  calculatePotentialWin,
  calculateHouseEdge,
  getAllPayouts,
  doesNumberWin,
  calculateExpectedValue,
  analyzeBets,
  simulateSpins
};
