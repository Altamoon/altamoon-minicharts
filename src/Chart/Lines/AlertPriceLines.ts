import * as d3 from 'd3';
import moment from 'moment';
import { listenChange } from 'use-change';
import * as api from 'altamoon-binance-api';

import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';
import { AlertLogItem } from '../../types';

interface Params {
  axis: ChartAxis;
  symbol: string;
  realTimeCandles: Record<string, api.FuturesChartCandle[]>;
  triggerAlert: (type: AlertLogItem['type'], symbol: string) => void;
  onUpdateAlerts: (d: number[]) => void;
}

interface CustomData {
  triggerTime?: number;
}

interface AlertLinesDatum extends PriceLinesDatum {
  customData: CustomData;
}

moment.relativeTimeThreshold('ss', 0);

// https://icons.getbootstrap.com/icons/bell-fill/
const bellIconStr = `<svg style="transform: scale(0.7) translate(0, -3px);" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
</svg>`;

export default class AlertPriceLines extends PriceLines {
  private static createAlertLine = (yValue: number): AlertLinesDatum => ({
    yValue,
    title: bellIconStr,
    isDraggable: true,
    customData: {},
    color: '#828282',
    id: yValue,
  });

  #realTimePrice: number | null = null;

  #triggerAlert: Params['triggerAlert'];

  #handleUpdate: Params['onUpdateAlerts'];

  #symbol: string;

  constructor({
    axis, symbol, realTimeCandles, triggerAlert, onUpdateAlerts,
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

    this.#triggerAlert = triggerAlert;

    this.#handleUpdate = onUpdateAlerts;

    this.#symbol = symbol;

    setInterval(() => {
      const items = this.#getTriggeredItems();

      if (!items.length) return;

      const now = Date.now();

      for (const item of items) {
        const { triggerTime } = item.customData;
        const index = this.getItems().indexOf(item);
        if (triggerTime) {
          if (triggerTime < now - 2 * 60 * 60_000) {
            this.removeItem(index);
          } else {
            const diff = Date.now() - triggerTime;
            let msec = diff;
            const hh = Math.floor(msec / 1000 / 60 / 60);
            msec -= hh * 1000 * 60 * 60;
            const mm = Math.floor(msec / 1000 / 60);
            msec -= mm * 1000 * 60;
            const ss = Math.floor(msec / 1000);
            msec -= ss * 1000;

            this.updateItem(index, {
              title: `<span class="triggered-alert-indicator">${bellIconStr}</span> ${hh ? `${hh}h ` : ''}${mm ? `${mm}m ` : ''}${ss}s ago`,
            });
          }
        }
      }
    }, 1000);

    listenChange(realTimeCandles, symbol, this.#checkAlerts);
  }

  #checkAlerts = (realTimeCandles: api.FuturesChartCandle[]): void => {
    const realTimePrice = realTimeCandles[realTimeCandles.length - 1]?.close ?? 0;
    const previousPrice = this.#realTimePrice;
    const items = this.getItems();
    const triggerAlert = (datum: AlertLinesDatum, type: AlertLogItem['type']) => {
      if (datum.customData.triggerTime) return;

      // update alert item on the chart
      this.updateItem(this.getItems().indexOf(datum), {
        isDraggable: false,
        customData: { triggerTime: Date.now() },
      });

      // save updated list of alerts
      this.#triggerUpdate();

      // play sound and create log entry
      this.#triggerAlert(type, this.#symbol);
    };

    if (realTimePrice && previousPrice) {
      const up = items.find(
        ({ yValue }) => yValue && realTimePrice >= yValue && previousPrice < yValue,
      );
      const down = items.find(
        ({ yValue }) => yValue && realTimePrice <= yValue && previousPrice > yValue,
      );
      if (up) {
        triggerAlert(up, 'PRICE_UP');
      } else if (down) {
        triggerAlert(down, 'PRICE_DOWN');
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

  #getActualItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !customData.triggerTime);

  #getTriggeredItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !!customData.triggerTime);
}
