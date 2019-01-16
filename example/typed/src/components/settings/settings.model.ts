import { createModel } from 'reducktion';
import { ThunkDispatch } from 'redux-thunk';
import { Action } from 'redux';

import { UserModel } from '../user/user.model';
import { OrderModel } from '../order/order.model';

interface Actions {
  resetSettings: () => any;
  toggleNotifications: () => any;
  toggleGps: () => any;
  toggleDarkMode: () => any;
  testThunk: () => any;
}

interface State {
  notificationsEnabled: boolean;
  gpsEnabled: boolean;
  darkModeEnabled: boolean;
}

interface Deps {
  user: UserModel;
  order: OrderModel;
}

const model = createModel<State, Actions, Deps>({
  name: 'settings',
  inject: ['user', 'order'],
  state: {
    notificationsEnabled: false,
    gpsEnabled: false,
    darkModeEnabled: false,
  },
  selectors: ({ name }) => ({
    getThemeMode: state => (state[name].darkModeEnabled ? 'dark' : 'light'),
  }),
  actions: ({ initialState }) => ({
    resetSettings: () => ({ ...initialState }),
    toggleNotifications: state => ({
      ...state,
      notificationsEnabled: !state.notificationsEnabled,
    }),
    toggleGps: state => ({
      ...state,
      gpsEnabled: !state.gpsEnabled,
    }),
    toggleDarkMode: state => ({
      ...state,
      darkModeEnabled: !state.darkModeEnabled,
    }),
    // TODO: this is redundant... fix thunk types!
    testThunk: state => state,
  }),
  thunks: { testThunk },
});

// Thunks
function testThunk(arg: any, deps: Deps) {
  return async (dispatch: ThunkDispatch<{}, any, Action>) => {
    dispatch(model.actions.toggleGps());
    dispatch(model.actions.toggleDarkMode());

    // Set profile for fun
    dispatch(
      deps.user.actions.login.success({
        name: 'New Profile',
        avatarUrl: 'https://source.unsplash.com/random/200x200',
        githubUrl: 'https://github.com/Temzasse',
      })
    );
  };
}

export type SettingsModel = typeof model;

export default model;
