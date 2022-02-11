import React, { memo, ReactElement } from 'react';
import styled from 'styled-components';
import * as api from 'altamoon-binance-api';
import { TradingOrder, TradingPosition } from 'altamoon-types';

import TextIndicators from './TextIndicators';
import MinichartBody from './MinichartBody';
import { AlertItem, ChartType, ScaleType } from './types';

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

const Container = styled.div<{ position?: TradingPosition | null }>`
  border-top: 1px solid rgba(100,100,100,0.5);
  border-left: 1px solid rgba(100,100,100,0.5);
  display: inline-block;
  position: relative;

  /* border rendered as a separate element */
  &::before {
    content: '';
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    ${({ position }) => (position && position.pnl > 0 ? 'border: 1px solid var(--bs-success);' : '')}
    ${({ position }) => (position && position.pnl < 0 ? 'border: 1px solid var(--bs-danger);' : '')}
  }
`;

interface Props {
  candles: api.FuturesChartCandle[];
  interval: api.CandlestickChartInterval;
  width: string;
  height: string;
  chartType: ChartType;
  scaleType: ScaleType;
  pricePrecision: number;
  symbol: string;
  alerts: AlertItem[];
  orders?: TradingOrder[] | null;
  position?: TradingPosition | null;
  leverageBrackets?: api.FuturesLeverageBracket[];
  baseAsset: string;
  quoteAsset: string;
  volume: string;
  priceChangePercent: string;
  usePercentageScale?: boolean;
  onSymbolSelect?: (symbol: string) => void;
  onUpdateAlerts: (d: AlertItem[]) => void;
}

const AltamoonMinichart = ({
  candles,
  interval,
  width,
  height,
  chartType,
  scaleType,
  pricePrecision,
  symbol,
  alerts,
  orders,
  position,
  leverageBrackets,
  baseAsset,
  quoteAsset,
  volume,
  priceChangePercent,
  usePercentageScale,
  onSymbolSelect,
  onUpdateAlerts,
}: Props): ReactElement | null => {
  const onSymbolNameClick = onSymbolSelect ?? ((sym: string) => window.open(`https://www.binance.com/en/futures/${sym}`));

  return (
    <Container style={{ width }} data-minichart-symbol={symbol} position={position}>
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
      <MinichartBody
        candles={candles}
        height={height}
        chartType={chartType}
        scaleType={scaleType}
        pricePrecision={pricePrecision}
        alerts={alerts}
        orders={orders}
        position={position}
        leverageBrackets={leverageBrackets}
        usePercentageScale={usePercentageScale}
        onUpdateAlerts={onUpdateAlerts}
      />
    </Container>
  );
};

export default memo(AltamoonMinichart);
