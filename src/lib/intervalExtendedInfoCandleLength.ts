import * as api from 'altamoon-binance-api';

const h = 60;
const d = h * 24;
const w = d * 7;
const M = d * 30;
const y = d * 365;

interface Multipliers {
  h: number;
  d: number;
  w: number;
  M: number;
  y: number;
}

const getMinuteMultipliers = (minutes: number): Multipliers => ({
  h: h / minutes,
  d: d / minutes,
  w: w / minutes,
  M: Math.round(M / minutes),
  y: Math.round(y / minutes),
});

const intervalMap: Record<api.CandlestickChartInterval, Multipliers> = {
  '1m': getMinuteMultipliers(1),
  '3m': getMinuteMultipliers(3),
  '5m': getMinuteMultipliers(5),
  '15m': getMinuteMultipliers(15),
  '30m': getMinuteMultipliers(30),

  '1h': getMinuteMultipliers(1 * 60),
  '2h': getMinuteMultipliers(2 * 60),
  '4h': getMinuteMultipliers(4 * 60),
  '6h': getMinuteMultipliers(6 * 60),
  '8h': getMinuteMultipliers(8 * 60),
  '12h': getMinuteMultipliers(12 * 60),

  '1d': getMinuteMultipliers(1 * 24 * 60),
  '3d': getMinuteMultipliers(3 * 24 * 60),

  '1w': getMinuteMultipliers(7 * 24 * 60),

  '1M': getMinuteMultipliers(30 * 24 * 60),
};

const candleLengths: Record<api.CandlestickChartInterval, Record<string, number>> = {
  '1m': { '1h': intervalMap['1m'].h * 1, '1d': intervalMap['1m'].d * 1 },
  '3m': { '6h': intervalMap['3m'].h * 6, '3d': intervalMap['3m'].d * 3 },
  '5m': { '12h': intervalMap['5m'].h * 12, '5d': intervalMap['5m'].d * 5 },
  '15m': { '3d': intervalMap['15m'].d * 3, '2w': intervalMap['15m'].w * 2 },
  '30m': { '1w': intervalMap['30m'].w * 1, '1M': intervalMap['30m'].M * 1 },

  '1h': { '2w': intervalMap['1h'].w * 2, '2M': intervalMap['1h'].M * 2 },
  '2h': { '1M': intervalMap['2h'].M * 1, '4M': intervalMap['2h'].M * 4 },
  '4h': { '2M': intervalMap['4h'].M * 2, '6M': intervalMap['4h'].M * 6 },
  '6h': { '2M': intervalMap['6h'].M * 2, '6M': intervalMap['6h'].M * 6 },
  '8h': { '2M': intervalMap['8h'].M * 2, '1Y': intervalMap['8h'].y * 1 },
  '12h': { '4M': intervalMap['12h'].M * 4, '2Y': intervalMap['12h'].y * 2 },

  '1d': { '4M': intervalMap['1d'].M * 4, '2Y': intervalMap['1d'].y * 2 },
  '3d': { '4M': intervalMap['3d'].M * 4, '2Y': intervalMap['3d'].y * 2 },

  '1w': { '6M': intervalMap['1w'].M * 6, '2Y': intervalMap['1w'].y * 2 },

  '1M': { '6M': intervalMap['1M'].M * 6, '2Y': intervalMap['1M'].y * 2 },
};

export default candleLengths;
