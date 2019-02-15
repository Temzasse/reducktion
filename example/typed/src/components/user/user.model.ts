import { takeEvery, put, call } from 'redux-saga/effects';

import {
  createModel,
  fetchable,
  FetchableValue,
  FetchableAction,
} from 'reducktion';

import { Profile, LoginInput } from './user.types';
import { sleep } from '../../helpers';

export interface State {
  isAuthenticated: boolean;
  profile: FetchableValue<Profile | null>;
}

interface Actions {
  login: FetchableAction<Profile>;
  logout: () => any;
  deleteUser: () => any;
}

const model = createModel<State, Actions>({
  name: 'user',
  state: {
    profile: fetchable.value(null),
    isAuthenticated: false,
  },
  actions: ({ initialState }) => ({
    deleteUser: fetchable.noop(),
    login: fetchable.action('profile', {
      success: state => ({ ...state, isAuthenticated: true }),
      failure: state => ({ ...state, isAuthenticated: false }),
    }),
    logout: () => ({ ...initialState }),
  }),
  sagas: ({ types }) => [
    takeEvery(types.login, loginSaga),
    takeEvery(types.deleteUser, deleteUserSaga),
  ],
});

// Saga handlers

function* loginSaga(action: any): any {
  const data: LoginInput = action.payload;

  console.log(data);

  if (!data.username || !data.password) {
    return;
  }

  try {
    // Fake API call delay
    yield call(sleep, 1000);
    yield put(
      model.actions.login.success({
        name: 'Teemu Taskula',
        avatarUrl: 'https://source.unsplash.com/random/100x100',
        githubUrl: 'https://github.com/Temzasse',
      })
    );
  } catch (error) {
    yield put(model.actions.login.fail('Failed to login!'));
  }
}

function* deleteUserSaga(action: any): any {
  yield console.log('Do something');
}

export type UserModel = typeof model;

export default model;
