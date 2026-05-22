import { getBurnedCount } from '../data/burnedNfts';

export const BURNED_COUNT = getBurnedCount();

export const TOTAL_SUPPLY = 3050;

export const LIVE_ZENJAKU_COUNT = TOTAL_SUPPLY - BURNED_COUNT;

export const EXPERIMENT_START_DATE = '2024-12-09T00:00:00Z';
