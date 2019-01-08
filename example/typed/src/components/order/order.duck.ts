import { takeEvery, put, select } from 'redux-saga/effects';

import {
  createDuck,
  fetchableAction,
  fetchable,
  Fetchable,
  FetchableAction,
} from 'reducktion';

import { sleep } from '../../helpers';

export interface Order {
  id: number;
  name: string;
}

export interface Package {
  name: string;
}

export interface State {
  foo: number;
  bar: string;
  orders: Fetchable<Order[]>;
  packages: Fetchable<Package[]>;
}

export interface Actions {
  fetchOrders: FetchableAction<Order[]>;
  fetchPackages: FetchableAction<Package[]>;
  fooAction: (lol: number) => any;
  lolAction: (lol: number) => any;
}

const duck = createDuck<State, Actions>({
  name: 'order',
  state: {
    foo: 1,
    bar: 'lol',
    orders: fetchable([]),
    packages: fetchable([]),
  },
  actions: ({ initialState }) => ({
    // Basic actions
    fooAction: (state, action: { payload: number }) => ({
      ...state,
      foo: action.payload,
    }),
    lolAction: state => ({ ...state }),

    // Fetchable actions
    fetchPackages: fetchableAction('packages'),
    fetchOrders: fetchableAction('orders', {
      // Define custom reducer for loading status
      loading: state => ({ ...state, bar: state.bar }),
    }),
  }),
  selectors: ({ name }) => ({
    getFoo: state => state[name].foo,
    getOrdersCustom: state => state[name].orders.data,
    getBarYeyd: state => {
      const x = 'yey';
      return `${state[name].bar}-${x}`;
    },
  }),
  sagas: ({ types }) => [takeEvery(types.fetchOrders, fetchOrdersSaga)],
});

// duck.actions as Actions;

// Saga handlers
function* fetchOrdersSaga(action: any): any {
  console.log({ action });
  try {
    // Select the fetchable value
    const orders1 = yield select(duck.selectors.get('orders'));

    // Or use a custom selector to get the data field directly
    // const orders2: Order[] = yield select(duck.selectors);

    console.log({ orders1 });

    // Fake API call delay
    yield sleep(400);

    yield put(duck.actions.fooAction(1));
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
