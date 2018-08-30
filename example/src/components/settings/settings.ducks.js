import { createModel } from 'reducktion'; // eslint-disable-line

const model = createModel({
  name: 'settings',
  inject: ['user', 'order'],
  state: {
    notificationsEnabled: false,
    gpsEnabled: false,
    selectedTheme: 'light',
  },
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
    updateTheme: (state, action) => ({
      ...state,
      theme: action.payload || 'light',
    }),
    testThunk,
  }),
});

// Thunks
function testThunk(arg, { user, order }) {
  return async dispatch => {
    console.log('> settings thunk');
    dispatch(model.actions.updateTheme('dark'));
    dispatch(order.actions.setOrders());
    dispatch(user.actions.setProfile());
  };
}

export default model;
