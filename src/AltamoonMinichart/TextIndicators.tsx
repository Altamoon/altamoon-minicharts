import React, { ReactElement } from 'react';
import styled from 'styled-components';
import { InfoCircle } from 'react-bootstrap-icons';

import formatMoneyNumber from '../lib/formatMoneyNumber';
import tooltipRef from '../lib/tooltipRef';

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
  volume: string;
  priceChangePercent: string;
}

const TextIndicators = ({ volume, priceChangePercent }: Props): ReactElement => (
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
