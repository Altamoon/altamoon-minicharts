import * as d3 from 'd3';
import {
  D3Selection, ResizeData, Scales,
} from './types';

export default class Axes {
  #x: d3.Axis<d3.NumberValue>;

  #yRight: d3.Axis<d3.NumberValue>;

  #gX?: D3Selection<SVGGElement>;

  #gYRight?: D3Selection<SVGGElement>;

  constructor({ scales }: { scales: Scales; }) {
    this.#x = d3.axisBottom(scales.x);

    this.#yRight = d3.axisRight(scales.y);
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
      this.#yRight.tickValues(d3.scaleLinear().domain(scales.y.domain()).ticks(height / 80)),
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
  }): void => {
    if (typeof data.pricePrecision !== 'undefined') {
      const tickFormat = d3.format(`.${data.pricePrecision}f`);
      this.#yRight.tickFormat(tickFormat);
    }
    if (typeof data.scales !== 'undefined') {
      this.#x.scale(data.scales.scaledX);
    }
  };

  #resizeContainers = ({ width, height }: ResizeData): void => {
    this.#gX?.attr('transform', `translate(0,${height})`);
    this.#gYRight?.attr('transform', `translate(${width},0)`);
  };
}
