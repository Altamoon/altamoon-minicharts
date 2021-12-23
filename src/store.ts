import * as api from 'altamoon-binance-api';
import { keyBy, mapValues, throttle } from 'lodash';
import { listenChange } from 'use-change';

import { TradingOrder, TradingPosition } from 'altamoon-types';
import {
  ChartType, SortDirection, SortBy, AlertLogItem, ScaleType,
} from './AltamoonMinichart/types';
import { alertUpUri, alertDownUri, alertVolumeUri } from './alertSounds';

const upSound = new Audio(alertUpUri);
const downSound = new Audio(alertDownUri);
const volumeSound = new Audio(alertVolumeUri);

const STORAGE_PREFIX = 'altamoonMinicharts_';

function persistent<T>(key: keyof MinichartsStore, defaultValue: T): T {
  const storageValue = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
  return storageValue ? JSON.parse(storageValue) as T : defaultValue;
}

type AnomalyKey = `${api.CandlestickChartInterval}_${number}`;

export class MinichartsStore {
  public candles: api.FuturesChartCandle[] = [];

  public futuresExchangeSymbolsMap: Record<string, api.FuturesExchangeInfoSymbol> = {};

  public symbols: string[] = [];

  public chartHeight = persistent<number>('chartHeight', 200);

  public interval = persistent<api.CandlestickChartInterval>('interval', '5m');

  public maxChartsLength = persistent<number | null>('maxChartsLength', 20);

  public throttleDelay = persistent<number>('throttleDelay', 1000);

  public gridColumns = persistent<number>('gridColumns', 4);

  public chartType = persistent<ChartType>('chartType', 'candlestick');

  public scaleType = persistent<ScaleType>('scaleType', 'log');

  public symbolAlerts = persistent<Record<string, number[]>>('symbolAlerts', {});

  public alertLog = persistent<AlertLogItem[]>('alertLog', []);

  public sortBy = persistent<SortBy>('sortBy', 'alphabetically');

  public sortDirection = persistent<SortDirection>('sortDirection', -1);

  public alertLogLastSeenISO = persistent<null | string>('alertLogLastSeenISO', null);

