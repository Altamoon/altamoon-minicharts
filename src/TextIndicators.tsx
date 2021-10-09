import React, { ReactElement } from 'react';
import { useValue } from 'use-change';
import styled from 'styled-components';
import { InfoCircle } from 'react-bootstrap-icons';

import { PRICE_CHANGE, VOLUMES } from './store';
import formatMoneyNumber from './lib/formatMoneyNumber';
import tooltipRef from './lib/tooltipRef';

const InfoContainer = styled.span`
  display: inline-block;
  vertical-align: top;
  margin-top: -1px;
  pointer-events: auto;
  opacity: 0.4;
  cursor: help;
  &:hover { opacity: 1; }
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
        {formatMoneyNumber(+volume || 0)}
        {' '}
        <InfoContainer ref={tooltipRef()} title="Volume (24h)">
          <InfoCircle />
        </InfoContainer>
      </span>
      <br />
      <span>
        <span className={(!!+priceChangePercent && (+priceChangePercent > 0 ? 'text-success' : 'text-danger')) || undefined}>
          {+priceChangePercent > 0 ? '+' : ''}
          {priceChangePercent || 0}
          %
        </span>
        {' '}
        <InfoContainer ref={tooltipRef()} title="% change (24h)">
          <InfoCircle />
        </InfoContainer>
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
