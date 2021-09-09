import React from 'react';
import { render } from 'react-dom';
import $ from 'balajs';
import { Provider } from 'use-change';

import MinichartGrid from './MinichartGrid';
import store from './store';

interface Options {
  onSymbolSelect?: (symbol: string) => void;
}

export default function minichartGrid(
  givenElement: string | HTMLElement | HTMLElement[],
  { onSymbolSelect }: Options = {},
): void {
  const element = $.one(givenElement);

  if (!element) throw new Error('Element is not found');

  render((
    <Provider value={store}>
      <MinichartGrid onSymbolSelect={onSymbolSelect} />
    </Provider>
  ), element);
}
