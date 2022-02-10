import * as d3 from 'd3';
import * as api from 'altamoon-binance-api';
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

  public draw({ scales, height, width }: ResizeData): void {
    this.#gX?.call(this.#x.ticks(Math.round(width / 50)));

    this.#gYRight?.call(
      this.#yRight.tickValues(d3.scaleLinear().domain(scales.y.domain()).ticks(height / 40)),
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
  }): void => {
    if (typeof data.candles !== 'undefined') {
      this.#candles = data.candles;
    }

    if (typeof data.pricePrecision !== 'undefined' || typeof data.candles !== 'undefined') {
      // const tickFormat = d3.format(`.${data.pricePrecision}f`);
      this.#yRight.tickFormat((yValue) => {
        // const yDomain = this.#scales.y.domain();
        // scaledX.domain();
        const xDomain = this.#scales.scaledX.domain();
        const candles = this.#candles.filter((candle) => candle.time >= xDomain[0].getTime()
          && candle.time <= xDomain[1].getTime());

        const yDomain: [number, number] = candles.length
          ? [d3.min(candles, (d) => +d.low) as number, d3.max(candles, (d) => +d.high) as number]
          : [0, 1];

        return `${(((+yValue - yDomain[0]) / (yDomain[1] - yDomain[0])) * 100).toFixed(1)}%`;
      });
    }
    if (typeof data.scales !== 'undefined') {
      this.#scales = data.scales;
      this.#x.scale(data.scales.scaledX);
    }
  };

  #resizeContainers = ({ width, height }: ResizeData): void => {
    this.#gX?.attr('transform', `translate(0,${height})`);
    this.#gYRight?.attr('transform', `translate(${width},0)`);
  };
}
