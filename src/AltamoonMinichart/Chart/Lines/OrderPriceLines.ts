import { TradingOrder } from 'altamoon-types';
import { ChartAxis, PriceLinesDatum } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class OrderPriceLines extends PriceLines {
  // we neeed this to preserve line position when it was dragged
  // but not yet removed (not yet re-created)
  #forceOrderPrices: Record<string, number> = {};

  constructor({ axis }: Params) {
    super({
      axis,
      items: [],
      isTitleVisible: true,
      lineStyle: 'solid',
      isBackgroundFill: true,
    });
  }

  public updateOrderLines = (givenOrders: TradingOrder[] | null): void => {
    const orders = givenOrders ?? [];

    const items: PriceLinesDatum[] = [
      ...orders
        .map((order): PriceLinesDatum => {
          const {
            price, side, origQty, executedQty, symbol, type, isCanceled, clientOrderId,
          } = order;
          const color = side === 'BUY' ? 'var(--altamoon-buy-color)' : 'var(--altamoon-sell-color)';
          return ({
            isDraggable: false,
            yValue: this.#forceOrderPrices[clientOrderId] ?? price,
            isVisible: true,
            color: isCanceled ? 'var(--bs-gray)' : color,
            opacity: isCanceled ? 0.8 : 1,
            // TODO this is a potentially wrong way to retrieve
            // asset name from symbol name because of BNB/BUSD pairs
            title: `Limit ${origQty - executedQty} ${symbol.replace('USDT', '')}`,
            id: clientOrderId,
            customData: { order },
            pointerEventsNone: isCanceled,
          });
        }),
      ...orders
        .filter(({ stopPrice }) => !!stopPrice)
        .map(({ stopPrice, side, clientOrderId }): PriceLinesDatum => ({
          yValue: stopPrice,
          isVisible: true,
          color: side === 'BUY' ? 'var(--altamoon-stop-buy-color)' : 'var(--altamoon-stop-sell-color)',
          title: 'Stop price',
          id: clientOrderId,
          customData: {},
        })),
    ];

    this.update({ items });
  };
}
