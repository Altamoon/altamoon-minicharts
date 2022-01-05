export type ChartType = 'candlestick' | 'heikin_ashi' | 'heikin_ashi_actual_price';
export type SortBy = 'alphabetically' | 'volume' | 'volume_change';
export type SortDirection = 1 | -1;
export type ScaleType = 'log' | 'linear';
export type AlertType = 'ALERT_UP' | 'ALERT_DOWN' | 'VOLUME_ANOMALY';

export interface AlertLogItem {
  type: AlertType;
  symbol: string;
  price: number;
  volume: number;
  timeISO: string;
}

export interface AlertItem {
  price: number;
  triggeredTimeISO: string | null;
}
