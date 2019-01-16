import { takeEvery, put } from 'redux-saga/effects';
import { createModel, fetchable } from 'reducktion'; // eslint-disable-line
import { sleep } from '../../helpers';

const model = createModel({
  name: 'order',
  inject: ['user'],
  state: {
    orders: fetchable.value([]),
    /*
    {
      data: [],
      status: 'INITIAL', LOADING | SUCCESS | FAILURE,
      error: null,
    }
    */
    packages: fetchable.value([]),
  },
  actions: () => ({
    // Simple way to create action for fetchable data
    // fetchOrders: fetchable.action('orders'),
    // You can also define overrides for updating the state in your own way
    fetchOrders: fetchable.action('orders', {
      loading: state => ({ ...state, yolo: 1 }),
      success: state => ({ ...state, yolo: 2 }),
      failure: state => ({ ...state, yolo: 3 }),
    }),
    /*
    fetchOrders
    fetchOrders.success(data)
    fetchOrders.failure(error)
    fetchOrders.init()
    */

    // fetchOrders: fetchable.action('orders', {
    //   loading: state => ({
    //     ...state,
    //     foo: 1,
    //   }),
    // }),
    fetchPackages: fetchable.action('packages'),
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

/*
model.selectors.get('orders')
*/

// Saga handlers
function* fetchOrdersSaga() {
  try {
    // Fake API call delay
    yield sleep(400);

    yield put(
      model.actions.fetchOrders.success([
        { id: 1, name: 'Mock order 1' },
        { id: 2, name: 'Mock order 2' },
        { id: 3, name: 'Mock order 3' },
        { id: 4, name: 'Mock order 4' },
      ])
    );
  } catch (error) {
    yield put(model.actions.fetchOrders.fail('Could not load orders!'));
  }
}

function* fetchPackagesSaga() {
  try {
    yield put(model.actions.fetchPackages()); // start loading

    // Fake API call delay
    yield sleep(800);

    yield put(
      model.actions.fetchPackages.success([
        { id: 1, name: 'Mock package 1' },
        { id: 2, name: 'Mock package 2' },
        { id: 3, name: 'Mock package 3' },
        { id: 4, name: 'Mock package 4' },
      ])
    );
  } catch (error) {
    yield put(model.actions.fetchPackages.fail('Could not load packages!'));
  }
}

export default model;
