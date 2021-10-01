import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import styled from 'styled-components';

import { PRICE_CHANGE, VOLUMES } from './store';
import formatMoneyNumber from './lib/formatMoneyNumber';

const OpaqueLabel = styled.span`
  opacity: 0.5;
`;

interface Props {
  symbol: string;
}

const TextIndicators = ({ symbol }: Props): ReactElement => {
  const volume = useValue(VOLUMES, symbol);
  const priceChangePercent = useValue(PRICE_CHANGE, symbol);
  return (

    <>
      <span>
        <OpaqueLabel>Volume (24h):</OpaqueLabel>
        {' '}
                  &nbsp;
        {formatMoneyNumber(+volume || 0)}
      </span>
      <br />
      <span>
        <OpaqueLabel>% change (24h):</OpaqueLabel>
        {' '}
                  &nbsp;
        <span className={(!!+priceChangePercent && (+priceChangePercent > 0 ? 'text-success' : 'text-danger')) || undefined}>
          {+priceChangePercent > 0 ? '+' : ''}
          {priceChangePercent || 0}
          %
        </span>
      </span>
    </>

  );
};

export default TextIndicators;
