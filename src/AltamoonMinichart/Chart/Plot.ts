/* eslint-disable prefer-object-spread */
// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path='./elegant-threading.d.ts' />

import * as d3 from 'd3';
import * as api from 'altamoon-binance-api';
import thread from 'elegant-threading';

import { isEqual } from 'lodash';
import {
  D3Selection, DrawData, ResizeData, Scales,
} from './types';
import { ChartType } from '../types';

export default class Plot {
  #resizeData?: ResizeData;

  #chartType: ChartType = 'candlestick';

  #lastCandle?: api.FuturesChartCandle;

  #yDomain: [number, number] = [0, 0];

  #scales: Scales;

  #pathBodiesUp?: D3Selection<SVGPathElement>;

  #pathBodiesDown?: D3Selection<SVGPathElement>;

  #pathWicksUp?: D3Selection<SVGPathElement>;

  #pathWicksDown?: D3Selection<SVGPathElement>;

  #pathLastBodysUp?: D3Selection<SVGPathElement>;

  #pathLastBodyDown?: D3Selection<SVGPathElement>;

  #pathLastWickUp?: D3Selection<SVGPathElement>;

  #pathLastWickDown?: D3Selection<SVGPathElement>;

  #zoomTransform?: Pick<d3.ZoomTransform, 'k' | 'x' | 'y'>;

  #wrapper?: D3Selection<SVGGElement>;

  constructor({ scales }: { scales: Scales; }) {
    this.#scales = scales;
  }

  public appendTo = (parent: Element): void => {
    const wrapper = d3.select(parent).append('g')
      .attr('class', 'plot')
      .attr('clip-path', 'url(#minichartClipChart)');

    this.#wrapper = wrapper;

    this.#pathBodiesUp = wrapper.append('path').attr('class', 'body up');
    this.#pathBodiesDown = wrapper.append('path').attr('class', 'body down');
    this.#pathWicksUp = wrapper.append('path').attr('class', 'wick up');
    this.#pathWicksDown = wrapper.append('path').attr('class', 'wick down');

    this.#pathLastBodysUp = wrapper.append('path').attr('class', 'body up');
    this.#pathLastBodyDown = wrapper.append('path').attr('class', 'body down');
    this.#pathLastWickUp = wrapper.append('path').attr('class', 'wick up');
    this.#pathLastWickDown = wrapper.append('path').attr('class', 'wick down');
  };

  public draw = async ({
    candles: givenCandles, resizeData, zoomTransform, chartType,
  }: DrawData): Promise<void> => {
    if (!givenCandles.length) return;

    let candles: api.FuturesChartCandle[];
    if (chartType === 'heikin_ashi') {
      candles = await Plot.candlesToHeikinAshi(givenCandles);
    } else if (chartType === 'heikin_ashi_actual_price') {
      candles = await Plot.candlesToHeikinAshiWithActualPrice(givenCandles);
    } else {
      candles = givenCandles;
    }

    const firstCandles = candles.slice(0, -1);
    const lastCandle = candles[candles.length - 1];
    const yDomain = this.#scales.y.domain() as [number, number];

    // update last candle
    const upLastCandles = lastCandle?.direction === 'UP' ? [lastCandle] : [];
    const downLastCandles = lastCandle?.direction === 'DOWN' ? [lastCandle] : [];

    this.#pathLastBodysUp?.attr('d', this.#getBodies(upLastCandles, 'UP'));
    this.#pathLastWickUp?.attr('d', this.#getWicks(upLastCandles));
    this.#pathLastBodyDown?.attr('d', this.#getBodies(downLastCandles, 'DOWN'));
    this.#pathLastWickDown?.attr('d', this.#getWicks(downLastCandles));

    // update rest if zoom or last candle was changed
    if (
      resizeData.width !== this.#resizeData?.width
      || lastCandle?.time !== this.#lastCandle?.time
      || lastCandle?.interval !== this.#lastCandle?.interval
      || lastCandle?.symbol !== this.#lastCandle?.symbol
      || this.#zoomTransform !== zoomTransform
      || this.#chartType !== chartType
      // fixes https://trello.com/c/MOY6UwuT/208-chart-chart-not-resizing-when-price-goes-beyond-extreme
      || !isEqual(yDomain, this.#yDomain)
    ) {
      const upCandles = firstCandles.filter((x) => x.direction === 'UP');
      const downCandles = firstCandles.filter((x) => x.direction === 'DOWN');

      this.#pathBodiesUp?.attr('d', this.#getBodies(upCandles, 'UP'));
      this.#pathWicksUp?.attr('d', this.#getWicks(upCandles));
      this.#pathBodiesDown?.attr('d', this.#getBodies(downCandles, 'DOWN'));
      this.#pathWicksDown?.attr('d', this.#getWicks(downCandles));

      this.#yDomain = yDomain;
    }

    this.#lastCandle = lastCandle;
    this.#zoomTransform = zoomTransform;
    this.#chartType = chartType;
    this.#resizeData = resizeData;
  };

  #getBodies = (candles: api.FuturesChartCandle[], direction: 'UP' | 'DOWN'): string => {
    const width = this.bodyWidth;
    let string = '';

    for (const candle of candles) {
      string += this.#getBodyString(candle, direction, width);
    }
    return string;
  };

