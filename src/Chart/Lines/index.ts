import { isEmpty } from 'lodash';
import { ResizeData } from '../types';
import PriceLines from './PriceLines';
import CrosshairPriceLines from './CrosshairPriceLines';
import AlertPriceLines from './AlertPriceLines';

interface Params {
  axis: { x: d3.Axis<d3.NumberValue>; yRight: d3.Axis<d3.NumberValue>; };
  realTimePrices: Record<string, number>;
  symbol: string;
  onUpdateAlerts: (d: number[]) => void;
}

export default class Lines {
  #currentPriceLines: PriceLines;

  #crosshairPriceLines: CrosshairPriceLines;

  #alertPriceLines: AlertPriceLines;

  constructor({
    axis, symbol, realTimePrices, onUpdateAlerts,
  }: Params) {
    this.#currentPriceLines = new PriceLines({
      axis,
      items: [{ id: 'lastPrice' }],
      color: 'var(--biduul-chart-last-price-line-color, var(--bs-info))',
      pointerEventsNone: true,
    });

    this.#crosshairPriceLines = new CrosshairPriceLines({ axis });

    this.#alertPriceLines = new AlertPriceLines({
      axis,
      realTimePrices,
      symbol,
      onUpdateAlerts,
    });
  }

  update(data: {
    pricePrecision?: number; lastPrice?: number; alerts?: number[];
  } = {}): void {
    if (typeof data.pricePrecision !== 'undefined') {
      this.#currentPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#crosshairPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#alertPriceLines.update({ pricePrecision: data.pricePrecision });
    }

    if (typeof data.lastPrice !== 'undefined') {
      this.#currentPriceLines.updateItem('lastPrice', {
        yValue: data.lastPrice,
      });
    }

    if (typeof data.alerts !== 'undefined') {
      this.#alertPriceLines.updateAlertLines(data.alerts);
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
    this.#crosshairPriceLines.appendTo(parent, resizeData);
    this.#alertPriceLines.appendTo(parent, resizeData);
  }

  public resize = (resizeData: ResizeData): void => {
    this.#currentPriceLines.resize(resizeData);
    this.#crosshairPriceLines.resize(resizeData);
    this.#alertPriceLines.resize(resizeData);
  };
}
