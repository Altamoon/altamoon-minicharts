import React, {
  memo, ReactElement, useCallback, useEffect, useRef, useState,
} from 'react';
import {
  useGet, useSet, useSilent, useValue,
} from 'use-change';
import styled from 'styled-components';
import { useInView } from 'react-intersection-observer';

import { CANDLES, ROOT } from '../store';
import Chart from '../Chart';
import TextIndicators from './TextIndicators';

interface Props {
  symbol: string;
  onSymbolSelect?: (symbol: string) => void;
}

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

const Minichart = ({ symbol, onSymbolSelect }: Props): ReactElement | null => {
  const candles = useValue(CANDLES, symbol);
  const realTimeCandles = useValue(ROOT, 'realTimeCandles');
  const interval = useValue(ROOT, 'interval');
  const chartHeight = useValue(ROOT, 'chartHeight');
  const gridColumns = useValue(ROOT, 'gridColumns');
  const candlesLength = useValue(ROOT, 'candlesLength');
  const chartType = useValue(ROOT, 'chartType');
  const symbolInfo = useValue(ROOT, 'futuresExchangeSymbolsMap')[symbol];
  const ref = useRef<HTMLDivElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const setSymbolAlerts = useSet(ROOT, 'symbolAlerts');
  const getSymbolAlerts = useGet(ROOT, 'symbolAlerts');
  const triggerAlert = useSilent(ROOT, 'triggerAlert');
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
    if (inView) chartInstance?.update({ candles: (candles || []).slice(-candlesLength) });
  }, [candles, candlesLength, chartInstance, inView]);
  useEffect(() => { if (symbolInfo) chartInstance?.update({ symbolInfo }); });
  useEffect(() => { chartInstance?.update({ chartType }); }, [chartInstance, chartType]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !chartInstance) {
      const instance = new Chart(ref.current, {
        triggerAlert,
        realTimeCandles,
        symbol,
        onUpdateAlerts: (d: number[]) => setSymbolAlerts((v) => ({
          ...v,
          [symbol]: d,
        })),
      });

      instance.update({
        candles: (candles || []).slice(-candlesLength),
        chartType,
        alerts: getSymbolAlerts()[symbol],
      });

      setChartInstance(instance);
    }
  });

  return (
    <Container style={{ width: `${100 / gridColumns}%` }} data-minichart-symbol={symbol}>
      <ChartInfo>
        <SymbolName onClick={() => onSymbolNameClick?.(symbol)}>
          {symbolInfo?.baseAsset}
          /
          {symbolInfo?.quoteAsset}
        </SymbolName>
        <div className="float-end text-end" style={{ fontSize: '.75em' }}>
          {!candles?.length || candles[0].interval !== interval ? `Loading ${interval}...`
            : (
              <TextIndicators symbol={symbol} />
            )}
        </div>
      </ChartInfo>
      <div style={{ height: `${chartHeight}px` }} ref={setRefs} />
    </Container>
  );
};

export default memo(Minichart);
