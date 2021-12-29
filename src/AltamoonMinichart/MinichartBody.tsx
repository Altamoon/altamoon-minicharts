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
  useEffect(() => { chartInstance?.update({ pricePrecision }); }, [chartInstance, pricePrecision]);
  useEffect(() => { chartInstance?.update({ chartType }); }, [chartInstance, chartType]);
  useEffect(() => { chartInstance?.update({ orders }); }, [chartInstance, orders, scaleType]);
  useEffect(() => { chartInstance?.update({ position }); }, [chartInstance, position, scaleType]);
  useEffect(() => { chartInstance?.update({ alerts }); }, [chartInstance, alerts, scaleType]);
  useEffect(() => {
    chartInstance?.update({ leverageBrackets });
  }, [chartInstance, leverageBrackets, scaleType]);
  useEffect(() => { chartInstance?.update({ scaleType }); }, [chartInstance, scaleType]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (ref.current && !chartInstance) {
      const instance = new Chart(ref.current, {
        scaleType,
        onUpdateAlerts,
      });

      instance.update({
        candles,
        chartType,
        alerts,
      });

      setChartInstance(instance);
    }
  });

  return (
    <div style={{ height }} ref={setRefs} />
  );
};

export default memo(MinichartBody);
