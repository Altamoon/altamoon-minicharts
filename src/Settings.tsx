import React, { ReactElement } from 'react';
import styled from 'styled-components';
import * as api from 'biduul-binance-api';
import useChange from 'use-change';
import { Row, Col } from 'reactstrap';

import { ROOT } from './store';
import { ChartType, SortBy } from './types';
import isType from './lib/isType';
import InputRange from './lib/InputRange';

const Intervals = styled.div`
  padding-bottom: 1rem;
  flex-wrap: nowrap!important;
  overflow: auto;  
`;

const SortLabel = styled.label`
  cursor: pointer;
  &:hover { color: #fff; }
`;

const IntervalItem = styled.div`
  & > span {
    padding: 0.5rem 0.75rem;
  }
`;

const MIN_CANDLES_LENGTH = 50;
const MAX_CANDLES_LENGTH = 1500;

const MIN_GRID_COLUMNS = 1;
const MAX_GRID_COLUMNS = 24;

const MIN_HEIGHT = 100;
const MAX_HEIGHT = 1000;

const THROTTLE_DELAY_VALUES = {
  '1 second': 1_000,
  '2 seconds': 2_000,
  '5 seconds': 5_000,
  '10 seconds': 10_000,
  '30 seconds': 30_000,
};

const Settings = (): ReactElement => {
  const [interval, setChartInterval] = useChange(ROOT, 'interval');
  const [chartHeight, setChartHeight] = useChange(ROOT, 'chartHeight');
  const [candlesLength, setCandlesLength] = useChange(ROOT, 'candlesLength');
  const [gridColumns, setGridColumns] = useChange(ROOT, 'gridColumns');
  const [throttleDelay, setThrottleDelay] = useChange(ROOT, 'throttleDelay');
  const [chartType, setChartType] = useChange(ROOT, 'chartType');
  const [sortBy, setSortBy] = useChange(ROOT, 'sortBy');
  const [sortDirection, setSortDirection] = useChange(ROOT, 'sortDirection');

  return (
    <>
      <Row>
        <Col xs={12} lg={4}>
          <InputRange
            label="# of rendered candles per chart"
            min={MIN_CANDLES_LENGTH}
            max={MAX_CANDLES_LENGTH}
            id="minichart_grid_candles_per_chart"
            value={candlesLength}
            onChange={setCandlesLength}
          />
        </Col>
        <Col xs={12} lg={4}>
          <InputRange
            label="# of grid columns"
            min={MIN_GRID_COLUMNS}
            max={MAX_GRID_COLUMNS}
            id="minichart_grid_columns"
            value={gridColumns}
            onChange={setGridColumns}
          />
        </Col>
        <Col xs={12} lg={4}>
          <InputRange
            label="Chart height"
            min={MIN_HEIGHT}
            max={MAX_HEIGHT}
            id="minichart_grid_height"
            value={chartHeight}
            onChange={setChartHeight}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={4}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
            <SortLabel
              className="input-group-text"
              htmlFor="minichart_grid_sort"
              onClick={() => setSortDirection((v) => (v === 1 ? -1 : 1))}
            >
              Sort
              {' '}
              {sortDirection === 1 ? '▲' : '▼'}
            </SortLabel>
            <select
              className="form-select bg-white"
              id="minichart_grid_sort"
              value={sortBy}
              onChange={({ target }) => setSortBy(target.value as SortBy)}
            >
              <option value={isType<SortBy>('none')}>Default</option>
              <option value={isType<SortBy>('alphabetically')}>Alphabetically</option>
              <option value={isType<SortBy>('volume')}>Volume (24h)</option>
              <option value={isType<SortBy>('volume_change')}>% change (24h)</option>
            </select>
          </div>
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
      <Row>
        <Col xs={12}>
          <Intervals className="nav nav-pills">
            {api.futuresIntervals.map((intervalsItem, index) => (
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
      </Row>
      <p>
        <sub>
          * Use Shift button + Mousewheel to zoom specific chart.
          Use Right click to create an alert.
        </sub>
      </p>
    </>
  );
};

export default Settings;
