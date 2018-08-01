import { createStore, applyMiddleware, combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { createDucks } from 'reducktion'; // eslint-disable-line

import userDucks from './components/user/user.ducks';
import orderDucks from './components/order/order.ducks';
import settingsDucks from './components/settings/settings.ducks';

/*
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
*/

const ducks = createDucks([userDucks, orderDucks, settingsDucks]);

const rootReducer = combineReducers(ducks.allReducers);

// Start all sagas
function* rootSaga() {
  yield all(ducks.allSagas);
  // yield all([...ducks.user.getSagas(), ...ducks.order.getSagas()]);
}

const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware, thunk, logger);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  // then run the saga
  sagaMiddleware.run(rootSaga);

  return store;
}
