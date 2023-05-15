import { type FlowchartData } from './types';
import * as actions from './actions';
import * as selectors from './selectors';
import * as hooks from './hooks';

export type State = FlowchartData;
export { actions, selectors, hooks };
export { emptyFlowchartData } from './base';
export * from './StoreProvider';

export const emptyArray = [];
