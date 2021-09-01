import React, { ReactElement } from 'react';
import styled from 'styled-components';
import * as api from 'biduul-binance-api';
import useChange from 'use-change';
import { Row, Col } from 'reactstrap';
import { ROOT } from './store';

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

const RangeEdgeLabel = styled.span`
  font-size: 0.75rem;
  line-height: 1;
  top: -3px;
  position: relative;

  &.min { float: left; }
  &.max { float: right; }
`;

const MIN_CANDLES_LENGTH = 50;
const MAX_CANDLES_LENGTH = 1000;

const MIN_GRID_COLUMNS = 1;
const MAX_GRID_COLUMNS = 12;

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

  return (
    <>
      <Row>
        <Col xs={12} lg={6}>
          <Row>
            <Col xs={9}>
              <div className="nowrap"># of candles per chart</div>
            </Col>
            <Col xs={3} className="nowrap text-end">
              {candlesLength}
            </Col>
            <Col xs={12} className="mb-3">
              <input
                type="range"
                className="form-range"
                value={candlesLength}
                min={MIN_CANDLES_LENGTH}
                max={MAX_CANDLES_LENGTH}
                step={1}
                onChange={({ target }) => setCandlesLength(+target.value)}
              />
              <RangeEdgeLabel className="min text-muted">{MIN_CANDLES_LENGTH}</RangeEdgeLabel>
              <RangeEdgeLabel className="max text-muted">{MAX_CANDLES_LENGTH}</RangeEdgeLabel>
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={6}>
          <Row>
            <Col xs={9}>
              <div className="nowrap"># of grid columns</div>
            </Col>
            <Col xs={3} className="nowrap text-end">
              {gridColumns}
            </Col>
            <Col xs={12} className="mb-3">
              <input
                type="range"
                className="form-range"
                value={gridColumns}
                min={MIN_GRID_COLUMNS}
                max={MAX_GRID_COLUMNS}
                step={1}
                onChange={({ target }) => setGridColumns(+target.value)}
              />
              <RangeEdgeLabel className="min text-muted">{MIN_GRID_COLUMNS}</RangeEdgeLabel>
              <RangeEdgeLabel className="max text-muted">{MAX_GRID_COLUMNS}</RangeEdgeLabel>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={6}>
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
        <Col xs={12} lg={6}>
          <div className="input-group mb-3">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
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
      </Row>
    </>
  );
};

export default Settings;
