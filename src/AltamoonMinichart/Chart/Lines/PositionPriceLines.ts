import { TradingPosition } from 'altamoon-types';
import { ChartAxis } from '../types';
import PriceLines from './PriceLines';

interface Params {
  axis: ChartAxis;
}

export default class PositionPriceLines extends PriceLines {
  constructor({ axis }: Params) {
    super({
      axis,
      items: [{
        id: 'liquidation', isVisible: false, title: 'Pos. liquidation', isTitleVisible: 'hover', color: 'var(--bs-red)',
      }, {
        id: 'position', isVisible: false,
      }],
      isBackgroundFill: true,
      isTitleVisible: true,
    });
  }

  public updatePositionLine = (position: TradingPosition | null): void => {
    if (position === null) {
      this.updateItem('position', { isVisible: false });
      this.updateItem('liquidation', { isVisible: false });
    } else {
      this.updateItem('position', {
        isVisible: true,
        yValue: position.entryPrice,
        // eslint-disable-next-line no-nested-ternary
        color: position.isClosed ? 'var(--bs-gray)' : (position.side === 'BUY' ? '#30b332' : '#ab257c'),
        title: `${position.positionAmt} ${position.baseAsset}`,
        opacity: position.isClosed ? 0.8 : 1,
      });

      this.updateItem('liquidation', {
        isVisible: true,
        yValue: position.liquidationPrice,
      });
    }
  };
}
