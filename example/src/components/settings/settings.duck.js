import { createDuck } from 'reducktion'; // eslint-disable-line

const duck = createDuck({
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
    testThunk,
  }),
});

// Thunks
function testThunk(arg, { user, order }) {
  return async dispatch => {
    dispatch(duck.actions.updateTheme('dark'));
    dispatch(order.actions.setOrders());
    dispatch(user.actions.setProfile());
  };
}

export default duck;
