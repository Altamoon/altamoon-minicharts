import React, { ReactElement, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { useValue } from 'use-change';
import styled from 'styled-components';

import { TradingPosition } from 'altamoon-types';
import Minichart from './Minichart';
import Settings from './Settings';
import AlertLog from './AlertLog';
import { ROOT } from '../store';

const Charts = styled.div`
  border-bottom: 1px solid rgba(100,100,100,0.5);
  border-right: 1px solid rgba(100,100,100,0.5);
`;

interface Props {
  settingsContainer?: HTMLElement;
  alertLogContainer?: HTMLElement;
  onSymbolSelect?: (symbol: string) => void;
}

const MinichartGrid = ({
  settingsContainer,
  alertLogContainer,
  onSymbolSelect,
}: Props): ReactElement => {
  const futuresExchangeSymbolsMap = useValue(ROOT, 'futuresExchangeSymbolsMap');
  const originalSymbols = useValue(ROOT, 'symbols');
  const maxChartsLength = useValue(ROOT, 'maxChartsLength');
  const allPositions = useValue(ROOT, 'allPositions');
  const symbols: string[] = useMemo(() => {
    const positionSymbols = Object.values(allPositions as Record<string, TradingPosition>)
      .filter((pos) => !!pos)
      .map(({ symbol }) => symbol);
    console.log('positionSymbols', positionSymbols);

    // show positions first
    return [
      ...positionSymbols,
      ...originalSymbols.filter((symbol) => !positionSymbols.includes(symbol)),
    ];
  }, [allPositions, originalSymbols]);

  return (
    <>
      {alertLogContainer ? createPortal(
        <AlertLog />,
        alertLogContainer,
      ) : <AlertLog />}
      {settingsContainer ? createPortal(
        <Settings />,
        settingsContainer,
      ) : <Settings />}
      <Charts>
        {symbols
          .slice(0, maxChartsLength ?? symbols.length)
          .map((symbol) => futuresExchangeSymbolsMap[symbol]).map(({ symbol }) => (
            <Minichart key={symbol} symbol={symbol} onSymbolSelect={onSymbolSelect} />
          ))}
      </Charts>
    </>
  );
};

export default hot(MinichartGrid);
