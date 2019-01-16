// @ts-check
import { createAction, handleActions } from 'redux-actions';

import {
  validateModel,
  handleFetchableAction,
  handleThunks,
  isFetchableAction,
  FETCHABLE_ACTION_IDENTIFIER,
  FETCHABLE_STATUSES,
} from './helpers';

// Creates a models model and returns chainable functions to define futher props
export const createModel = model => {
  validateModel(model);

  const initialState = { ...model.state };
  const dependencies = {};
  const types = {};
  let reducerHandlers = {};
  let actions = {};
  let reducer;
  let sagas = [];

  // Mark injected deps to be filled later
  if (model.inject) {
    model.inject.forEach(depName => {
      dependencies[depName] = null;
    });
  }

  // Create types, actions and reducer handlers from `model.actions`
  // We need to provide `initialState` since it might be used in reducers
  Object.entries(model.actions({ initialState })).forEach(
    ([actionName, reducerHandler]) => {
      if (isFetchableAction(reducerHandler)) {
        // Handle async API actions
        const fetchableX = handleFetchableAction(
          reducerHandler.args,
          actionName,
          model.name
        );

        // Inline fetchable types
        Object.entries(fetchableX.types).forEach(([k, v]) => {
          types[k] = v;
        });

        actions[actionName] = fetchableX.action;
        reducerHandlers = { ...reducerHandlers, ...fetchableX.reducers };
      } else {
        // Register action type
        const actionType = `${model.name}/${actionName}`;
        types[actionName] = actionType;

        // Create basic action
        actions[actionName] = createAction(actionType);

        if (reducerHandler) reducerHandlers[actionType] = reducerHandler;
      }
    },
    {}
  );

  // Handle thunks
  if (model.thunks) {
    actions = { ...actions, ...handleThunks(model.thunks, dependencies) };
  }

  let selectors = {};

  // Add selectors defined by user
  if (model.selectors) {
    selectors = model.selectors({ name: model.name });
  }

  // Add simple `get` for selecting state fields by name
  const getSelector = key => state => {
    const statePart = state[model.name];

    if (!Object.prototype.hasOwnProperty.call(statePart, key)) {
      throw Error(
        `You tried to select a non-existent field '${key}' from state`
      );
    }

    return statePart[key];
  };

  selectors = { ...selectors, get: getSelector };

  // Fills in the dependencies that were requested when calling inject.
  const _fillDeps = deps => {
    Object.keys(dependencies).forEach(dep => {
      if (deps[dep]) {
        dependencies[dep] = {
          // Don't spread all of dep but only what's needed
          types: deps[dep].types,
          actions: deps[dep].actions,
          selectors: deps[dep].selectors,
        };
      } else {
        throw Error(
          `There is no dependendy called '${dep}' for ${model.name} model.` // eslint-disable-line
        );
      }
    });
  };

  // Run reducer and sagas functions with the necessary data.
  const _run = () => {
    // Run model reactions function to get rest of the reducer
    if (model.reactions) {
      const fromDeps = model.reactions({ initialState, deps: dependencies });
      reducerHandlers = { ...reducerHandlers, ...fromDeps };
    }

    reducer = handleActions(reducerHandlers, initialState);

    if (model.sagas) {
      sagas = model.sagas({ types, deps: dependencies });
    }
  };

  // Get reducer for the model.
  const getReducer = () => reducer;

  // Get sagas for the model.
  const getSagas = () => sagas;

  return {
    name: model.name,
    initialState: model.state,
    types,
    actions,
    selectors,
    getSagas,
    getReducer,
    _run,
    _fillDeps,
  };
};

// Create the final models with dependencies injected
export const initModels = (models = []) => {
  const modelsByName = models.reduce((acc, val) => {
    acc[val.name] = val;
    return acc;
  }, {});

  // @ts-ignore
  Object.values(modelsByName).forEach(model => {
    model._fillDeps(modelsByName);
    model._run();

    // Users don't need these props so delete them
    delete model._fillDeps;
    delete model._run;
  });

  const getAllReducers = () =>
    Object.values(modelsByName).reduce((acc, val) => {
      acc[val.name] = val.getReducer();
      return acc;
    }, {});

  const getAllSagas = () =>
    Object.values(modelsByName).reduce(
      (acc, val) => acc.concat(...val.getSagas()),
      []
    );

  return {
    ...modelsByName,
    allReducers: getAllReducers(),
    allSagas: getAllSagas(),
  };
};

export const STATUSES = FETCHABLE_STATUSES;

// Description of a fetchable action
export const fetchableAction = (...args) => ({
  [FETCHABLE_ACTION_IDENTIFIER]: true,
  args,
});

export const fetchable = initialValue => ({
  data: initialValue,
  status: FETCHABLE_STATUSES.INITIAL,
  error: null,
});
