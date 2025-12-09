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