import { takeEvery, put } from 'redux-saga/effects';
import { createModel } from 'reducktion';

const model = createModel(
  'order',
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED'],
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
  .inject('user')
  .reducer(({ types, user }) => ({
    [types.FETCH_ORDERS]: state => ({ ...state, isLoading: true }),
    [types.FETCH_ORDERS_FAILED]: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    [types.RECEIVE_ORDERS]: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
    [user.types.LOGIN]: state => ({ ...state, isLoading: true }),
  }))
  .actions(({ types }) => ({
    fetchOrders: types.FETCH_ORDERS,
    failFetchOrders: types.FETCH_ORDERS_FAILED,
    setOrders: types.RECEIVE_ORDERS,
  }))
  .selectors(({ name }) => ({
    getCustomSelector: state => [...state[name].orders, 'lol'],
    getOrders: state => state[name].orders,
  }))
  .operations(({ types, user }) => [
    takeEvery([types.FETCH_ORDERS], fetchOrdersSaga),
    takeEvery([user.types.LOGIN], reactToLoginSaga, { user }),
  ])

  .create();

// Sagas ---------------------------------------------------------------------

function* fetchOrdersSaga() {
  console.log('> fetch orders');

  yield put(
    model.actions.receiveOrders([
      { id: 1, name: 'Mock order 1' },
      { id: 2, name: 'Mock order 2' },
      { id: 3, name: 'Mock order 3' },
      { id: 4, name: 'Mock order 4' },
    ])
  );

  /* Or use manually defined actions that does the same thing as `receiveOrders`
  yield put(
    model.actions.setOrders([
      { id: 1, name: 'Mock order 1' },
      { id: 2, name: 'Mock order 2' },
      { id: 3, name: 'Mock order 3' },
      { id: 4, name: 'Mock order 4' },
    ])
  );
  */
}

function* reactToLoginSaga({ user }, action) {
  console.log('> react to login', user, action);
  yield put(model.actions.fetchOrders());
  yield put(user.actions.setProfile());
}

export default model;
