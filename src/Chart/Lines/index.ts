import { isEmpty } from 'lodash';
import { ResizeData } from '../types';
import PriceLines from './PriceLines';

export default class Lines {
    #currentPriceLines: PriceLines;

    constructor({ axis }: { axis: { x: d3.Axis<d3.NumberValue>;
      yRight: d3.Axis<d3.NumberValue>; } }) {
      this.#currentPriceLines = new PriceLines({
        axis,
        items: [{ id: 'currentPrice' }],
        color: '#0000ff',
        pointerEventsNone: true,
      });
    }

    update(data: { pricePrecision?: number; currentPrice?: number; } = {}): void {
      if (typeof data.pricePrecision !== 'undefined') {
        this.#currentPriceLines.update({ pricePrecision: data.pricePrecision });
      }

      if (typeof data.currentPrice !== 'undefined') {
        this.#currentPriceLines.updateItem('currentPrice', {
          yValue: data.currentPrice,
        });
      }

      if (isEmpty(data)) {
        this.#currentPriceLines.update();
      }
    }

    public appendTo(
      parent: Element,
      resizeData: ResizeData,
    ): void {
      this.#currentPriceLines.appendTo(parent, resizeData);
    }

    public resize = (resizeData: ResizeData): void => {
      this.#currentPriceLines.resize(resizeData);
    };
}
