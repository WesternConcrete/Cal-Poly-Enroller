import { spawn, takeEvery, call, select } from 'redux-saga/effects';
import { CreateAction } from 'normalized-reducer';

import { actionTypes } from './base';
import { type UpdateFlowchartData } from './types';

export function makeSaga(updateFlowchartData: UpdateFlowchartData) {
  function* rootSaga() {
    yield spawn(watchModelActions);
  }

  function* watchModelActions() {
    for (const actionType of Object.values(actionTypes)) {
      yield takeEvery(actionType, handleModelAction);
    }
  }

  function* handleModelAction() {
    const projectData = yield select();
    yield call(updateFlowchartData, projectData)
  }

  return rootSaga;
}
