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
  }),
  thunks: { testThunk },
});

// Thunks
function testThunk(arg, { user }) {
  return async dispatch => {
    dispatch(duck.actions.toggleGps());
    dispatch(duck.actions.toggleDarkMode());
    dispatch(
      user.actions.setProfile({
        name: 'New Profile',
        avatarUrl: 'https://source.unsplash.com/random/200x200',
        githubUrl: 'https://github.com/Temzasse',
      })
    );
  };
}

export default duck;
