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
        <OpaqueLabel>Vol 24h</OpaqueLabel>
        {' '}
        {formatMoneyNumber(+volume || 0)}
      </span>
      <br />
      <span>
        <OpaqueLabel>% 24h</OpaqueLabel>
        {' '}
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

/*
import intervalExtendedInfoCandleLength from './lib/intervalExtendedInfoCandleLength';

const additionalInfoCandlesLengths = Object.entries(intervalExtendedInfoCandleLength[interval]);

additionalInfoCandlesLengths.map(([period, candleLength]) => {
  const pastClose = candles?.slice(-candleLength)[0]?.close;
  const currClose = candles?.[candles.length - 1]?.close;

  const percent = +(((currClose - pastClose) / pastClose) * 100).toFixed(2) || 0;
  const className = percent > 0 ? 'text-success' : 'text-danger';

  return (

    <span key={period} className="ms-2">
      <OpaqueLabel>
        {period}
        :
      </OpaqueLabel>
      {' '}
      <span className={`ml-1 ${percent ? className : ''}`}>
        {percent > 0 ? '+' : ''}
        {percent}
        %
      </span>
    </span>
  );
})}
*/
