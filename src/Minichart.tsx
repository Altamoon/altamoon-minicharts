import React, {
  memo, ReactElement, useEffect, useRef, useState,
} from 'react';
import { useValue } from 'use-change';
import styled from 'styled-components';
import { CANDLES, ROOT } from './store';
import Chart from './Chart';

interface Props {
  symbol: string;
  onSymbolSelect?: (symbol: string) => void;
}

const ChartInfo = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 0.25rem 0.5rem;
  pointer-events: none;
`;

const SymbolName = styled.div<{ hasHandler: boolean; }>`
  color: #fff;
  display: inline;
  ${({ hasHandler }) => hasHandler && `
    cursor: pointer;
    pointer-events: auto;

    &:hover {
      text-decoration: underline;
    }
  `}
`;

const Container = styled.div`
  border-top: 1px solid rgba(100,100,100,0.5);
  border-left: 1px solid rgba(100,100,100,0.5);
  display: inline-block;
  position: relative;
`;

const ChartContainer = styled.div`
  height: 200px;
`;

const Minichart = ({ symbol, onSymbolSelect }: Props): ReactElement => {
  const candles = useValue(CANDLES, symbol);
  const gridColumns = useValue(ROOT, 'gridColumns');
  const candlesLength = useValue(ROOT, 'candlesLength');
  const chartType = useValue(ROOT, 'chartType');
  const futuresExchangeSymbols = useValue(ROOT, 'futuresExchangeSymbols');
  const ref = useRef<HTMLDivElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const symbolInfo = futuresExchangeSymbols.find((s) => s.symbol === symbol);

  useEffect(() => {
    chartInstance?.update({ candles: (candles || []).slice(-candlesLength) });
  }, [candles, candlesLength, chartInstance]);
  useEffect(() => { if (symbolInfo) chartInstance?.update({ symbolInfo }); });
  useEffect(() => { chartInstance?.update({ chartType }); }, [chartInstance, chartType]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !chartInstance) {
      const instance = new Chart(ref.current);
      instance.update({ candles, chartType });

      setChartInstance(instance);
    }
  });

  return (
    <Container style={{ width: `${100 / gridColumns}%` }}>
      <ChartInfo>
        <SymbolName onClick={() => onSymbolSelect?.(symbol)} hasHandler={!!onSymbolSelect}>
          {symbolInfo?.baseAsset}
          /
          {symbolInfo?.quoteAsset}
        </SymbolName>
      </ChartInfo>
      <ChartContainer ref={(node) => { ref.current = node; }} />
    </Container>
  );
};

export default memo(Minichart);
