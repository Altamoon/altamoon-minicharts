import { isEmpty } from 'lodash';
import * as api from 'altamoon-binance-api';
import { TradingOrder, TradingPosition } from 'altamoon-types';

import { ResizeData } from '../types';
import CurrentPriceLines from './CurrentPriceLines';
import CrosshairPriceLines from './CrosshairPriceLines';
import AlertPriceLines from './AlertPriceLines';
import OrderPriceLines from './OrderPriceLines';
import PositionPriceLines from './PositionPriceLines';
import { AlertLogItem } from '../../types';

interface Params {
  axis: { x: d3.Axis<d3.NumberValue>; yRight: d3.Axis<d3.NumberValue>; };
  realTimeCandles: Record<string, api.FuturesChartCandle[]>;
  symbol: string;
  triggerAlert: (type: AlertLogItem['type'], symbol: string) => void;
  onUpdateAlerts: (d: number[]) => void;
}

export default class Lines {
  #currentPriceLines: CurrentPriceLines;

  #crosshairPriceLines: CrosshairPriceLines;

  #alertPriceLines: AlertPriceLines;

  #orderPriceLines: OrderPriceLines;

  #positionPriceLines: PositionPriceLines;

  constructor({
    axis, symbol, realTimeCandles, triggerAlert, onUpdateAlerts,
  }: Params) {
    this.#currentPriceLines = new CurrentPriceLines({ axis });

    this.#crosshairPriceLines = new CrosshairPriceLines({ axis });

    this.#alertPriceLines = new AlertPriceLines({
      axis,
      realTimeCandles,
      symbol,
      triggerAlert,
      onUpdateAlerts,
    });

    this.#crosshairPriceLines = new CrosshairPriceLines({ axis });

    this.#orderPriceLines = new OrderPriceLines({ axis });

    this.#positionPriceLines = new PositionPriceLines({ axis });
  }

  update(data: {
    pricePrecision?: number;
    lastPrice?: number;
    alerts?: number[];
    orders?: TradingOrder[];
    position?: TradingPosition;
  } = {}): void {
    if (typeof data.pricePrecision !== 'undefined') {
      this.#currentPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#crosshairPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#alertPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#orderPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#positionPriceLines.update({ pricePrecision: data.pricePrecision });
    }

    if (typeof data.lastPrice !== 'undefined') {
      this.#currentPriceLines.updatePrice(data.lastPrice);
    }

    if (typeof data.alerts !== 'undefined') {
      this.#alertPriceLines.updateAlertLines(data.alerts);
    }

    if (typeof data.orders !== 'undefined') {
      this.#orderPriceLines.updateOrderLines(data.orders);
    }

    if (typeof data.position !== 'undefined') {
      this.#positionPriceLines.updatePositionLine(data.position);
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
