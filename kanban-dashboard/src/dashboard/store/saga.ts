import {
  spawn,
  takeEvery,
  call,
  select,
  type SelectEffect,
  type CallEffect,
} from "redux-saga/effects";

import { actionTypes } from "./base";
import { type FlowchartData, type UpdateFlowchartData } from "./types";

export function makeSaga(updateFlowchartData: UpdateFlowchartData) {
  function* rootSaga() {
    yield spawn(watchModelActions);
  }

  function* watchModelActions() {
    for (const actionType of Object.values(actionTypes)) {
      yield takeEvery(actionType, handleModelAction);
    }
  }

  function* handleModelAction(): Generator<SelectEffect | CallEffect<void>> {
    const projectData = yield select();
    yield call(async (p) => updateFlowchartData(p as FlowchartData), projectData);
  }

  return rootSaga;
}
