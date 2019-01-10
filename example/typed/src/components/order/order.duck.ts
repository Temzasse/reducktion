import { takeEvery, put, select } from 'redux-saga/effects';
import { ThunkDispatch } from 'redux-thunk';

import {
  createDuck,
  fetchableAction,
  fetchable,
  Fetchable,
  FetchableAction,
} from 'reducktion';

import { sleep } from '../../helpers';
import { UserType } from '../user/user.duck';

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

interface Deps {
  user: UserType;
}

const duck = createDuck<State, Actions, Deps>({
  name: 'order',
  inject: ['user'],
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
    lolAction: () => ({ ...initialState }),

    // Fetchable actions
    fetchPackages: fetchableAction('packages'),
    fetchOrders: fetchableAction('orders', {
      // Define custom reducer for different statuses
      loading: state => ({ ...state, bar: 'loading' }),
      success: state => ({ ...state, bar: 'success' }),
      failure: state => ({ ...state, bar: 'failure' }),
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
  thunks: {
    someThunk,
  },
  reactions: ({ deps, initialState }) => ({
    [deps.user.types.isAuthenticated]: state => ({ ...state, bar: '123' }),
    [deps.user.types.logout]: () => ({ ...initialState }),
  }),
  sagas: ({ types, deps }) => [
    takeEvery(types.fetchOrders, fetchOrdersSaga),
    takeEvery(deps.user.types.fetchUser, fetchOrdersSaga),
  ],
});

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

function someThunk(arg: any, deps: Deps) {
  return async (dispatch: any, getState: any) => {
    const state = getState();
    const isAuthenticated = deps.user.selectors.get('isAuthenticated')(state);
    console.log({ isAuthenticated, arg });
    await sleep(2000);
    dispatch(duck.actions.lolAction(1));
  };
}

export default duck;
