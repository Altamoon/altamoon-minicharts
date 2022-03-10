import React, {
  memo, ReactElement, useCallback,
} from 'react';
import useChange, { useValue } from 'use-change';
import {
  CANDLES, LEVERAGE_BRACKETS, ORDERS, POSITIONS, PRICE_CHANGE, ROOT, VOLUMES,
} from '../store';
import AltamoonMinichart from '../AltamoonMinichart';
import { AlertItem } from '../AltamoonMinichart/types';

interface Props {
  symbol: string;
  onSymbolSelect?: (symbol: string) => void;
}

const Minichart = ({ symbol, onSymbolSelect }: Props): ReactElement | null => {
  const candles = useValue(CANDLES, symbol);
  const position = useValue(POSITIONS, symbol);
  const orders = useValue(ORDERS, symbol);
  const leverageBrackets = useValue(LEVERAGE_BRACKETS, symbol);
  const interval = useValue(ROOT, 'interval');
  const chartHeight = useValue(ROOT, 'chartHeight');
  const gridColumns = useValue(ROOT, 'gridColumns');
  const chartType = useValue(ROOT, 'chartType');
  const scaleType = useValue(ROOT, 'scaleType');
  const usePercentageScale = useValue(ROOT, 'usePercentageScale');
  const volume = useValue(VOLUMES, symbol);
  const priceChangePercent = useValue(PRICE_CHANGE, symbol);
  const symbolInfo = useValue(ROOT, 'futuresExchangeSymbolsMap')[symbol];
  const [symbolAlerts, setSymbolAlerts] = useChange(ROOT, 'symbolAlerts');
  const shouldShowVolume = useValue(ROOT, 'shouldShowVolume');

  const onUpdateAlerts = useCallback((d: AlertItem[]) => {
    setSymbolAlerts((v) => ({
      ...v,
      [symbol]: d,
    }));
  }, [setSymbolAlerts, symbol]);

  return (
    <AltamoonMinichart
      candles={candles ?? []}
      interval={interval}
      width={`${100 / gridColumns}%`}
      height={`${chartHeight}px`}
      chartType={chartType}
      scaleType={scaleType}
      pricePrecision={symbolInfo?.pricePrecision ?? 0}
      symbol={symbol}
      alerts={symbolAlerts[symbol]}
      position={position}
      orders={orders}
      leverageBrackets={leverageBrackets}
      baseAsset={symbolInfo?.baseAsset ?? 'UNKNOWN'}
      quoteAsset={symbolInfo?.quoteAsset ?? 'UNKNOWN'}
      volume={volume}
      priceChangePercent={priceChangePercent}
      usePercentageScale={usePercentageScale}
      shouldShowVolume={shouldShowVolume}
      onSymbolSelect={onSymbolSelect}
      onUpdateAlerts={onUpdateAlerts}
    />
  );
};

export default memo(Minichart);
