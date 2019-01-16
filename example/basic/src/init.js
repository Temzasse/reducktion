import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import logger from 'redux-logger';
import thunk from 'redux-thunk';
import { initModels } from 'reducktion'; // eslint-disable-line

import userModel from './components/user/user.model';
import orderModel from './components/order/order.model';
import settingsModel from './components/settings/settings.model';

const models = initModels([userModel, orderModel, settingsModel]);
const rootReducer = combineReducers(models.allReducers);

/*
Or in a more manual way:

const { user, order, settings } = initModels([
  userModel,
  orderModel,
  settingsModel,
]);

const rootReducer = combineReducers({
  [user.name]: user.getReducer(),
  [order.name]: order.getReducer(),
  [settings.name]: settings.getReducer(),
});
*/

// Start all sagas
function* rootSaga() {
  yield all(models.allSagas);
  // yield all([...models.user.getSagas(), ...models.order.getSagas()]);
}

const sagaMiddleware = createSagaMiddleware();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const enhancer = composeEnhancers(
  applyMiddleware(sagaMiddleware, thunk, logger)
);

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, enhancer);

  // then run the saga
  sagaMiddleware.run(rootSaga);

  return store;
}
