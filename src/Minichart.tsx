import React, {
  memo, ReactElement, useEffect, useRef, useState,
} from 'react';
import useChange, { useValue } from 'use-change';
import styled from 'styled-components';
import { CANDLES, ROOT } from './store';
import Chart from './Chart';
import intervalExtendedInfoCandleLength from './lib/intervalExtendedInfoCandleLength';

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
  const realTimePrices = useValue(ROOT, 'realTimePrices');
  const interval = useValue(ROOT, 'interval');
  const chartHeight = useValue(ROOT, 'chartHeight');
  const gridColumns = useValue(ROOT, 'gridColumns');
  const candlesLength = useValue(ROOT, 'candlesLength');
  const chartType = useValue(ROOT, 'chartType');
  const futuresExchangeSymbols = useValue(ROOT, 'futuresExchangeSymbols');
  const ref = useRef<HTMLDivElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const symbolInfo = futuresExchangeSymbols.find((s) => s.symbol === symbol);
  const additionalInfoCandlesLengths = Object.entries(intervalExtendedInfoCandleLength[interval]);
  const [symbolAlerts, setSymbolAlerts] = useChange(ROOT, 'symbolAlerts');
  const alerts = symbolAlerts[symbol];

  useEffect(() => {
    chartInstance?.update({ candles: (candles || []).slice(-candlesLength) });
  }, [candles, candlesLength, chartInstance]);
  useEffect(() => { if (symbolInfo) chartInstance?.update({ symbolInfo }); });
  useEffect(() => { chartInstance?.update({ chartType }); }, [chartInstance, chartType]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !chartInstance) {
      const instance = new Chart(ref.current, {
        realTimePrices,
        symbol,
        onUpdateAlerts: (d: number[]) => setSymbolAlerts((v) => ({
          ...v,
          [symbol]: d,
        })),
      });

      instance.update({
        candles: (candles || []).slice(-candlesLength),
        chartType,
        alerts,
      });

      setChartInstance(instance);
    }
  });

  const onSymbolNameClick = onSymbolSelect ?? ((sym: string) => window.open(`https://www.binance.com/en/futures/${sym}`));

  return (
    <Container style={{ width: `${100 / gridColumns}%` }}>
      <ChartInfo>
        <SymbolName onClick={() => onSymbolNameClick?.(symbol)}>
          {symbolInfo?.baseAsset}
          /
          {symbolInfo?.quoteAsset}
        </SymbolName>
        <sub className="float-end  mt-2">
          {candles?.length && candles[0].interval !== interval ? `Loading ${interval}...`
            : additionalInfoCandlesLengths.map(([period, candleLength]) => {
              const pastClose = candles?.slice(-candleLength)[0]?.close;
              const currClose = candles?.[candles.length - 1]?.close;

              const percent = +(((currClose - pastClose) / pastClose) * 100).toFixed(2) || 0;
              const className = percent > 0 ? 'text-success' : 'text-danger';

              return (

                <span key={period} className="ms-2">
                  {period}
                  :
                  {' '}
                  <span className={`ml-1 ${percent ? className : ''}`}>
                    {percent > 0 ? '+' : ''}
                    {percent}
                    %
                  </span>
                </span>
              );
            })}
        </sub>
      </ChartInfo>
      <div style={{ height: `${chartHeight}px` }} ref={(node) => { ref.current = node; }} />
    </Container>
  );
};

export default memo(Minichart);
