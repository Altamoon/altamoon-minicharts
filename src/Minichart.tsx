import React, {
  memo, ReactElement, useEffect, useRef, useState,
} from 'react';
import { useValue } from 'use-change';
import styled from 'styled-components';
import { CANDLES, ROOT } from './store';
import Chart from './Chart';

interface Props {
  symbol: string;
}

const Container = styled.div`
  border-top: 1px solid rgba(100,100,100,0.5);
  border-left: 1px solid rgba(100,100,100,0.5);
  display: inline-block;
`;

const ChartContainer = styled.div`
  height: 200px;
`;

const Minichart = ({ symbol }: Props): ReactElement => {
  const candles = useValue(CANDLES, symbol);
  const gridColumns = useValue(ROOT, 'gridColumns');
  const candlesLength = useValue(ROOT, 'candlesLength');
  const futuresExchangeSymbols = useValue(ROOT, 'futuresExchangeSymbols');
  const ref = useRef<HTMLDivElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const symbolInfo = futuresExchangeSymbols.find((s) => s.symbol === symbol);

  useEffect(() => {
    chartInstance?.update({ candles: (candles || []).slice(-candlesLength) });
  }, [candles, candlesLength, chartInstance]);
  useEffect(() => { if (symbolInfo) chartInstance?.update({ symbolInfo }); });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !chartInstance) {
      const instance = new Chart(ref.current);
      instance.update({ candles });

      setChartInstance(instance);
    }
  });

  return (
    <Container style={{ width: `${100 / gridColumns}%` }}>
      {symbol}
      <ChartContainer ref={(node) => { ref.current = node; }} />
    </Container>
  );
};

export default memo(Minichart);
