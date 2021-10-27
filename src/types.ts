export type ChartType = 'candlestick' | 'heikin_ashi' | 'heikin_ashi_actual_price';
export type SortBy = 'none' | 'alphabetically' | 'volume' | 'volume_change';
export type SortDirection = 1 | -1;

export interface AlertLogItem {
  type: 'PRICE_UP' | 'PRICE_DOWN' | 'VOLUME_ANOMALY';
  symbol: string;
  price: number;
  volume: number;
  timeISO: string;
}
