import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { initDucks } from 'reducktion';

import orderDucks from './components/order/order.duck';

const ducks = initDucks([orderDucks]);
const rootReducer = combineReducers(ducks.allReducers);

// Start all sagas
function* rootSaga(): any {
  yield all(ducks.allSagas);
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
