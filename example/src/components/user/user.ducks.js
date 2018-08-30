import { takeEvery } from 'redux-saga/effects';
import { createModel } from 'reducktion'; // eslint-disable-line

const model = createModel({
  name: 'user',
  inject: ['order'],
  state: {
    profile: null,
    isAuthenticated: false,
  },
  actions: () => ({
    login: state => ({ ...state, isAuthenticated: true }),
    logout: state => ({ ...state, isAuthenticated: false }),
    fetchProfile: undefined,
    setProfile: undefined,
  }),
  selectors: ({ name }) => ({
    getCustomSelector: state => state[name].profile,
  }),
  sagas: ({ types, deps }) => [
    takeEvery([types.fetchProfile], fetchProfileSaga),
    takeEvery([types.login], loginSaga),
    takeEvery([deps.order.types.fetchOrders], reactToFetchOrdersSaga),
  ],
});

function* fetchProfileSaga() {
  yield console.log('> fetch profile');
}

function* loginSaga() {
  yield console.log('> login');
}

function* reactToFetchOrdersSaga() {
  yield console.log('> react to fetch orders');
}

export default model;
