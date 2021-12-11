import { TradingPosition, TradingOrder } from 'altamoon-types';
import * as api from 'altamoon-binance-api';

import { ChartAxis, LiquidationLineSizeItem } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class LiquidationPriceLines extends PriceLines {
  #orders: TradingOrder[] | null = null;

  #position: TradingPosition | null = null;

  #leverage = 1;

  #leverageBrackets: api.FuturesLeverageBracket[] | null = null;

  constructor({ axis }: Params) {
    super({
      axis,
      items: [{
        id: 'BUY',
        isVisible: false,
        lineStyle: 'dashed',
        title: 'Buy liquidation',
      }, {
        id: 'SELL',
        isVisible: false,
        lineStyle: 'dashed',
        title: 'Sell liquidation',
      }],
      color: 'var(--bs-red)',
      isTitleVisible: 'hover',
    });
  }

  public updateLiquidationLines = ({
    orders, position, leverageBrackets,
  }: {
    orders?: TradingOrder[] | null;
    position?: TradingPosition | null;
    leverageBrackets?: api.FuturesLeverageBracket[];
  }): void => {
    if (typeof orders !== 'undefined') {
      this.#orders = orders;
      this.#leverage = orders?.[0].leverage ?? this.#leverage;
    }
    if (typeof position !== 'undefined') {
      this.#position = position;
      this.#leverage = position?.leverage ?? this.#leverage;
    }
    if (typeof leverageBrackets !== 'undefined') this.#leverageBrackets = leverageBrackets;

    const buyValue = this.#getLiquidationPrice('BUY');
    const sellValue = this.#getLiquidationPrice('SELL');

    this.updateItem('BUY', {
      isVisible: buyValue !== null,
      yValue: buyValue === null ? 0 : buyValue,
    });

    this.updateItem('SELL', {
      isVisible: sellValue !== null,
      yValue: sellValue === null ? 0 : sellValue,
    });
  };

  #getLiquidationLinesSizes = (side: api.OrderSide): LiquidationLineSizeItem[] => {
    const sizes: LiquidationLineSizeItem[] = [];
    const position = this.#position;
    const orders = this.#orders ?? [];

    if (position?.side === side) {
      sizes.push({
        type: 'POSITION',
        side,
        price: position.entryPrice,
        amount: Math.abs(position.positionAmt),
      });
    }

    sizes.push(
      ...orders.filter((o) => o.side === side).map(({ price, origQty }) => ({
        type: 'ORDER' as const,
        side,
        price,
        amount: Math.abs(origQty),
      })),
    );

    return sizes;
  };

  // calculation code is borrowed from there https://github.com/Altamoon/altamoon/blob/no-book/js/data/liquidation.js#L41
  #getLiquidationPrice = (side: 'BUY' | 'SELL'): number | null => {
    const sizes = this.#getLiquidationLinesSizes(side);
    if (!sizes.length) return null;
    const leverage = this.#leverage;
    const leverageBrackets = this.#leverageBrackets;
    const direction = side === 'BUY' ? 1 : -1;

    sizes.sort((a, b) => (a.price > b.price ? -direction : direction));

    if (!leverageBrackets) return 0;

    const total = { margin: 0, averagePrice: 0, amount: 0 };
    let liquidation = 0;

    /**
     * Add up items one by one, (re)calculate liquidation for each,
     * stop when current item is out of last liquidation price
     * */
    for (const size of sizes) {
      if (liquidation && direction * size.price <= liquidation * direction) break;

      const weightedTotalPrice = size.price * size.amount + total.averagePrice * total.amount;
      const totalAmt = size.amount + total.amount;

      total.averagePrice = weightedTotalPrice / totalAmt;
      total.margin += (size.amount * size.price) / leverage;
      total.amount = totalAmt;

      const positionValue = direction * total.amount * total.averagePrice;

      const leverageBracket = leverageBrackets.find(
        ({ notionalCap }) => notionalCap > total.amount * total.averagePrice,
      ) ?? leverageBrackets[0];

      liquidation = (total.margin + leverageBracket?.cum - positionValue)
                      / (total.amount * (leverageBracket?.maintMarginRatio - direction));
    }

    return liquidation;
  };
}
