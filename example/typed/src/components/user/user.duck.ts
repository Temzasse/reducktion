import { takeEvery, put, call } from 'redux-saga/effects';

import {
  createDuck,
  fetchableAction,
  fetchable,
  Fetchable,
  FetchableAction,
} from 'reducktion';

import { Profile, LoginInput } from './user.types';
import { sleep } from '../../helpers';

export interface State {
  isAuthenticated: boolean;
  profile: Fetchable<Profile | null>;
}

export interface Actions {
  login: FetchableAction<Profile>;
  logout: () => any;
}

const duck = createDuck<State, Actions>({
  name: 'user',
  state: {
    profile: fetchable(null),
    isAuthenticated: false,
  },
  actions: ({ initialState }) => ({
    login: fetchableAction('profile', {
      success: state => ({ ...state, isAuthenticated: true }),
      failure: state => ({ ...state, isAuthenticated: false }),
    }),
    logout: () => ({ ...initialState }),
  }),
  sagas: ({ types }) => [takeEvery(types.login, loginSaga)],
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
      duck.actions.login.success({
        name: 'Teemu Taskula',
        avatarUrl: 'https://source.unsplash.com/random/100x100',
        githubUrl: 'https://github.com/Temzasse',
      })
    );
  } catch (error) {
    yield put(duck.actions.login.fail('Failed to login!'));
  }
}

export type UserType = typeof duck;

export default duck;
