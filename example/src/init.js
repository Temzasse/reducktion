import { createStore, applyMiddleware, combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { createDucks } from 'reducktion';

import userDucks from './components/user/user.ducks';
import orderDucks from './components/order/order.ducks';
import settingsDucks from './components/settings/settings.ducks';

const { user, order, settings } = createDucks([
  userDucks,
  orderDucks,
  settingsDucks,
]);

const rootReducer = combineReducers({
  [user.name]: user.getReducer(),
  [order.name]: order.getReducer(),
  [settings.name]: settings.getReducer(),
});

function* rootSaga() {
  // Start all sagas
  yield all([
    ...user.getOperations(),
    ...order.getOperations(),
  ])
}

const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware, thunk, logger);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  // then run the saga
  sagaMiddleware.run(rootSaga);

  return store;
}
