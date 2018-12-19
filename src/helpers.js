// @ts-check
import { createAction } from 'redux-actions';

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const isObject = o => typeof o === 'object' && o !== null;

const reduceReducers = (...reducers) => {
  const initialState = null;

  return (prevState, value, ...args) => {
    const prevStateIsUndefined = typeof prevState === 'undefined';
    const valueIsUndefined = typeof value === 'undefined';

    if (prevStateIsUndefined && valueIsUndefined && initialState) {
      return initialState;
    }

    const x = prevStateIsUndefined && !valueIsUndefined && initialState;

    return reducers.reduce((newState, reducer, index) => {
      if (typeof reducer === 'undefined') {
        throw new TypeError(
          `An undefined reducer was passed in at index ${index}`
        );
      }

      return reducer(newState, value, ...args);
    }, x ? initialState : prevState);
  };
};

export const camelCasedAction = action =>
  action
    .toLowerCase()
    .split('_')
    .reduce((acc, x, i) => (i === 0 ? acc + x : acc + capitalize(x)), '');

export const FETCHABLE_STATUSES = {
  INITIAL: 'INITIAL',
  LOADING: 'LOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

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

const createFetchableReducers = ({ types, successField, overrides }) => {
  if (!successField) {
    throw Error(
      'You must provide the name of the field that is used for success payload'
    );
  }

  const defaultReducers = {
    [types.loading]: state => ({
      ...state,
      [successField]: {
        ...state[successField],
        status: FETCHABLE_STATUSES.LOADING,
        error: null,
      },
    }),
    [types.success]: (state, action) => ({
      ...state,
      [successField]: {
        data: action.payload,
        status: FETCHABLE_STATUSES.SUCCESS,
        error: null,
      },
    }),
    [types.failure]: (state, action) => ({
      ...state,
      [successField]: {
        ...state[successField],
        status: FETCHABLE_STATUSES.FAILURE,
        error: action.payload,
      },
    }),
  };

  if (!isObject(overrides)) return defaultReducers;

  // Apply possible overrides
  return Object.values(types).reduce((acc, t) => {
    acc[t] = overrides[t]
      ? reduceReducers(defaultReducers[t], overrides[t])
      : defaultReducers[t];
    return acc;
  }, {});
};

const createFetchableAction = types => {
  const action = createAction(types.loading);
  action.success = createAction(types.success);
  action.fail = createAction(types.failure);
  action.init = createAction(types.init);
  return action;
};

export function handleFetchableAction(args, actionName, duckName) {
  const typePrefix = `${duckName}/${actionName}`;

  const t = {
    loading: typePrefix,
    success: `${typePrefix}/success`,
    failure: `${typePrefix}/failure`,
    // NOTE: Also provide `init` for cases where loading should not be
    // dispatched as the default action
    init: `${typePrefix}/init`,
  };

  const action = createFetchableAction(t);

  // User can either provide only reducer field name for success case
  // or reducer overrides for `loading` / `success` / `failure` cases
  const reducers = createFetchableReducers({
    types: t,
    successField: args.length > 0 ? args[0] : null,
    overrides: args.length > 1 ? args[1] : {},
  });

  // Return types that are inlined to the other types instead of accessing them
  // via `types.fetchSomething.success` you access them normally
  // without object notation `types.fetchSomethingSuccess`
  // (where `fetchSomething` is the action name)
  const types = {
    [actionName]: typePrefix,
    [`${actionName}Init`]: `${typePrefix}/init`,
    [`${actionName}Success`]: `${typePrefix}/success`,
    [`${actionName}Failure`]: `${typePrefix}/failure`,
  };

  return { action, reducers, types };
}

export const FETCHABLE_ACTION_IDENTIFIER = '__IS_FETCHABLE_ACTION__';

export const isFetchableAction = x =>
  x && Object.prototype.hasOwnProperty.call(x, FETCHABLE_ACTION_IDENTIFIER);

/**
 * Refactor to use `status` instead of separate
 * `isLoading` / `hasError` / `error` boolean flags
 */
export const API_STATUSES = {
  LOADING: 'LOADING',
  FAILURE: 'FAILURE',
  SUCCESS: 'SUCCESS',
};
