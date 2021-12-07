import * as d3 from 'd3';
import { D3Selection, ResizeData, Scales } from './types';

export default class GridLines {
  #x: d3.Axis<Date | d3.NumberValue>;

  #y: (g: D3Selection<SVGGElement>) => D3Selection<SVGGElement>;

  #width = 0;

  #height = 0;

  #xWrapper?: D3Selection<SVGGElement>;

  #yWrapper?: D3Selection<SVGGElement>;

  constructor({ scales }: { scales: Scales }) {
    this.#x = d3.axisTop(scales.x).tickFormat(() => '');

    this.#y = (g: D3Selection<SVGGElement>) => g.call(d3.axisLeft(scales.y)
      .tickFormat(() => '')
      .tickSize(-this.#width)
      .tickValues(d3.scaleLinear().domain(scales.y.domain()).ticks(this.#height / 80)));
  }

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    const container = d3.select(parent);
    this.#xWrapper = container.append('g').attr('class', 'x gridlines');
    this.#yWrapper = container.append('g').attr('class', 'y gridlines');
    this.resize(resizeData);
  };

  public resize = ({ width, height }: ResizeData): void => {
    this.#width = width;
    this.#height = height;

    this.#x.tickSize(-height).ticks(width / 50);
  };

  public draw(resizeData: ResizeData): void {
    this.#xWrapper?.call(this.#x);
    this.#yWrapper?.call(this.#y);

    this.resize(resizeData);
  }

  public update = (data: { scales: Scales }): void => {
    if (typeof data.scales !== 'undefined') {
      this.#x.scale(data.scales.x);
    }
  };
}
