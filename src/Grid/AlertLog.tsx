import React, { ReactElement, useCallback, useState } from 'react';
import { Bell, BellFill } from 'react-bootstrap-icons';
import styled from 'styled-components';
import useChange from 'use-change';
import Moment from 'react-moment';
import { DropdownMenu, Button } from 'reactstrap';

import { ROOT } from '../store';

const AlertLogWrapper = styled.div`
  position: absolute;
  bottom: 24px;
  right: 32px;
  border-radius: 50%;
  z-index: 1;
`;

const BellWrapper = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
`;

const Badge = styled.div`
  position: absolute;
  top: -16px;
  right: -18px;
`;

const AlertList = styled.ul`
  right: 32px;
  bottom: 0;
  max-height: 240px;
  overflow: auto;
`;

const BADGE_SEEN_TTL = 2 * 60 * 60 * 1000;

const ignoreAlertsBeforeISO = new Date(Date.now() - BADGE_SEEN_TTL).toISOString();

const dateMaxISO = (
  a: string, b: string,
) => (new Date(a).getTime() > new Date(b).getTime() ? a : b);

const AlertLog = (): ReactElement => {
  const [alertLog, setAlertLog] = useChange(ROOT, 'alertLog');
  const [alertLogLastSeenISO, setAlertLogLastSeenISO] = useChange(ROOT, 'alertLogLastSeenISO');
  const [currentalertLogLastSeenISO, setCurrentalertLogLastSeenISO] = useState(
    alertLogLastSeenISO
      ? dateMaxISO(alertLogLastSeenISO, ignoreAlertsBeforeISO)
      : ignoreAlertsBeforeISO,
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const getIsActiveLogItem = (timeISO: string) => !currentalertLogLastSeenISO
    || timeISO > currentalertLogLastSeenISO;
  const unreadLogItemsLength = alertLog
    .filter(({ timeISO }) => getIsActiveLogItem(timeISO))
    .length;
  const onToggleAlertLogItems = useCallback(() => {
    const nowISO = new Date().toISOString();
    if (isDropdownOpen) {
      setCurrentalertLogLastSeenISO(nowISO);
    }

    setAlertLogLastSeenISO(nowISO);
    setIsDropdownOpen(!isDropdownOpen);
  }, [isDropdownOpen, setAlertLogLastSeenISO]);
  const onClickItem = useCallback((symbol: string) => {
    const chartWrapper = document.querySelector<HTMLElement>(`[data-minichart-symbol="${symbol}"]`);
    const minichart = chartWrapper?.querySelector<SVGElement>('.minichart');
    if (chartWrapper && minichart) {
      chartWrapper.scrollIntoView({ behavior: 'smooth' });
      minichart.style.transition = 'background-color 0.5s';
      minichart.style.backgroundColor = '#f39c1285';

      setTimeout(() => {
        minichart.style.backgroundColor = '';
        setTimeout(() => { minichart.style.transition = ''; }, 500);
      }, 500);
    }
  }, []);

  return (
    <AlertLogWrapper className="alert-log-wrapper">
      <BellWrapper>
        {unreadLogItemsLength ? (
          <>
            <BellFill size={32} role="button" onClick={() => onToggleAlertLogItems()} />
            <Badge role="button" className="badge rounded-pill bg-danger" onClick={() => onToggleAlertLogItems()}>
              {unreadLogItemsLength}
            </Badge>
          </>
        ) : (
          <Bell role="button" size={32} onClick={() => onToggleAlertLogItems()} />
        )}
      </BellWrapper>
      <DropdownMenu tag={AlertList} className={isDropdownOpen ? 'show' : undefined}>
        {!alertLog.length && <li><em className="dropdown-item-text text-nowrap">No triggered alerts yet</em></li>}
        {alertLog.map(({
          type, symbol, price, timeISO,
        }) => {
          const [, secondaryAsset, primaryAsset] = /(\S+)(USDT|BUSD)/.exec(symbol) ?? [symbol, symbol, ''];
          return (
            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
            <li
              key={timeISO}
              onClick={() => onClickItem(symbol)}
              onKeyDown={() => onClickItem(symbol)}
            >
              <span className={getIsActiveLogItem(timeISO) ? 'dropdown-item active' : 'dropdown-item-text text-nowrap'}>
                {type === 'PRICE_UP' ? <span className="text-success">↑</span> : null}
                {type === 'PRICE_DOWN' ? <span className="text-danger">↓</span> : null}
                {type === 'VOLUME_ANOMALY' ? <span className="text-warning">•</span> : null}
                {' '}
                {secondaryAsset}
                {' '}
                at price
                {' '}
                {price}
                {' '}
                {primaryAsset}
                {' '}
                <Moment date={timeISO} fromNow interval={1000} />
              </span>
            </li>
          );
        })}
        {!!alertLog.length && (
          <li className="text-center py-2">
            <Button
              color="secondary"
              size="sm"
              onClick={() => {
                setAlertLog([]);
                setIsDropdownOpen(false);
              }}
            >
              Clear alerts log
            </Button>
          </li>
        )}
      </DropdownMenu>
    </AlertLogWrapper>
  );
};

export default AlertLog;
