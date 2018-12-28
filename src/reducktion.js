// @ts-check
import { createAction, handleActions } from 'redux-actions';

import {
  // createSelectors,
  validateDuck,
  handleFetchableAction,
  handleThunks,
  isFetchableAction,
  FETCHABLE_ACTION_IDENTIFIER,
  FETCHABLE_STATUSES,
} from './helpers';

// Creates a ducks duck and returns chainable functions to define futher props.
export const createDuck = duck => {
  validateDuck(duck);

  const initialState = { ...duck.state };
  const dependencies = {};
  const types = {};
  let reducerHandlers = {};
  let actions = {};
  let reducer;
  let sagas = [];

  // Mark injected deps to be filled later
  if (duck.inject) {
    duck.inject.forEach(depName => {
      dependencies[depName] = null;
    });
  }

  // Create types, actions and reducer handlers from `duck.actions`
  // We need to provide `initialState` since it might be used in reducers
  Object.entries(duck.actions({ initialState })).forEach(
    ([actionName, reducerHandler]) => {
      if (isFetchableAction(reducerHandler)) {
        // Handle async API actions
        const fetchableX = handleFetchableAction(
          reducerHandler.args,
          actionName,
          duck.name
        );

        // Inline fetchable types
        Object.entries(fetchableX.types).forEach(([k, v]) => {
          types[k] = v;
        });

        actions[actionName] = fetchableX.action;
        reducerHandlers = { ...reducerHandlers, ...fetchableX.reducers };
      } else {
        // Register action type
        const actionType = `${duck.name}/${actionName}`;
        types[actionName] = actionType;

        // Create basic action
        actions[actionName] = createAction(actionType);

        if (reducerHandler) reducerHandlers[actionType] = reducerHandler;
      }
    },
    {}
  );

  // Handle thunks
  if (duck.thunks) {
    actions = { ...actions, ...handleThunks(duck.thunks, dependencies) };
  }

  // TODO: remove!
  // Auto-generate initial selectors for each state field
  // let selectors = createSelectors(duck);

  // NOTE: do not create camelcased selectors since
  // simple `.get` selector is enough!
  let selectors = {};

  // Add selectors defined by user
  if (duck.selectors) {
    selectors = duck.selectors({ name: duck.name });
    // TODO: remove!
    // const customSelectors = duck.selectors({ name: duck.name });
    // selectors = { ...selectors, ...customSelectors };
  }

  // Add simple `get` for selecting state fields by name
  const getSelector = key => state => {
    const statePart = state[duck.name];

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
          `There is no dependendy called '${dep}' for ${duck.name} duck.` // eslint-disable-line
        );
      }
    });
  };

  // Run reducer and sagas functions with the necessary data.
  const _run = () => {
    // Run duck reactions function to get rest of the reducer
    if (duck.reactions) {
      const fromDeps = duck.reactions({ initialState, deps: dependencies });
      reducerHandlers = { ...reducerHandlers, ...fromDeps };
    }

    reducer = handleActions(reducerHandlers, initialState);

    if (duck.sagas) {
      sagas = duck.sagas({ types, deps: dependencies });
    }
  };

  // Get reducer for the duck.
  const getReducer = () => reducer;

  // Get sagas for the duck.
  const getSagas = () => sagas;

  return {
    name: duck.name,
    initialState: duck.state,
    types,
    actions,
    selectors,
    getSagas,
    getReducer,
    _run,
    _fillDeps,
  };
};

// Create the final ducks with dependencies injected
export const initDucks = (ducks = []) => {
  const ducksByName = ducks.reduce((acc, val) => {
    acc[val.name] = val;
    return acc;
  }, {});

  // @ts-ignore
  Object.values(ducksByName).forEach(duck => {
    duck._fillDeps(ducksByName);
    duck._run();

    // Users don't need these props so delete them
    delete duck._fillDeps;
    delete duck._run;
  });

  const getAllReducers = () =>
    Object.values(ducksByName).reduce((acc, val) => {
      acc[val.name] = val.getReducer();
      return acc;
    }, {});

  const getAllSagas = () =>
    Object.values(ducksByName).reduce(
      (acc, val) => acc.concat(...val.getSagas()),
      []
    );

  return {
    ...ducksByName,
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
