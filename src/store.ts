import * as api from 'biduul-binance-api';
import { throttle } from 'lodash';
import { listenChange } from 'use-change';

import { ChartType } from './types';

function getPersistentStorageValue<O, T>(key: keyof O & string, defaultValue: T): T {
  const storageValue = localStorage.getItem(`minichart_grid_${key}`);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

class RootStore {
  public candles: api.FuturesChartCandle[] = [];

  public futuresExchangeSymbols: api.FuturesExchangeInfoSymbol[] = [];

  public interval = getPersistentStorageValue<RootStore, api.CandlestickChartInterval>('interval', '1m');

  public candlesLength = getPersistentStorageValue<RootStore, number>('candlesLength', 200);

  public throttleDelay = getPersistentStorageValue<RootStore, number>('throttleDelay', 1000);

  public gridColumns = getPersistentStorageValue<RootStore, number>('gridColumns', 4);

  public chartType = getPersistentStorageValue<RootStore, ChartType>('chartType', 'candlestick');

  public get allCandles(): Record<string, api.FuturesChartCandle[]> { return this.#allCandles; }

  #allCandles: Record<string, api.FuturesChartCandle[]> = {};

  #allSymbolsUnsubscribe?: () => void;

  #throttledListeners: Record<string, (candles: api.FuturesChartCandle[]) => void> = {};

  constructor() {
    const keysToListen: (keyof RootStore)[] = [
      'interval', 'candlesLength', 'throttleDelay', 'gridColumns', 'chartType',
    ];

    keysToListen.forEach((key) => {
      listenChange(this, key, (value: unknown) => {
        localStorage.setItem(`minichart_grid_${key}`, JSON.stringify(value));
      });
    });

    void this.#init();
  }

  #init = async () => {
    try {
      const { symbols } = await api.futuresExchangeInfo();

      this.futuresExchangeSymbols = symbols;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    listenChange(this, 'interval', () => this.#createSubscription());
    listenChange(this, 'throttleDelay', () => this.#createThrottledListeners());
    this.#createThrottledListeners();
    this.#createSubscription();
  };

  #createThrottledListeners = () => {
    const symbols = this.futuresExchangeSymbols;
    this.#throttledListeners = Object.fromEntries(symbols.map(({ symbol }) => [
      symbol,
      throttle((candles: api.FuturesChartCandle[]) => {
        this.#allCandles[symbol] = candles;
      }, this.throttleDelay),
    ]));
  };

  #createSubscription = () => {
    this.#allSymbolsUnsubscribe?.();
    this.#allSymbolsUnsubscribe = this.#allSymbolsSubscribe();
  };

  #allSymbolsSubscribe = (): (() => void) => {
    const allCandlesData: Record<string, api.FuturesChartCandle[]> = {};

    const { interval, futuresExchangeSymbols } = this;

    for (const { symbol } of futuresExchangeSymbols) {
      void api.futuresCandles({ symbol, interval, limit: 1000 }).then((candles) => {
        allCandlesData[symbol] = candles;
        this.#throttledListeners[symbol]?.(candles);
      }).catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
    }

    const subscriptionPairs = futuresExchangeSymbols.map(
      ({ symbol }) => [symbol, interval] as [string, api.CandlestickChartInterval],
    );

    return api.futuresCandlesSubscribe(subscriptionPairs, (candle) => {
      const data = allCandlesData[candle.symbol];

      if (!data) return;

      if (candle.time === data[data.length - 1].time) {
        Object.assign(data[data.length - 1], candle);
      } else {
        data.push(candle);
      }

      allCandlesData[candle.symbol] = [...data];

      this.#throttledListeners[candle.symbol]?.(allCandlesData[candle.symbol]);
    });
  };
}

export const ROOT = (store: RootStore): RootStore => store;
export const CANDLES = (store: RootStore): typeof store.allCandles => store.allCandles;

export default new RootStore();
