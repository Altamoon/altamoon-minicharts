import React, {
  memo, ReactElement, useCallback, useEffect, useRef, useState,
} from 'react';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';
import * as api from 'altamoon-binance-api';
import { TradingOrder, TradingPosition } from 'altamoon-types';

import Chart from './Chart';
import TextIndicators from './TextIndicators';
import { AlertType, ChartType, ScaleType } from './types';

const ChartInfo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 55px);
  padding: 0.25rem 0.5rem;
  pointer-events: none;
`;

const SymbolName = styled.div`
  color: #fff;
  display: inline;
  cursor: pointer;
  pointer-events: auto;

  &:hover {
    text-decoration: underline;
  }
`;

const Container = styled.div`
  border-top: 1px solid rgba(100,100,100,0.5);
  border-left: 1px solid rgba(100,100,100,0.5);
  display: inline-block;
  position: relative;
`;

interface Props {
  candles: api.FuturesChartCandle[];
  realTimeCandles: Record<string, api.FuturesChartCandle[]>;
  interval: api.CandlestickChartInterval;
  width: string;
  height: string;
  chartType: ChartType;
  scaleType: ScaleType;
  pricePrecision: number;
  symbol: string;
  initialAlerts: number[];
  orders?: TradingOrder[] | null;
  position?: TradingPosition | null;
  leverageBrackets?: api.FuturesLeverageBracket[];
  baseAsset: string;
  quoteAsset: string;
  volume: string;
  priceChangePercent: string;
  onSymbolSelect?: (symbol: string) => void;
  onAlert: (type: AlertType, symbol: string) => void;
  onUpdateAlerts: (d: number[]) => void;
}

const AltamoonMinichart = ({
  candles,
  realTimeCandles,
  interval,
  width,
  height,
  chartType,
  scaleType,
  pricePrecision,
  symbol,
  initialAlerts,
  orders,
  position,
  leverageBrackets,
  baseAsset,
  quoteAsset,
  volume,
  priceChangePercent,
  onSymbolSelect,
  onAlert,
  onUpdateAlerts,
}: Props): ReactElement | null => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const onSymbolNameClick = onSymbolSelect ?? ((sym: string) => window.open(`https://www.binance.com/en/futures/${sym}`));
  const [inViewRef, inView] = useInView();

  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      ref.current = node;
      inViewRef(node);
    },
    [inViewRef],
  );

  useEffect(() => {
    if (inView) chartInstance?.update({ candles: candles || [] });
  }, [candles, chartInstance, inView]);
  useEffect(() => { chartInstance?.update({ pricePrecision }); }, [chartInstance, pricePrecision]);
  useEffect(() => { chartInstance?.update({ chartType }); }, [chartInstance, chartType]);
  useEffect(() => { chartInstance?.update({ orders }); }, [chartInstance, orders, scaleType]);
  useEffect(() => { chartInstance?.update({ position }); }, [chartInstance, position, scaleType]);
  useEffect(() => {
    chartInstance?.update({ leverageBrackets });
  }, [chartInstance, leverageBrackets, scaleType]);
  useEffect(() => { chartInstance?.update({ scaleType }); }, [chartInstance, scaleType]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !chartInstance) {
      const instance = new Chart(ref.current, {
        scaleType,
        triggerAlert: onAlert,
        realTimeCandles,
        symbol,
        onUpdateAlerts,
      });

      instance.update({
        candles,
        chartType,
        alerts: initialAlerts,
      });

      setChartInstance(instance);
    }
  });

  return (
    <Container style={{ width }} data-minichart-symbol={symbol}>
      <ChartInfo>
        <SymbolName onClick={() => onSymbolNameClick?.(symbol)}>
          {baseAsset}
          /
          {quoteAsset}
        </SymbolName>
        <div className="float-end text-end" style={{ fontSize: '.75em' }}>
          {!candles?.length || candles[0].interval !== interval ? `Loading ${interval}...`
            : (
              <TextIndicators volume={volume} priceChangePercent={priceChangePercent} />
            )}
        </div>
      </ChartInfo>
      <div style={{ height }} ref={setRefs} />
    </Container>
  );
};

export default memo(AltamoonMinichart);
