import * as d3 from 'd3';
import * as api from 'altamoon-binance-api';
import { times } from 'lodash';
import {
  D3Selection, ResizeData, Scales,
} from './types';

export default class Axes {
  #x: d3.Axis<d3.NumberValue>;

  #yRight: d3.Axis<d3.NumberValue>;

  #gX?: D3Selection<SVGGElement>;

  #gYRight?: D3Selection<SVGGElement>;

  #scales: Scales;

  #candles: api.FuturesChartCandle[] = [];

  #pricePrecision = 1;

  #usePercentageScale = false;

  constructor({ scales }: { scales: Scales; }) {
    this.#x = d3.axisBottom(scales.x);

    this.#yRight = d3.axisRight(scales.y);

    this.#scales = scales;
  }

  public getAxis = (): {
    x: d3.Axis<d3.NumberValue>;
    yRight: d3.Axis<d3.NumberValue>;
  } => ({
    x: this.#x,
    yRight: this.#yRight,
  });

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    const container = d3.select(parent);

    this.#gX = container.append('g').attr('class', 'x axis bottom').attr('fill', 'currentColor');

    this.#gYRight = container.append('g').attr('class', 'y axis right').attr('fill', 'currentColor');
    this.#resizeContainers(resizeData);
  };

  public draw({ height, width }: ResizeData): void {
    this.#gX?.call(this.#x.ticks(Math.round(width / 50)));
    let ticksNum: number;

    if (height > 250) {
      ticksNum = 10;
    } else if (height > 150) {
      ticksNum = 5;
    } else {
      ticksNum = 3;
    }

    const yDomain = this.#getYDomain();

    const ticks = times(ticksNum + 1, (index) => {
      const diff = yDomain[1] - yDomain[0];

      return (diff / ticksNum) * index + yDomain[0];
    });

    this.#gYRight?.call(
      this.#yRight.tickValues(ticks),
    );
  }

  public resize = (resizeData: ResizeData): void => {
    const { scales } = resizeData;
    this.#x.scale(scales.x);
    this.#yRight.scale(scales.y);
    this.#resizeContainers(resizeData);
  };

  public update = (data: {
    pricePrecision?: number,
    scales?: Scales,
    candles?: api.FuturesChartCandle[];
    usePercentageScale?: boolean;
  }): void => {
    if (typeof data.candles !== 'undefined') this.#candles = data.candles;
    if (typeof data.pricePrecision !== 'undefined') this.#pricePrecision = data.pricePrecision;
    if (typeof data.usePercentageScale !== 'undefined') this.#usePercentageScale = data.usePercentageScale;

    if (typeof data.pricePrecision !== 'undefined' || typeof data.candles !== 'undefined' || typeof data.usePercentageScale !== 'undefined') {
      this.#yRight.tickFormat(!this.#usePercentageScale ? d3.format(`.${this.#pricePrecision}f`) : (yValue) => {
        const yDomain = this.#getYDomain();

        return yDomain[0] ? `${(((+yValue - yDomain[0]) / yDomain[0]) * 100).toFixed(1)}%` : '0';

        // return `${(((+yValue - yDomain[0]) / (yDomain[1] - yDomain[0])) * 100).toFixed(1)}%`;
      });
    }
    if (typeof data.scales !== 'undefined') {
      this.#scales = data.scales;
      this.#x.scale(data.scales.scaledX);
    }
  };

  #getYDomain = () => {
    const xDomain = this.#scales.scaledX.domain();
    const candles = this.#candles.filter((candle) => candle.time >= xDomain[0].getTime()
      && candle.time <= xDomain[1].getTime());

    const yDomain: [number, number] = candles.length
      ? [d3.min(candles, (d) => +d.low) as number, d3.max(candles, (d) => +d.high) as number]
      : [0, 1];

    return yDomain;
  };

  #resizeContainers = ({ width, height }: ResizeData): void => {
    this.#gX?.attr('transform', `translate(0,${height})`);
    this.#gYRight?.attr('transform', `translate(${width},0)`);
  };
}
