import React, {
  memo, ReactElement, useCallback,
} from 'react';
import {
  useGet, useSet, useSilent, useValue,
} from 'use-change';
import {
  CANDLES, PRICE_CHANGE, ROOT, VOLUMES,
} from '../store';
import AltamoonMinichart from '../AltamoonMinichart';

interface Props {
  symbol: string;
  onSymbolSelect?: (symbol: string) => void;
}

const Minichart = ({ symbol, onSymbolSelect }: Props): ReactElement | null => {
  const candles = useValue(CANDLES, symbol);
  const realTimeCandles = useValue(ROOT, 'realTimeCandles');
  const interval = useValue(ROOT, 'interval');
  const chartHeight = useValue(ROOT, 'chartHeight');
  const gridColumns = useValue(ROOT, 'gridColumns');
  const chartType = useValue(ROOT, 'chartType');
  const scaleType = useValue(ROOT, 'scaleType');
  const volume = useValue(VOLUMES, symbol);
  const priceChangePercent = useValue(PRICE_CHANGE, symbol);
  const symbolInfo = useValue(ROOT, 'futuresExchangeSymbolsMap')[symbol];
  const setSymbolAlerts = useSet(ROOT, 'symbolAlerts');
  const getSymbolAlerts = useGet(ROOT, 'symbolAlerts');
  const triggerAlert = useSilent(ROOT, 'triggerAlert');
  const onUpdateAlerts = useCallback((d: number[]) => setSymbolAlerts((v) => ({
    ...v,
    [symbol]: d,
  })), [setSymbolAlerts, symbol]);

  return (
    <AltamoonMinichart
      candles={candles ?? []}
      realTimeCandles={realTimeCandles}
      interval={interval}
      width={`${100 / gridColumns}%`}
      height={`${chartHeight}px`}
      chartType={chartType}
      scaleType={scaleType}
      pricePrecision={symbolInfo?.pricePrecision ?? 0}
      symbol={symbol}
      initialAlerts={getSymbolAlerts()[symbol] ?? []}
      baseAsset={symbolInfo?.baseAsset ?? 'UNKNOWN'}
      quoteAsset={symbolInfo?.quoteAsset ?? 'UNKNOWN'}
      volume={volume}
      priceChangePercent={priceChangePercent}
      onSymbolSelect={onSymbolSelect}
      onAlert={triggerAlert}
      onUpdateAlerts={onUpdateAlerts}
    />
  );
};

export default memo(Minichart);
