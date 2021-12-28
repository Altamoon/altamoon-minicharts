import { isEmpty } from 'lodash';
import * as api from 'altamoon-binance-api';
import { TradingOrder, TradingPosition } from 'altamoon-types';

import { ResizeData } from '../types';
import CurrentPriceLines from './CurrentPriceLines';
import CrosshairPriceLines from './CrosshairPriceLines';
import AlertPriceLines from './AlertPriceLines';
import OrderPriceLines from './OrderPriceLines';
import PositionPriceLines from './PositionPriceLines';
import LiquidationPriceLines from './LiquidationPriceLines';
import { AlertItem } from '../../types';

interface Params {
  axis: { x: d3.Axis<d3.NumberValue>; yRight: d3.Axis<d3.NumberValue>; };
  onUpdateAlerts: (d: AlertItem[]) => void;
}

export default class Lines {
  #currentPriceLines: CurrentPriceLines;

  #crosshairPriceLines: CrosshairPriceLines;

  #alertPriceLines: AlertPriceLines;

  #orderPriceLines: OrderPriceLines;

  #positionPriceLines: PositionPriceLines;

  #liquidationPriceLines: LiquidationPriceLines;

  constructor({ axis, onUpdateAlerts }: Params) {
    this.#currentPriceLines = new CurrentPriceLines({ axis });
    this.#crosshairPriceLines = new CrosshairPriceLines({ axis });
    this.#alertPriceLines = new AlertPriceLines({
      axis,
      onUpdateAlerts,
    });
    this.#crosshairPriceLines = new CrosshairPriceLines({ axis });
    this.#orderPriceLines = new OrderPriceLines({ axis });
    this.#positionPriceLines = new PositionPriceLines({ axis });
    this.#liquidationPriceLines = new LiquidationPriceLines({ axis });
  }

  update(data: {
    pricePrecision?: number;
    lastPrice?: number;
    alerts?: AlertItem[];
    orders?: TradingOrder[] | null;
    position?: TradingPosition | null;
    leverage?: number;
    leverageBrackets?: api.FuturesLeverageBracket[];
  } = {}): void {
    if (typeof data.pricePrecision !== 'undefined') {
      this.#currentPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#crosshairPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#alertPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#orderPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#positionPriceLines.update({ pricePrecision: data.pricePrecision });
      this.#liquidationPriceLines.update({ pricePrecision: data.pricePrecision });
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

    if (
      typeof data.orders !== 'undefined'
      || typeof data.position !== 'undefined'
      || typeof data.leverage !== 'undefined'
      || typeof data.leverageBrackets !== 'undefined'
    ) {
      this.#liquidationPriceLines.updateLiquidationLines(data);
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
    this.#orderPriceLines.appendTo(parent, resizeData);
    this.#positionPriceLines.appendTo(parent, resizeData);
    this.#liquidationPriceLines.appendTo(parent, resizeData);
  }

  public resize = (resizeData: ResizeData): void => {
    this.#currentPriceLines.resize(resizeData);
    this.#crosshairPriceLines.resize(resizeData);
    this.#alertPriceLines.resize(resizeData);
    this.#orderPriceLines.resize(resizeData);
    this.#positionPriceLines.resize(resizeData);
    this.#liquidationPriceLines.resize(resizeData);
  };
}
