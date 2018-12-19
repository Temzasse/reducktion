import { takeEvery, put } from 'redux-saga/effects';
import { createDuck, fetchableAction, fetchable } from 'reducktion'; // eslint-disable-line
import { sleep } from '../../helpers';

const duck = createDuck({
  name: 'order',
  inject: ['user'],
  state: {
    orders: fetchable([]),
    packages: fetchable([]),
  },
  actions: () => ({
    // Simple way to create action for fetchable data
    // fetchOrders: fetchableAction('orders'),
    // You can also define overrides for updating the state in your own way
    fetchOrders: fetchableAction('orders', {
      loading: state => ({
        ...state,
        foo: 1,
      }),
    }),
    fetchPackages: fetchableAction('packages'),
  }),
  reactions: ({ deps, initialState }) => ({
    // Maybe actually do something meaningful...
    [deps.user.types.login]: () => ({ ...initialState }),
  }),
  selectors: ({ name }) => ({
    getCustomSelector: state => [...state[name].orders, 'lol'],
    getOrders: state => state[name].orders,
  }),
  sagas: ({ types, deps }) => [
    takeEvery(types.fetchOrders, fetchOrdersSaga),
    // Instead of listening the default action type listen to the init
    // and manually set loading in the saga
    takeEvery(types.fetchPackagesInit, fetchPackagesSaga),
    takeEvery(deps.user.types.loginSuccess, fetchOrdersSaga),
  ],
});

// Saga handlers
function* fetchOrdersSaga() {
  try {
    // Fake API call delay
    yield sleep(400);

    yield put(
      duck.actions.fetchOrders.success([
        { id: 1, name: 'Mock order 1' },
        { id: 2, name: 'Mock order 2' },
        { id: 3, name: 'Mock order 3' },
        { id: 4, name: 'Mock order 4' },
      ])
    );
  } catch (error) {
    yield put(duck.actions.fetchOrders.fail('Could not load orders!'));
  }
}

function* fetchPackagesSaga() {
  try {
    yield put(duck.actions.fetchPackages()); // start loading

    // Fake API call delay
    yield sleep(800);

    yield put(
      duck.actions.fetchPackages.success([
        { id: 1, name: 'Mock package 1' },
        { id: 2, name: 'Mock package 2' },
        { id: 3, name: 'Mock package 3' },
        { id: 4, name: 'Mock package 4' },
      ])
    );
  } catch (error) {
    yield put(duck.actions.fetchPackages.fail('Could not load packages!'));
  }
}

export default duck;
