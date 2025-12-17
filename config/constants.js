import { calculateTotalBurned, getBurnedCount } from '../data/burnedNfts';

// Total value of burned NFTs in SOL (calculated dynamically)
export const TOTAL_VALUE_BURNED = calculateTotalBurned();

// Total number of burned NFTs (calculated dynamically)
export const BURNED_COUNT = getBurnedCount();

// Current SOL price in USD (this should be fetched from an API in production)
export const SOL_PRICE_USD = 100;

// Calculate total value in USD
export const TOTAL_VALUE_BURNED_USD = TOTAL_VALUE_BURNED * SOL_PRICE_USD;

// Total Initial Supply
export const TOTAL_SUPPLY = 3050;

// Live Zenjaku Count (Dynamic)
export const LIVE_ZENJAKU_COUNT = TOTAL_SUPPLY - BURNED_COUNT;

// Experiment Start Date - Only count sales from this date forward
// Set to the current date when you want to "reset" the leaderboard tracking
// Day 1 = Dec 15, 2025 (so Dec 17 = Day 3)
export const EXPERIMENT_START_DATE = '2025-12-15T00:00:00Z'; 