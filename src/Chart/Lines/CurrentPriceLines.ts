import { ChartAxis } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class CurrentPriceLines extends PriceLines {
  constructor({ axis }: Params) {
    super({
      axis,
      items: [{ id: 'lastPrice' }],
      color: 'var(--altamoon-chart-last-price-line-color, var(--bs-info))',
      pointerEventsNone: true,
    });
  }

  public updatePrice(lastPrice: number): void {
    if (this.getItems()[0].yValue !== lastPrice) {
      this.updateItem('lastPrice', {
        yValue: lastPrice,
      });
    }
  }
}