  #getBodyString = (candle: api.FuturesChartCandle, direction: 'UP' | 'DOWN', width: number): string => {
    const open = Math.round(this.#scales.y(candle.open));
    const close = Math.round(this.#scales.y(candle.close));
    let top;
    let bottom;

    if (direction === 'UP') {
      bottom = open;
      top = close;
    } else {
      bottom = close;
      top = open;
    }

    const height = top - bottom;
    const x = Math.round(this.#scales.scaledX(candle.time)) - width / 2;
    const y = top;

    return `M${x},${y} h${width}v${-height}h${-width}z`;
  };

  #getWicks = (candles: api.FuturesChartCandle[]): string => {
    let string = '';
    for (const candle of candles) {
      string += this.#getWickString(candle);
    }
    return string;
  };

  #getWickString = (candle: api.FuturesChartCandle): string => {
    const x = Math.round(this.#scales.scaledX(candle.time));
    const y1 = Math.round(this.#scales.y(candle.high));
    const y2 = Math.round(this.#scales.y(candle.low));

    return `M${x},${y1} v${y2 - y1}`;
  };

  public update = (data: { scales?: Scales }): void => {
    if (typeof data.scales !== 'undefined') {
      this.#scales = data.scales;
    }
  };

  private get bodyWidth() {
    const scale = this.zoomScale;

    // Clamp width on high zoom out levels

    const width = (scale < 0.3) ? 1 // eslint-disable-line no-nested-ternary
      : (scale < 0.8) ? 1.5 // eslint-disable-line no-nested-ternary
        : (scale < 1.5) ? 2 // eslint-disable-line no-nested-ternary
          : (scale < 3.0) ? 3 // eslint-disable-line no-nested-ternary
            : scale;

    return width;
  }

  private get zoomScale() {
    return this.#wrapper ? d3.zoomTransform(this.#wrapper.node() as Element).k : 1;
  }

  // This is a copy-pasted smoozCandles function from Biduul
  // see https://github.com/Altamoon/altamoon/blob/65c6b2b5d56462c2e01046efe0ca96c00dc61a20/app/lib/CandlestickChart/items/Plot.ts#L174-L233
  private static candlesToHeikinAshiWithActualPrice = thread((
    candles: api.FuturesChartCandle[],
  ): api.FuturesChartCandle[] => {
    const newCandles: api.FuturesChartCandle[] = [];

    for (let i = 0; i < candles.length; i += 1) {
      const {
        open, close, high, low,
      } = candles[i];
      const previous = newCandles[i - 1] as api.FuturesChartCandle | undefined;

      let newOpen = previous
        ? (+previous.open + +previous.close) / 2
        : (+open + +close) / 2;
      let newClose = (+open + +close + +high + +low) / 4;

      const newDirection = (newOpen <= newClose)
        ? 'UP' : 'DOWN';

      // Clamp new open to low/high
      newOpen = (newDirection === 'UP')
        ? Math.max(newOpen, +low)
        : Math.min(newOpen, +high);

      // Keep last candle close as vanilla (to visually keep track of price)
      if (i === candles.length - 1) {
        newClose = +close;
      }

      newCandles.push(Object.assign({}, candles[i], {
        direction: newDirection,
        open: newOpen,
        close: newClose,
      }));

      // Adjust close/open of previous candle, we don't want gaps
      if (previous) {
        if (newDirection === previous.direction) {
          previous.close = (previous.direction === 'UP')
            ? Math.max(previous.close, newOpen)
            : Math.min(previous.close, newOpen);
        } else {
          previous.open = (previous.direction === 'DOWN')
            ? Math.max(previous.open, newOpen)
            : Math.min(previous.open, newOpen);
        }
      }
    }

    return newCandles;
  });

  private static candlesToHeikinAshi = thread((candles: api.FuturesChartCandle[]) => {
    const newCandles: api.FuturesChartCandle[] = [];
    for (let i = 0; i < candles.length; i += 1) {
      const {
        open, close, high, low,
      } = candles[i];
      const previous = newCandles[i - 1] as api.FuturesChartCandle | undefined;

      const newClose = (+open + +close + +high + +low) / 4;
      const newOpen = previous
        ? (+previous.open + +previous.close) / 2
        : (+open + +close) / 2;
      const newHigh = Math.max(high, newOpen, newClose);
      const newLow = Math.min(low, newOpen, newClose);

      newCandles[i] = Object.assign({}, candles[i], {
        close: newClose,
        open: newOpen,
        high: newHigh,
        low: newLow,
        direction: +newOpen <= +newClose ? 'UP' : 'DOWN',
      });
    }

    return newCandles;
  });
}
