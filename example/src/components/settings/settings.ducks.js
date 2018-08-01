import { createModel } from 'reducktion'; // eslint-disable-line

const model = createModel(
  'settings',
  ['TOGGLE_NOTIFICATIONS', 'TOGGLE_GPS', 'UPDATE_THEME', 'RESET_SETTINGS'],
  {
    notificationsEnabled: false,
    gpsEnabled: false,
    selectedTheme: 'light',
  }
)
  .inject('user', 'order')
  .reducer(({ types, initialState }) => ({
    [types.RESET_SETTINGS]: () => ({ ...initialState }),
    [types.TOGGLE_NOTIFICATIONS]: state => ({
      ...state,
      notificationsEnabled: !state.notificationsEnabled,
    }),
    [types.TOGGLE_GPS]: state => ({
      ...state,
      gpsEnabled: !state.gpsEnabled,
    }),
    [types.UPDATE_THEME]: (state, action) => ({
      ...state,
      theme: action.payload || 'light',
    }),
  }))
  .actions(() => ({
    testThunk,
  }))
  .create();

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
