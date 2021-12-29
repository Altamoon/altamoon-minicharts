import * as d3 from 'd3';
import { ChartAxis, PriceLinesDatum, ResizeData } from '../types';
import PriceLines from './PriceLines';
import { AlertItem } from '../../types';

interface Params {
  axis: ChartAxis;
  onUpdateAlerts: (d: AlertItem[]) => void;
}

interface AlertLinesDatum extends PriceLinesDatum {
  customData: AlertItem;
}

// https://icons.getbootstrap.com/icons/bell-fill/
const bellIconStr = `<svg style="transform: scale(0.7) translate(0, -3px);" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-bell" viewBox="0 0 16 16">
  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
</svg>`;

let counter = 0;

export default class AlertPriceLines extends PriceLines {
  private static createAlertLine = (d: AlertItem): AlertLinesDatum => ({
    yValue: d.price,
    title: d.triggeredTimeISO ? this.getTriggeredAlertTitle(d.triggeredTimeISO) : bellIconStr,
    isDraggable: !d.triggeredTimeISO,
    isTitleVisible: d.triggeredTimeISO ? true : 'hover',
    customData: d,
    color: '#828282',
    // eslint-disable-next-line no-plusplus
    id: `alert_${new Date().toISOString()}_${counter++}`,
  });

  private static getTriggeredAlertTitle = (triggeredTimeISO: string) => {
    const diff = Date.now() - new Date(triggeredTimeISO).getTime();
    let msec = diff;
    const hh = Math.floor(msec / 1000 / 60 / 60);
    msec -= hh * 1000 * 60 * 60;
    const mm = Math.floor(msec / 1000 / 60);
    msec -= mm * 1000 * 60;
    const ss = Math.floor(msec / 1000);
    msec -= ss * 1000;

    return `<span class="triggered-alert-indicator">${bellIconStr}</span> ${hh ? `${hh}h ` : ''}${mm ? `${mm}m ` : ''}${ss}s ago`;
  };

  #handleUpdate: Params['onUpdateAlerts'];

  #alertItems: AlertItem[] = [];

  constructor({ axis, onUpdateAlerts }: Params) {
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
      const items = this.getItems()
        .filter(({ customData }) => !!customData.triggeredTimeISO);

      if (!items.length) return;

      const now = Date.now();

      for (const item of items) {
        const { triggeredTimeISO } = item.customData;
        const index = this.getItems().indexOf(item);
        if (triggeredTimeISO) {
          if (new Date(triggeredTimeISO).getTime() < now - 2 * 60 * 60_000) {
            this.removeItem(index);
          } else {
            this.updateItem(index, {
              isTitleVisible: true,
              title: AlertPriceLines.getTriggeredAlertTitle(triggeredTimeISO),
            });
          }
        }
      }
    }, 1000);
  }

  public updateAlertLines = (alerts: AlertItem[]): void => {
    if (JSON.stringify(this.#alertItems) !== JSON.stringify(alerts)) {
      this.#alertItems = alerts;
      this.update({
        items: alerts.map(AlertPriceLines.createAlertLine),
      });
    }
  };

  public appendTo = (
    parent: Element,
    resizeData: ResizeData,
    { wrapperCSSStyle }: { wrapperCSSStyle?: Partial<CSSStyleDeclaration> } = {},
  ): void => {
    super.appendTo(parent, resizeData, { wrapperCSSStyle });
    this.parent?.on('contextmenu', this.#onRightClick);
  };

  public getItems(): AlertLinesDatum[] {
    return super.getItems() as AlertLinesDatum[];
  }

  #triggerUpdate = (): void => {
    const alertItems = this.getItems().map(({ yValue, customData }) => ({
      ...customData, price: yValue ?? 0,
    }));

    this.#alertItems = alertItems;
    this.#handleUpdate(alertItems);
  };

  #onRightClick = (evt: MouseEvent): void => {
    evt.stopPropagation();
    evt.preventDefault();

    const coords = d3.pointer(evt);

    this.addItem(AlertPriceLines.createAlertLine({
      price: this.invertY(coords[1]),
      triggeredTimeISO: null,
    }));
  };

  /* #getActualItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !customData.triggeredTimeISO);

  #getTriggeredItems = (): AlertLinesDatum[] => this.getItems()
    .filter(({ customData }) => !!customData.triggeredTimeISO); */
}
