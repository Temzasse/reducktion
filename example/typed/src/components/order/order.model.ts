import { takeEvery, put, select } from 'redux-saga/effects';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';
import { createSelector } from 'reselect';

import {
  createModel,
  fetchable,
  FetchableValue,
  FetchableAction,
} from 'reducktion';

import { sleep } from '../../helpers';
import { UserModel } from '../user/user.model';
import { Order, Package } from './order.types';
import { InitialState } from '../types';

// #region types
export interface State {
  foo: number;
  bar: string;
  orders: FetchableValue<Order[]>;
  packages: FetchableValue<Package[]>;
}

export interface Actions {
  fetchOrders: FetchableAction<Order[]>;
  fetchPackages: FetchableAction<Package[]>;
  fooAction: (lol: number) => any;
  lolAction: (lol: number) => any;
  someThunk: (arg: any) => any;
}

interface Selectors {
  getFoo: (state: InitialState) => number;
  getOrdersData: (state: InitialState) => Order[];
  getSomethingComplex: (state: InitialState) => string;
}

interface Deps {
  user: UserModel;
}
// #endregion

const model = createModel<State, Actions, Selectors, Deps>({
  name: 'order',
  inject: ['user'],
  state: {
    foo: 1,
    bar: 'lol',
    orders: fetchable.value([]),
    packages: fetchable.value([]),
  },
  actions: ({ initialState }) => ({
    // Basic actions
    fooAction: (state, action) => ({
      ...state,
      foo: action.payload,
    }),
    lolAction: () => ({ ...initialState }),

    // Fetchable actions
    fetchPackages: fetchable.action('packages'),
    fetchOrders: fetchable.action('orders', {
      // Define custom reducer for different statuses
      loading: state => ({ ...state, bar: 'loading' }),
      success: state => ({ ...state, bar: 'success' }),
      failure: state => ({ ...state, bar: 'failure' }),
    }),

    // TODO: fix...
    someThunk: state => state,
  }),
  selectors: ({ selectors }) => ({
    getFoo: state => state.order.foo,
    getOrdersData: state => state.order.orders.data,
    getSomethingComplex: state => {
      const sel = createSelector(
        [selectors.getFoo, selectors.getOrdersData],
        (foo, data) => {
          if (data.length === 0) return 'No orders';
          return `${foo}-${data[0].id}`;
        }
      );
      return sel(state);
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
    takeEvery(deps.user.types.login, fetchOrdersSaga),
  ],
});

// Saga handlers
function* fetchOrdersSaga(action: any): any {
  console.log({ action });
  try {
    // Select the fetchable value
    const x = yield select(model.selectors.getSomethingComplex);
    const orders2 = yield select(model.selectors.get('orders'));

    console.log({ x, orders2 });

    const foo = yield select(model.selectors.getFoo);

    console.log({ foo });

    // Fake API call delay
    yield sleep(2000);

    yield put(model.actions.fooAction(1));

    yield put(
      model.actions.fetchOrders.success([
        { id: 1, name: 'Mock order 1' },
        { id: 2, name: 'Mock order 2' },
        { id: 3, name: 'Mock order 3' },
        { id: 4, name: 'Mock order 4' },
      ])
    );
  } catch (error) {
    console.log('FAIL!', error);
    yield put(model.actions.fetchOrders.fail('Could not load orders!'));
  }
}

function someThunk(arg: any, deps: Deps) {
  return async (dispatch: ThunkDispatch<{}, any, Action>, getState: any) => {
    const state = getState();
    const isAuthenticated = deps.user.selectors.get('isAuthenticated')(state);
    console.log({ isAuthenticated, arg });
    await sleep(2000);
    dispatch(model.actions.lolAction(1));
  };
}

export type OrderModel = typeof model;

export default model;
