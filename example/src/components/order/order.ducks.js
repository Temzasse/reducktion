import { takeEvery, put } from 'redux-saga/effects';
import { createModel } from 'reducktion'; // eslint-disable-line

const model = createModel({
  name: 'order',
  inject: ['user'],
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },
  actions: () => ({
    fetchOrders: state => ({ ...state, isLoading: true }),
    failFetchOrders: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    receiveOrders: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
  }),
  reactions: ({ deps }) => ({
    [deps.user.types.login]: state => ({ ...state, isLoading: true }),
  }),
  selectors: ({ name }) => ({
    getCustomSelector: state => [...state[name].orders, 'lol'],
    getOrders: state => state[name].orders,
  }),
  sagas: ({ types }) => [takeEvery([types.fetchOrders], fetchOrdersSaga)],
});

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

export default model;
