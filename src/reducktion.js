// @ts-check
import { createAction, handleActions } from 'redux-actions';
import {
  createSelectors,
  validateDuck,
  handleApiAction,
  handleThunks,
  isApiAction,
  API_ACTION_IDENTIFIER,
} from './helpers';

// JSDoc typedefs
// TODO: maybe use TypeScript or Flow?

/**
 * @typedef {Object.<string, Function>} Action
 */

/**
 * @typedef {Object.<string, Function>} Selectors
 */

/**
 * @typedef {Object.<string, string>} Types
 */

/**
 * @typedef {Object} DuckDefinition
 * @property {String} name
 * @property {Object} state
 * @property {String[]} inject
 * @property {Function} actions
 * @property {Function} selectors
 * @property {Function} sagas
 */

/**
 * @typedef {Object} Duck
 * @property {Function} _run
 * @property {Function} _fillDeps
 * @property {Boolean} _created
 * @property {Function} getSagas
 * @property {Function} getReducer
 * @property {String} name
 * @property {Action} actions
 * @property {Types} types
 * @property {Selectors} selectors
 * @property {Object.<string, any>} initialState
 */

/**
 * Creates a ducks duck and returns chainable functions to define futher props.
 * @param {string} duckName
 * @param {string[]} typeList
 * @param {Object.<string, any>} duck
 * @returns {Duck}
 */
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
  if (duck.actions) {
    // We need to provide `initialState` since it might be used in reducers
    Object.entries(duck.actions({ initialState })).forEach(
      ([actionName, reducerHandler]) => {
        // Register action type
        const actionType = `${duck.name}/${actionName}`;
        types[actionName] = actionType;

        if (isApiAction(reducerHandler)) {
          // Handle async API actions
          const x = handleApiAction(reducerHandler.args, actionName, duck.name);
          actions[actionName] = x.action;
          reducerHandlers = { ...reducerHandlers, ...x.reducers };
        } else {
          // Create basic action
          actions[actionName] = createAction(actionType);
          reducerHandlers[actionType] = reducerHandler;
        }
      },
      {}
    );
  }

  // Handle thunks
  if (duck.thunks) {
    actions = { ...actions, ...handleThunks(duck.thunks, dependencies) };
  }

  // Auto-generate initial selectors for each state field
  let selectors = createSelectors(duck);

  // Add selectors defined by user
  if (duck.selectors) {
    const customSelectors = duck.selectors({ name: duck.name }) || {};
    selectors = { ...selectors, ...customSelectors };
  }

  // Add simple `get` for selecting state fields by name
  const getSelector = (key, state) => {
    const statePart = state[duck.name];

    if (!Object.prototype.hasOwnProperty.call(statePart, key)) {
      throw Error(
        `You tried to select a non-existent field '${key}' from state`
      );
    }

    return statePart[key];
  };

  selectors = { ...selectors, get: getSelector };

  /**
   * Fills in the dependencies that were requested when calling inject.
   * @param {Object.<string, Duck>} deps
   */
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

  /**
   * Run reducer and sagas functions with the necessary data.
   */
  const _run = () => {
    // Run duck reactions function to get rest of the reducer
    if (duck.reactions) {
      const fromDeps =
        duck.reactions({ initialState, deps: dependencies }) || {};
      reducerHandlers = { ...reducerHandlers, ...fromDeps };
    }

    reducer = handleActions(reducerHandlers, initialState);

    if (duck.sagas) {
      sagas = duck.sagas({ types, deps: dependencies });
    }
  };

  /**
   * Get reducer for the duck.
   * @returns {Function}
   */
  const getReducer = () => reducer;

  /**
   * Get sagas for the duck.
   * @returns {Array}
   */
  const getSagas = () => sagas || [];

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

/**
 * Create ducks.
 * @param {Duck[]} ducks
 * @returns {Object.<string, Duck>}
 */
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

export const createApiAction = args => ({
  [API_ACTION_IDENTIFIER]: true,
  args,
});
