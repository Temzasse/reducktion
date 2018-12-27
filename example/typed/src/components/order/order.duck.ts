import { takeEvery, put, select } from 'redux-saga/effects';

import {
  createDuck,
  fetchableAction,
  fetchable,
  IFetchable,
  IFetchableAction,
} from 'reducktion';

import { sleep } from '../../helpers';

interface IOrder {
  id: number;
  name: string;
}

interface IPackage {
  name: string;
}

interface IActions {
  fetchOrders: IFetchableAction<IOrder[]>;
  fooAction: () => any;
}

interface IState {
  foo: number;
  bar: string;
  orders: IFetchable<IOrder[]>;
  packages: IFetchable<IPackage[]>;
}

const duck = createDuck<IState, IActions>({
  name: 'order',
  state: {
    foo: 1,
    bar: 'lol',
    orders: fetchable([]),
    packages: fetchable([]),
  },
  actions: ({ initialState }) => ({
    // Basic actions
    fooAction: state => ({ ...state, foo: initialState.foo + 1 }),
    // Fetchable actions
    fetchPackages: fetchableAction('packages'),
    fetchOrders: fetchableAction('orders', {
      // Define custom reducer for loading status
      loading: state => ({ ...state, bar: 'lol' }),
    }),
  }),
  selectors: ({ name }) => ({
    getFoo: state => state[name].foo,
  }),
  sagas: ({ types }) => [takeEvery(types.fetchOrders, fetchOrdersSaga)],
});

/*
model.selectors.get('orders')
*/

// Saga handlers
function* fetchOrdersSaga(action: any): any {
  console.log({ action });
  try {
    const orders = yield select(duck.selectors.get('orders'));

    console.log({ orders });

    // Fake API call delay
    yield sleep(400);

    yield put(duck.actions.fooAction());
    yield put(duck.actions.fetchOrders());

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

export default duck;
