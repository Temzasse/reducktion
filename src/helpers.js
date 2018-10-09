// @ts-check
import { createAction } from 'redux-actions';

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

export const isFunction = f => f && {}.toString.call(f) === '[object Function]';

export const camelCasedAction = action =>
  action
    .toLowerCase()
    .split('_')
    .reduce((acc, x, i) => (i === 0 ? acc + x : acc + capitalize(x)), '');

export const validateInject = injected => {
  if (!Array.isArray(injected)) {
    throw Error('Inject should be an array of dependency names');
  }

  const hasNonStringInjects =
    injected.map(dep => typeof dep !== 'string').filter(Boolean).length > 0;

  if (hasNonStringInjects) {
    throw Error('Injected dependency names should be strings');
  }
};

export const validateDuck = ({ name, state, inject, actions, reactions }) => {
  if (!name) throw Error('Duck should have a name');

  if (state && !actions && !reactions) {
    throw Error('Duck with state should have reducers');
  }

  if (inject) validateInject(inject);
};

export const createSelectors = duck =>
  Object.keys(duck.state).reduce((acc, key) => {
    acc[`get${capitalize(key)}`] = state => state[duck.name][key];
    return acc;
  }, {});

export const handleThunks = (thunks, dependencies) =>
  Object.entries(thunks).reduce((acc, [actionName, thunk]) => {
    acc[actionName] = (...args) => thunk(...args, dependencies);
    return acc;
  }, {});

const createApiActionReducers = ({ types, successField, overrides = {} }) => {
  const noOverrides =
    !overrides.loading && !overrides.failure && !overrides.success;

  if (!successField && noOverrides) {
    throw Error(
      'You must provide the name of the field that is used for success payload'
    );
  }

  const reducers = {
    [types.loading]: state => ({
      ...state,
      error: null,
      hasError: false,
      isLoading: true,
    }),
    [types.success]: (state, action) => ({
      ...state,
      [successField]: action.payload,
      error: null,
      hasError: false,
      isLoading: false,
    }),
    [types.failure]: (state, action) => ({
      ...state,
      error: action.payload,
      hasError: true,
      isLoading: false,
    }),
  };

  // Apply possible overrides
  if (overrides.loading) reducers[types.loading] = overrides.loading;
  if (overrides.success) reducers[types.success] = overrides.success;
  if (overrides.failure) reducers[types.failure] = overrides.failure;

  return reducers;
};

const createApiActionVariations = types => {
  const action = createAction(types.loading);
  action.success = createAction(types.success);
  action.fail = createAction(types.failure);
  return action;
};

export function handleApiAction(arg, name, duckName) {
  const types = {
    loading: `${duckName}/${name}`,
    success: `${duckName}/${name}/success`,
    failure: `${duckName}/${name}/failure`,
  };

  const action = createApiActionVariations(types);

  // User can either provide only reducer field name for success case
  // or reducer overrides for `loading` / `success` / `failure` cases
  const reducers =
    typeof arg === 'string'
      ? createApiActionReducers({ types, successField: arg })
      : createApiActionReducers({ types, overrides: arg });

  return { action, reducers, types };
}

export const API_ACTION_IDENTIFIER = '__isApiAction__';

export const isApiAction = x =>
  x && Object.prototype.hasOwnProperty.call(x, API_ACTION_IDENTIFIER);
