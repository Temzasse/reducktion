import { takeLatest, put } from 'redux-saga/effects';
import { createDuck } from 'reducktion'; // eslint-disable-line
import { sleep } from '../../helpers';

const model = createDuck({
  name: 'user',
  inject: ['order'],
  state: {
    profile: null,
    isAuthenticated: false,
    loading: false,
    error: false,
  },
  actions: ({ initialState }) => ({
    logout: () => ({ ...initialState }),
    login: state => ({ ...state, loading: true, error: false }),
    loginFailed: state => ({ ...state, loading: false, error: true }),
    loginSuccess: (state, action) => ({
      ...state,
      profile: action.payload,
      isAuthenticated: true,
      loading: false,
      error: false,
    }),
  }),
  selectors: ({ name }) => ({
    getProfile: state => state[name].profile, // Custom selector just for fun
  }),
  sagas: ({ types, deps }) => [takeLatest([types.login], loginSaga, deps)],
});

function* loginSaga(deps, { payload }) {
  if (!payload.username || !payload.password) {
    yield put(model.actions.loginFailed());
  } else {
    // Fake API call delay
    yield sleep(600);
    yield put(
      model.actions.loginSuccess({
        name: 'Teemu Taskula',
        avatarUrl: 'https://source.unsplash.com/random/100x100',
        githubUrl: 'https://github.com/Temzasse',
      })
    );
    // Use deps to fetch orders after successful auth
    yield put(deps.order.actions.fetchOrders());
  }
}

export default model;
