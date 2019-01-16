import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { initModels } from 'reducktion';

import orderModel from './components/order/order.model';
import userModel from './components/user/user.model';

const models = initModels([orderModel, userModel]);
const rootReducer = combineReducers(models.allReducers);

// Start all sagas
function* rootSaga(): any {
  yield all(models.allSagas);
}

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = (<any>window).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(
  applyMiddleware(sagaMiddleware, thunk, logger)
);

export default function configureStore(initialState = undefined) {
  const store = createStore(rootReducer, initialState, enhancer);
  sagaMiddleware.run(rootSaga);
  return store;
}
