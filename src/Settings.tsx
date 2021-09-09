import React, { ReactElement } from 'react';
import styled from 'styled-components';
import * as api from 'biduul-binance-api';
import useChange from 'use-change';
import { Row, Col } from 'reactstrap';

import { ROOT } from './store';
import { ChartType } from './types';
import isType from './lib/isType';
import InputRange from './lib/InputRange';

const Intervals = styled.div`
  padding-bottom: 1rem;
  flex-wrap: nowrap!important;
  overflow: auto;  
`;

const IntervalItem = styled.div`
  & > span {
    padding: 0.5rem 0.75rem;
  }
`;

const MIN_CANDLES_LENGTH = 50;
const MAX_CANDLES_LENGTH = 1000;

const MIN_GRID_COLUMNS = 1;
const MAX_GRID_COLUMNS = 24;

const THROTTLE_DELAY_VALUES = {
  '1 second': 1_000,
  '2 seconds': 2_000,
  '5 seconds': 5_000,
  '10 seconds': 10_000,
  '30 seconds': 30_000,
};

const intervals: api.CandlestickChartInterval[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '12h', '1d'];
const Settings = (): ReactElement => {
  const [interval, setChartInterval] = useChange(ROOT, 'interval');
  const [candlesLength, setCandlesLength] = useChange(ROOT, 'candlesLength');
  const [gridColumns, setGridColumns] = useChange(ROOT, 'gridColumns');
  const [throttleDelay, setThrottleDelay] = useChange(ROOT, 'throttleDelay');
  const [chartType, setChartType] = useChange(ROOT, 'chartType');

  return (
    <>
      <Row>
        <Col xs={12} lg={6}>
          <InputRange
            label="# of candles per chart"
            min={MIN_CANDLES_LENGTH}
            max={MAX_CANDLES_LENGTH}
            id="minichart_grid_candles_per_chart"
            value={candlesLength}
            onChange={setCandlesLength}
          />
        </Col>
        <Col xs={12} lg={6}>
          <InputRange
            label="# of grid columns"
            min={MIN_GRID_COLUMNS}
            max={MAX_GRID_COLUMNS}
            id="minichart_grid_columns"
            value={gridColumns}
            onChange={setGridColumns}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={4}>
          <Intervals className="nav nav-pills">
            {intervals.map((intervalsItem, index) => (
              <IntervalItem
                role="button"
                tabIndex={index}
                className="nav-item cursor-pointer"
                key={intervalsItem}
                onClick={() => { setChartInterval(intervalsItem); }}
                onKeyDown={() => { setChartInterval(intervalsItem); }}
              >
                <span className={`nav-link ${interval === intervalsItem ? 'active' : ''}`}>
                  {intervalsItem}
                </span>
              </IntervalItem>
            ))}
          </Intervals>
        </Col>
        <Col xs={12} lg={4}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
            <label className="input-group-text" htmlFor="minichart_grid_throttleDelay">Throttle</label>
            <select
              className="form-select bg-white"
              id="minichart_grid_throttleDelay"
              value={throttleDelay}
              onChange={({ target }) => setThrottleDelay(+target.value)}
            >
              {Object.entries(THROTTLE_DELAY_VALUES).map(([label, value]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </Col>
        <Col xs={12} lg={4}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
            <label className="input-group-text" htmlFor="minichart_grid_chartType">Type</label>
            <select
              className="form-select bg-white"
              id="minichart_grid_chartType"
              value={chartType}
              onChange={({ target }) => setChartType(target.value as ChartType)}
            >
              <option value={isType<ChartType>('candlestick')}>Candlestick</option>
              <option value={isType<ChartType>('heikin_ashi')}>Heikin-Ashi</option>
              <option value={isType<ChartType>('heikin_ashi_actual_price')}>Heikin-Ashi (actual price)</option>
            </select>
          </div>
        </Col>
      </Row>
      <p>
        <sub>
          * Use Shift button + Mousewheel to zoom specific chart
        </sub>
      </p>
    </>
  );
};

export default Settings;
