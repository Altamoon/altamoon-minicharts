import React, {
  memo, ReactElement, useCallback, useEffect, useRef, useState,
} from 'react';
import { useInView } from 'react-intersection-observer';
import * as api from 'altamoon-binance-api';
import { TradingOrder, TradingPosition } from 'altamoon-types';

import Chart from './Chart';
import { AlertItem, ChartType, ScaleType } from './types';

interface Props {
  candles: api.FuturesChartCandle[];
  height: string;
  chartType: ChartType;
  scaleType: ScaleType;
  pricePrecision: number;
  alerts: AlertItem[];
  orders?: TradingOrder[] | null;
  position?: TradingPosition | null;
  leverageBrackets?: api.FuturesLeverageBracket[];
  usePercentageScale?: boolean;
  onUpdateAlerts: (d: AlertItem[]) => void;
}

const MinichartBody = ({
  candles,
  height,
  chartType,
  scaleType,
  pricePrecision,
  alerts,
  orders,
  position,
  leverageBrackets,
  usePercentageScale,
  onUpdateAlerts,
}: Props): ReactElement | null => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [chartInstance, setChartInstance] = useState<Chart | null>(null);
  const [inViewRef, inView] = useInView();

  const setRefs = useCallback(
    (node: HTMLDivElement) => {
      ref.current = node;
      inViewRef(node);
    },
    [inViewRef],
  );

  useEffect(() => {
    if (inView) chartInstance?.update({ candles: candles || [] });
  }, [candles, chartInstance, inView]);
  useEffect(() => {
    if (inView) chartInstance?.update({ pricePrecision });
  }, [chartInstance, inView, pricePrecision]);
  useEffect(() => {
    if (inView) chartInstance?.update({ chartType });
  }, [chartInstance, chartType, inView]);
  useEffect(() => {
    if (inView) chartInstance?.update({ orders });
  }, [chartInstance, inView, orders, scaleType]);
  useEffect(() => {
    if (inView) chartInstance?.update({ position });
  }, [chartInstance, inView, position, scaleType]);
  useEffect(() => {
    if (inView) chartInstance?.update({ alerts });
  }, [chartInstance, alerts, scaleType, inView]);
  useEffect(() => {
    if (inView) chartInstance?.update({ leverageBrackets });
  }, [chartInstance, inView, leverageBrackets, scaleType]);
  useEffect(() => {
    if (inView) chartInstance?.update({ scaleType });
  }, [chartInstance, inView, scaleType]);
  useEffect(() => {
    if (inView) chartInstance?.update({ usePercentageScale });
  }, [chartInstance, inView, usePercentageScale]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !chartInstance) {
      const instance = new Chart(ref.current, {
        scaleType,
        onUpdateAlerts,
      });

      if (inView) {
        instance.update({
          candles,
          chartType,
          alerts,
        });
      }

      setChartInstance(instance);
    }
  });

  return (
    <div style={{ height }} ref={setRefs} />
  );
};

export default memo(MinichartBody);
