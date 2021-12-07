import React from 'react';
import { render } from 'react-dom';
import $ from 'balajs';
import { Provider } from 'use-change';

import MinichartGrid from './Grid';
import store, { MinichartsStore } from './store';

interface Options {
  settingsContainer?: HTMLElement;
  alertLogContainer?: HTMLElement;
  onSymbolSelect?: (symbol: string) => void;
}

export { store, MinichartsStore };

export default function altamoonMinicharts(
  givenElement: string | HTMLElement | HTMLElement[],
  { settingsContainer, alertLogContainer, onSymbolSelect }: Options = {},
): void {
  const element = $.one(givenElement);

  if (!element) throw new Error('Element is not found');

  render((
    <Provider value={store}>
      <MinichartGrid
        settingsContainer={settingsContainer}
        alertLogContainer={alertLogContainer}
        onSymbolSelect={onSymbolSelect}
      />
    </Provider>
  ), element);
}
