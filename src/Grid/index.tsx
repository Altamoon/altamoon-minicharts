import React, { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { hot } from 'react-hot-loader/root';
import { useValue } from 'use-change';
import styled from 'styled-components';

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
  onSymbolSelect?: (symbol: string) => void;
}

const MinichartGrid = ({
  settingsContainer,
  onSymbolSelect,
}: Props): ReactElement => {
  const futuresExchangeSymbolsMap = useValue(ROOT, 'futuresExchangeSymbolsMap');
  const symbols = useValue(ROOT, 'symbols');
  const maxChartsLength = useValue(ROOT, 'maxChartsLength');

  return (
    <div>
      <AlertLog />
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
    </div>
  );
};

export default hot(MinichartGrid);