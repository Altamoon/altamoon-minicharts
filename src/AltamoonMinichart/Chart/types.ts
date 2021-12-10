import * as d3 from 'd3';
import * as api from 'altamoon-binance-api';
import { ChartType } from '../types';

export type D3Selection<T extends d3.BaseType, C extends d3.BaseType = null>
  = d3.Selection<T, unknown, C, unknown>;

export interface Scales {
  x: d3.ScaleTime<number, number, never>;
  scaledX: d3.ScaleTime<number, number, never>;
  y: d3.ScaleLinear<number, number, never> | d3.ScaleSymLog<number, number, never>;
}

export interface StyleMargin {
  top: number; right: number; bottom: number; left: number;
}

export interface ResizeData {
  width: number;
  height: number;
  margin: StyleMargin;
  scales: Scales;
}

export interface ChartAxis {
  x: d3.Axis<d3.NumberValue>;
  yRight: d3.Axis<d3.NumberValue>;
}

export interface PriceLinesDatum<T = unknown> {
  xValue?: Date;
  yValue?: number;
  title?: string | ((element: HTMLElement) => void);
  color?: string;
  opacity?: number;
  id: string | number;
  isVisible?: boolean;
  isDraggable?: boolean;
  isCheckable?: boolean; // non-dynamic so far
  isClosable?: boolean; // non-dynamic so far
  isHovered?: boolean;
  isTitleVisible?: boolean | 'hover';
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  customData?: T;
  pointerEventsNone?: boolean;
}

export interface DrawData {
  candles: api.FuturesChartCandle[];
  zoomTransform: Pick<d3.ZoomTransform, 'x' | 'y' | 'k'>;
  resizeData: ResizeData;
  chartType: ChartType;
}
