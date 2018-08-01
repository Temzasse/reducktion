import { takeEvery } from 'redux-saga/effects';
import { createModel } from 'reducktion'; // eslint-disable-line

const model = createModel(
  'user',
  ['FETCH_PROFILE', 'SET_PROFILE', 'LOGIN', 'LOGOUT'],
  {
    profile: null,
    isAuthenticated: false,
  }
)
  .inject('order')
  .reducer(({ types }) => ({
    [types.LOGIN]: state => ({ ...state, isAuthenticated: true }),
    [types.LOGOUT]: state => ({ ...state, isAuthenticated: false }),
  }))
  .actions(({ types }) => ({
    fetchProfile: types.FETCH_PROFILE,
    setProfile: types.SET_PROFILE,
    login: types.LOGIN,
    logout: types.LOGOUT,
  }))
  .selectors(({ name }) => ({
    getCustomSelector: state => state[name].profile,
  }))
  .sagas(({ types, order }) => [
    takeEvery([types.FETCH_PROFILE], fetchProfileSaga),
    takeEvery([types.LOGIN], loginSaga),
    takeEvery([order.types.FETCH_ORDERS], reactToFetchOrdersSaga),
  ])
  .create();

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
