import * as d3 from 'd3';
import { D3Selection, ResizeData } from './types';

export default class ClipPath {
  #clipChart?: D3Selection<SVGRectElement>;

  #plotMouseEventsArea?: D3Selection<SVGRectElement>;

  public appendTo = (parent: Element, resizeData: ResizeData): void => {
    this.#clipChart = d3.select(parent).append('clipPath').attr('id', 'minichartClipChart').append('rect');

    this.#plotMouseEventsArea = d3.select(parent).append('rect')
      .attr('clip-path', 'url(#minichartClipChart)')
      .attr('id', 'minichartMouseEventsArea')
      .attr('fill', 'transparent');

    this.resize(resizeData);
  };

  public resize = ({ width, height }: ResizeData): void => {
    this.#clipChart?.attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);

    this.#plotMouseEventsArea?.attr('x', 0)
      .attr('y', 0)
      .attr('width', width)
      .attr('height', height);
  };
}
