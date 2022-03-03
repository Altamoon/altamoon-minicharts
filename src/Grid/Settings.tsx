import React, { LegacyRef, ReactElement } from 'react';
import styled from 'styled-components';
import * as api from 'altamoon-binance-api';
import useChange, { useValue } from 'use-change';
import { Row, Col } from 'reactstrap';

import { ROOT } from '../store';
import { ChartType, ScaleType, SortBy } from '../AltamoonMinichart/types';
import isType from '../lib/isType';
import InputRange from '../lib/InputRange';
import useSizeBreakpoint from '../lib/useSizeBreakpoint';

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
  const [gridColumns, setGridColumns] = useChange(ROOT, 'gridColumns');
  const [throttleDelay, setThrottleDelay] = useChange(ROOT, 'throttleDelay');
  const [chartType, setChartType] = useChange(ROOT, 'chartType');
  const [scaleType, setScaleType] = useChange(ROOT, 'scaleType');
  const [sortBy, setSortBy] = useChange(ROOT, 'sortBy');
  const [sortDirection, setSortDirection] = useChange(ROOT, 'sortDirection');
  const symbols = useValue(ROOT, 'symbols');
  const [maxChartsLength, setMaxChartsLength] = useChange(ROOT, 'maxChartsLength');
  const [usePerfBooster, setUsePerfBooster] = useChange(ROOT, 'usePerfBooster');
  const [usePercentageScale, setUsePercentageScale] = useChange(ROOT, 'usePercentageScale');
  const [isWide, ref] = useSizeBreakpoint('lg');

  return (
    <div ref={ref as LegacyRef<HTMLDivElement>}>
      <Row>
        <Col xs={isWide ? 4 : 12}>
          <InputRange
            label="Columns"
            min={MIN_GRID_COLUMNS}
            max={MAX_GRID_COLUMNS}
            id="minichart_columns"
            value={gridColumns}
            onChange={setGridColumns}
          />
        </Col>
        <Col xs={isWide ? 4 : 12}>
          <InputRange
            label="Charts"
            min={1}
            max={symbols.length}
            id="minichart_max_charts"
            value={maxChartsLength ?? symbols.length}
            onChange={setMaxChartsLength}
          />
        </Col>
        <Col xs={isWide ? 4 : 12}>
          <InputRange
            label="Chart height"
            min={MIN_HEIGHT}
            max={MAX_HEIGHT}
            id="minichart_height"
            value={chartHeight}
            onChange={setChartHeight}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={isWide ? 3 : 12}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
            <SortLabel
              className="input-group-text"
              htmlFor="minichart_sort"
              onClick={() => setSortDirection((v) => (v === 1 ? -1 : 1))}
            >
              Sort
              {' '}
              {sortDirection === 1 ? '▲' : '▼'}
            </SortLabel>
            <select
              className="form-select bg-white"
              id="minichart_sort"
              value={sortBy}
              onChange={({ target }) => setSortBy(target.value as SortBy)}
            >
              <option value={isType<SortBy>('alphabetically')}>Alphabetically</option>
              <option value={isType<SortBy>('volume')}>Volume (24h)</option>
              <option value={isType<SortBy>('volume_change')}>% change (24h)</option>
            </select>
          </div>
        </Col>
        <Col xs={isWide ? 3 : 12}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
            <label className="input-group-text" htmlFor="minichart_throttleDelay">Refresh</label>
            <select
              className="form-select bg-white"
              id="minichart_throttleDelay"
              value={throttleDelay}
              onChange={({ target }) => setThrottleDelay(+target.value)}
            >
              {Object.entries(THROTTLE_DELAY_VALUES).map(([label, value]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </Col>
        <Col xs={isWide ? 3 : 12}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
            <label className="input-group-text" htmlFor="minichart_chartType">Candle Type</label>
            <select
              className="form-select bg-white"
              id="minichart_chartType"
              value={chartType}
              onChange={({ target }) => setChartType(target.value as ChartType)}
            >
              <option value={isType<ChartType>('candlestick')}>Candles</option>
              <option value={isType<ChartType>('heikin_ashi')}>Heikin-Ashi</option>
              <option value={isType<ChartType>('heikin_ashi_actual_price')}>Heikin-Ashi (actual price)</option>
            </select>
          </div>
        </Col>
        <Col xs={isWide ? 3 : 12}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */ }
            <label className="input-group-text" htmlFor="minichart_scaleType">Scale</label>
            <select
              className="form-select bg-white"
              id="minichart_scaleType"
              value={scaleType}
              onChange={({ target }) => setScaleType(target.value as ScaleType)}
            >
              <option value={isType<ScaleType>('linear')}>Linear</option>
              <option value={isType<ScaleType>('log')}>Logarithmic</option>
            </select>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={isWide ? 6 : 12}>
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
        <Col xs={isWide ? 6 : 12} className="text-end pt-2">
          <label htmlFor="minichartsUsePerfBooster" className="me-4">
            <input
              type="checkbox"
              id="minichartsUsePerfBooster"
              checked={usePerfBooster}
              onChange={({ target }) => setUsePerfBooster(target.checked)}
            />
            {' '}
            Use perf booster (experimental)
          </label>
          <label htmlFor="minichartsUsePercentageScale">
            <input
              type="checkbox"
              id="minichartsUsePercentageScale"
              checked={usePercentageScale}
              onChange={({ target }) => setUsePercentageScale(target.checked)}
            />
            {' '}
            Use percentage scale
          </label>
        </Col>
      </Row>
      <p>
        <sub>
          * Use Shift button + Mousewheel to zoom specific chart.
          Use Right click to create an alert.
        </sub>
      </p>
    </div>
  );
};

export default Settings;
