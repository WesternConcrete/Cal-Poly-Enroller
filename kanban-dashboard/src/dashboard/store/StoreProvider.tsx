import React, { type ReactNode } from 'react';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';

import { type FlowchartData, type UpdateFlowchartData } from './types';
import { reducer, emptyFlowchartData } from './base';
import { makeSaga } from './saga';

export interface StoreProviderProps {
  children: ReactNode,
  updateFlowchartData: UpdateFlowchartData,
  state?: FlowchartData,
}

export function StoreProvider({
  children,
  updateFlowchartData,
  state = emptyFlowchartData,
}: StoreProviderProps) {
  const sagaMiddleware = createSagaMiddleware();

  // @ts-ignore
  const store = createStore(
    reducer,
    state,
    composeWithDevTools(applyMiddleware(sagaMiddleware))
  );

  sagaMiddleware.run(makeSaga(updateFlowchartData));

  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}
