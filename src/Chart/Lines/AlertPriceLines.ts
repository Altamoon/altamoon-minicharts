import * as d3 from 'd3';
import moment from 'moment';
import { listenChange } from 'use-change';

import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';
import { alertUpUri, alertDownUri } from './alertSounds';

interface Params {
  axis: ChartAxis;
  symbol: string;
  realTimePrices: Record<string, number>;
  onUpdateAlerts: (d: number[]) => void;
}

interface CustomData {
  triggerTime?: number;
}

interface AlertLinesDatum extends PriceLinesDatum {
  customData: CustomData;
}

moment.relativeTimeThreshold('ss', 0);

const upSound = new Audio(alertUpUri);
const downSound = new Audio(alertDownUri);

export default class AlertPriceLines extends PriceLines {
  private static readonly color = '#828282';

  private static createAlertLine = (yValue: number): AlertLinesDatum => ({
    yValue,
    title: 'Alert',
    isDraggable: true,
    customData: {},
    color: this.color,
    id: yValue,
  });

  #realTimePrice: number | null = null;

  #handleUpdate: Params['onUpdateAlerts'];

  constructor({
    axis, symbol, realTimePrices, onUpdateAlerts,
  }: Params) {
    super({
      axis,
      items: [],
      isTitleVisible: true,

      lineStyle: 'dashed',
      onDragEnd: () => this.#triggerUpdate(),
      onAdd: () => this.#triggerUpdate(),
      onRemove: () => this.#triggerUpdate(),
      onClickClose: (datum, d) => {
        this.removeItem(d.findIndex(({ yValue }) => datum.yValue === yValue));
      },
    });

    this.#handleUpdate = onUpdateAlerts;

    setInterval(() => {
      const items = this.#getTriggeredItems();

      if (!items.length) return;

      const now = Date.now();

      for (const item of items) {
        const { triggerTime } = item.customData;
        const index = this.getItems().indexOf(item);
        if (triggerTime && triggerTime < now - 2 * 60_000) {
          this.removeItem(index);
        } else {
          this.updateItem(index, {
            title: `<span class="triggered-alert-indicator"></span> Alerted ${moment(triggerTime).fromNow()}`,
          });
        }
      }
    }, 1000);

    listenChange(realTimePrices, symbol, this.#checkAlerts);
  }

  #checkAlerts = (realTimePrice: number): void => {
    const previousPrice = this.#realTimePrice;
    const items = this.getItems();

    if (realTimePrice && previousPrice) {
      const up = items.find(
        ({ yValue }) => yValue && realTimePrice >= yValue && previousPrice < yValue,
      );
      const down = items.find(
        ({ yValue }) => yValue && realTimePrice <= yValue && previousPrice > yValue,
      );
      if (up) {
        this.#triggerAlert(up, 'up');
      } else if (down) {
        this.#triggerAlert(down, 'down');
      }
    }

    this.#realTimePrice = realTimePrice;
  };

  public updateAlertLines = (alerts: number[]): void => {
    this.update({
      items: [
        ...alerts.map(AlertPriceLines.createAlertLine),
        ...this.#getTriggeredItems(),
      ],
    });
  };

  public appendTo = (
    parent: Element,
    resizeData: ResizeData,
    { wrapperCSSStyle }: { wrapperCSSStyle?: Partial<CSSStyleDeclaration> } = {},
  ): void => {
    super.appendTo(parent, resizeData, { wrapperCSSStyle });
    this.eventsArea?.on('contextmenu', this.#onRightClick);
  };

  public getItems(): AlertLinesDatum[] {
    return super.getItems() as AlertLinesDatum[];
  }

  #triggerUpdate = (): void => {
    this.#handleUpdate(this.#getActualItems().map(({ yValue }) => yValue ?? -1));
  };

  #onRightClick = (evt: MouseEvent): void => {
    evt.stopPropagation();
    evt.preventDefault();

    const coords = d3.pointer(evt);

    this.addItem(AlertPriceLines.createAlertLine(this.invertY(coords[1])));
  };

  #triggerAlert = (datum: AlertLinesDatum, direction: 'up' | 'down'): void => {
    if (datum.customData.triggerTime) return;

    const sound = direction === 'up' ? upSound : downSound;

    void sound.play();

    this.updateItem(this.getItems().indexOf(datum), {
      isDraggable: false,
      customData: { triggerTime: Date.now() },
    });

    this.#triggerUpdate();
  };

  #getActualItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !customData.triggerTime);

  #getTriggeredItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !!customData.triggerTime);
}
