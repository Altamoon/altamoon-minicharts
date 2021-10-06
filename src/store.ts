import * as api from 'biduul-binance-api';
import { keyBy, mapValues, throttle } from 'lodash';
import { listenChange } from 'use-change';

import { ChartType, SortDirection, SortBy } from './types';

function getPersistentStorageValue<O, T>(key: keyof O & string, defaultValue: T): T {
  const storageValue = localStorage.getItem(`minichart_grid_${key}`);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

class RootStore {
  public candles: api.FuturesChartCandle[] = [];

  public futuresExchangeSymbolsMap: Record<string, api.FuturesExchangeInfoSymbol> = {};

  public symbols: string[] = [];

  public chartHeight = getPersistentStorageValue<RootStore, number>('chartHeight', 200);

  public interval = getPersistentStorageValue<RootStore, api.CandlestickChartInterval>('interval', '1m');

  public candlesLength = getPersistentStorageValue<RootStore, number>('candlesLength', 200);

  public throttleDelay = getPersistentStorageValue<RootStore, number>('throttleDelay', 1000);

  public gridColumns = getPersistentStorageValue<RootStore, number>('gridColumns', 4);

  public chartType = getPersistentStorageValue<RootStore, ChartType>('chartType', 'candlestick');

  public symbolAlerts = getPersistentStorageValue<RootStore, Record<string, number[]>>('symbolAlerts', {});

  public sortBy = getPersistentStorageValue<RootStore, SortBy>('sortBy', 'none');

  public sortDirection = getPersistentStorageValue<RootStore, SortDirection>('sortDirection', -1);

  // allCandles is readonly from outside
  public get allCandles(): Record<string, api.FuturesChartCandle[]> { return this.#allCandles; }

  #allCandles: Record<string, api.FuturesChartCandle[]> = {};

  // volumes is readonly from outside
  public get volumes(): Record<string, string> { return this.#volumes; }

  #volumes: Record<string, string> = {};

  public get priceChangePercents(): Record<string, string> { return this.#priceChangePercents; }

  #priceChangePercents: Record<string, string> = {};

  public realTimePrices: Record<string, number> = {};

  #allSymbolsUnsubscribe?: () => void;

  #throttledListeners: Record<string, (candles: api.FuturesChartCandle[]) => void> = {};

  constructor() {
    const keysToListen: (keyof RootStore)[] = [
      'interval', 'candlesLength', 'throttleDelay', 'gridColumns', 'chartType', 'chartHeight', 'symbolAlerts', 'sortBy', 'sortDirection',
    ];

    keysToListen.forEach((key) => {
      listenChange(this, key, (value: unknown) => {
        localStorage.setItem(`minichart_grid_${key}`, JSON.stringify(value));
      });
    });

    void this.#init();

    listenChange(this, 'sortBy', this.#sortSymbols);
    listenChange(this, 'sortDirection', this.#sortSymbols);
  }

  #init = async () => {
    try {
      const { symbols } = await api.futuresExchangeInfo();

      const futuresExchangeSymbols = symbols; // .slice(0, 10);

      this.futuresExchangeSymbolsMap = keyBy(futuresExchangeSymbols, 'symbol');
      this.symbols = futuresExchangeSymbols.map(({ symbol }) => symbol);

      this.#sortSymbols();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }

    listenChange(this, 'interval', () => this.#createSubscription());
    listenChange(this, 'throttleDelay', () => this.#createThrottledListeners());
    this.#createThrottledListeners();
    this.#createSubscription();
    this.#volumeSubscribe();
  };

  #sortSymbols = () => {
    switch (this.sortBy) {
      case 'none': {
        const symbols = Object.values(this.futuresExchangeSymbolsMap).map(({ symbol }) => symbol);
        if (this.sortDirection === 1) symbols.reverse();
        this.symbols = symbols;
        break;
      }
      case 'alphabetically':
        this.symbols = this.symbols
          .sort((a, b) => (a > b ? this.sortDirection : -this.sortDirection)).slice();
        break;
      case 'volume':
        this.symbols = this.symbols
          .map((symbol) => [symbol, +this.#volumes[symbol] || 0] as const)
          .sort((a, b) => (a[1] > b[1] ? this.sortDirection : -this.sortDirection))
          .map(([symbol]) => symbol);
        break;
      case 'volume_change':
        this.symbols = this.symbols
          .map((symbol) => [symbol, +this.#priceChangePercents[symbol] || 0] as const)
          .sort((a, b) => (a[1] > b[1] ? this.sortDirection : -this.sortDirection))
          .map(([symbol]) => symbol);
        break;
      default:
        throw new Error(`sortBy ${String(this.sortBy)} is not supported`);
    }
  };

  #createThrottledListeners = () => {
    const { symbols } = this;
    this.#throttledListeners = Object.fromEntries(symbols.map((symbol) => [
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

    const { interval, symbols } = this;

    for (const symbol of symbols) {
      void api.futuresCandles({
        symbol, interval, limit: 500, lastCandleFromCache: true,
      }).then((candles) => {
        allCandlesData[symbol] = candles;
        this.#throttledListeners[symbol]?.(candles);
      }).catch((e) => {
        // eslint-disable-next-line no-console
        console.error(e);
      });
    }

    const subscriptionPairs = symbols.map(
      (symbol) => [symbol, interval] as [string, api.CandlestickChartInterval],
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

      this.realTimePrices[candle.symbol] = candle.close;

      this.#throttledListeners[candle.symbol]?.(allCandlesData[candle.symbol]);
    });
  };

  #volumeSubscribe = () => {
    api.futuresTickerStream((ticker) => {
      Object.assign(this.#volumes, mapValues(keyBy(ticker, 'symbol'), ({ quoteVolume }) => quoteVolume));
      Object.assign(this.#priceChangePercents, mapValues(keyBy(ticker, 'symbol'), ({ priceChangePercent }) => priceChangePercent));
      if (this.sortBy === 'volume' || this.sortBy === 'volume_change') {
        this.#sortSymbols();
      }
    });
  };
}

export const ROOT = (store: RootStore): RootStore => store;
export const CANDLES = (store: RootStore): typeof store.allCandles => store.allCandles;
export const VOLUMES = (store: RootStore): typeof store.volumes => store.volumes;
export const PRICE_CHANGE = (
  store: RootStore,
): typeof store.priceChangePercents => store.priceChangePercents;

const store = new RootStore();
if (process.env.NODE_ENV === 'development') {
  // make store to be accessed ass a global variable
  (window as unknown as { store: RootStore; }).store = store;
}

export default store;