  public get allCandles() { return this.#allCandles; }

  #allCandles: Record<string, api.FuturesChartCandle[]> = {};

  public get volumes() { return this.#volumes; }

  #volumes: Record<string, string> = {};

  public get allPositions() { return this.#allPositions; } // set by Altamoon

  #allPositions: Record<string, TradingPosition | null> = {}; // set by Altamoon

  public get allOrders() { return this.#allOrders; } // set by Altamoon

  public positionSymbols: string[] = []; // set by Altamoon

  #allOrders: Record<string, TradingOrder[] | null> = {}; // set by Altamoon

  public get allLeverageBrackets() { return this.#allLeverageBrackets; } // set by Altamoon

  #allLeverageBrackets: Record<string, api.FuturesLeverageBracket[]> = {}; // set by Altamoon

  public get priceChangePercents(): Record<string, string> { return this.#priceChangePercents; }

  #priceChangePercents: Record<string, string> = {};

  public realTimeCandles: Record<string, api.FuturesChartCandle[]> = {};

  #allSymbolsUnsubscribe?: () => void;

  #throttledListeners: Record<string, (candles: api.FuturesChartCandle[]) => void> = {};

  #volumeAnomalies: Record<string, AnomalyKey> = {};

  constructor() {
    const keysToListen: (keyof MinichartsStore)[] = [
      'interval',
      'maxChartsLength',
      'throttleDelay',
      'gridColumns',
      'chartType',
      'scaleType',
      'chartHeight',
      'symbolAlerts',
      'alertLog',
      'sortBy',
      'sortDirection',
      'alertLogLastSeenISO',
    ];

    keysToListen.forEach((key) => {
      listenChange(this, key, (value: unknown) => {
        localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
      });
    });

    void this.#init();

    listenChange(this, 'sortBy', this.#sortSymbols);
    listenChange(this, 'sortDirection', this.#sortSymbols);
    listenChange(this, 'positionSymbols', this.#sortSymbols);
  }

  public triggerAlert = (type: AlertLogItem['type'], symbol: string) => {
    const candles = this.realTimeCandles[symbol] ?? [];
    const { close: price, volume } = candles[candles.length - 1] ?? { close: 0, volume: 0 };

    const logItem: AlertLogItem = {
      type,
      symbol,
      price,
      volume,
      timeISO: new Date().toISOString(),
    };
    const MAX_LOG_SIZE = 100;
    this.alertLog = [logItem, ...this.alertLog].slice(0, MAX_LOG_SIZE);

    switch (type) {
      case 'PRICE_UP':
        void upSound.play();
        break;
      case 'PRICE_DOWN':
        void downSound.play();
        break;
      case 'VOLUME_ANOMALY':
        void volumeSound.play();
        break;
      default:
    }
  };

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
    const { positionSymbols } = this;
    const symbols: string[] = this.symbols.filter((symbol) => !positionSymbols.includes(symbol));

    const alphabetically = (s: string[]) => s.sort(
      (a, b) => (a > b ? this.sortDirection : -this.sortDirection),
    ).slice();

    const byVolume = (s: string[]) => s
      .map((symbol) => [symbol, +this.#volumes[symbol] || 0] as const)
      .sort((a, b) => (a[1] > b[1] ? this.sortDirection : -this.sortDirection))
      .map(([symbol]) => symbol);

    const byVolumeChange = (s: string[]) => s
      .map((symbol) => [symbol, +this.#priceChangePercents[symbol] || 0] as const)
      .sort((a, b) => (a[1] > b[1] ? this.sortDirection : -this.sortDirection))
      .map(([symbol]) => symbol);

    switch (this.sortBy) {
      case 'alphabetically':
        this.symbols = [
          ...alphabetically(positionSymbols), ...alphabetically(symbols),
        ];
        break;
      case 'volume':
        this.symbols = [
          ...byVolume(positionSymbols), ...byVolume(symbols),
        ];
        break;
      case 'volume_change':
        this.symbols = [
          ...byVolumeChange(positionSymbols), ...byVolumeChange(symbols),
        ];
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
    const { interval, symbols } = this;
    // altamoonFuturesChartWorkerSubscribe is defined globally at Altamoon
    // to fix of issues with worker + webpack;
    // the function is used when minicharts is Altamoon widget
    // but standalone version is  going to use  api.futuresChartWorkerSubscribe
    const futuresChartWorkerSubscribe = (window as unknown as {
      altamoonFuturesChartWorkerSubscribe: typeof api.futuresChartWorkerSubscribe
    }).altamoonFuturesChartWorkerSubscribe
      ?? api.futuresChartWorkerSubscribe;
    return futuresChartWorkerSubscribe({
      frequency: 200,
      symbols: 'PERPETUAL',
      interval,
      callback: (symbol, candles) => {
        if (!symbols.includes(symbol)) return;

        const lastCandle = candles[candles.length - 1];

        this.realTimeCandles[symbol] = candles;

        this.#throttledListeners[symbol]?.(candles);

        const anomalyRatio = +localStorage.minichartsVolumeAnomalyAlertsRatio;
        if (!Number.isNaN(anomalyRatio) && anomalyRatio > 0) {
          const anomakyKey: AnomalyKey = `${lastCandle.interval}_${lastCandle.time}`;
          const lastCandlesSize = +localStorage.minichartsVolumeAnomalyAlertsCandlesSize || 0;

          const currentCandleIsAnomaly = this.#volumeAnomalies[symbol] === anomakyKey;
          const candlesToConsider = candles.slice(-lastCandlesSize, -1);
          const avg = candlesToConsider
            .reduce((p, c) => p + +c.volume, 0) / candlesToConsider.length;
          const isAnomaly = !currentCandleIsAnomaly && avg * anomalyRatio < +lastCandle.volume;

          if (isAnomaly) {
            this.#volumeAnomalies[symbol] = anomakyKey;

            this.triggerAlert('VOLUME_ANOMALY', symbol);
          }
        }
      },
    });
    /*

    for (const symbol of symbols) {
      void api.futuresCandles({
        // 499 has weight 2 https://binance-docs.github.io/apidocs/futures/en/#kline-candlestick-data
        symbol, interval, limit: 499, lastCandleFromCache: true,
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
      const { symbol } = candle;
      const data = allCandlesData[symbol];

      if (!data) return;

      if (candle.time === data[data.length - 1].time) {
        Object.assign(data[data.length - 1], candle);
      } else {
        data.push(candle);
      }

      const candlesData = [...data];

    }); */
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

export const ROOT = (store: MinichartsStore): MinichartsStore => store;
export const CANDLES = (store: MinichartsStore): typeof store.allCandles => store.allCandles;
export const POSITIONS = (store: MinichartsStore): typeof store.allPositions => store.allPositions;
export const ORDERS = (store: MinichartsStore): typeof store.allOrders => store.allOrders;
export const LEVERAGE_BRACKETS = (
  store: MinichartsStore,
): typeof store.allLeverageBrackets => store.allLeverageBrackets;
export const VOLUMES = (store: MinichartsStore): typeof store.volumes => store.volumes;
export const PRICE_CHANGE = (
  store: MinichartsStore,
): typeof store.priceChangePercents => store.priceChangePercents;

const minichartsStore = new MinichartsStore();
if (process.env.NODE_ENV === 'development') {
  // make store to be accessed ass a global variable
  (window as unknown as { minichartsStore: MinichartsStore; }).minichartsStore = minichartsStore;
}

export default minichartsStore;
