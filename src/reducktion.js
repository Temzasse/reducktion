// @ts-check
import { createAction, handleActions } from 'redux-actions';
import { capitalize, isFunction, validateDuck } from './helpers';

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

  const dependencies = {};
  let { sagas } = duck;
  let types = {};
  let reducer;

  // Mark injected deps to be filled later
  if (duck.inject) {
    duck.inject.forEach(depName => {
      dependencies[depName] = null;
    });
  }

  // Create types from actions
  if (duck.actions) {
    // Execute actions func once with fake self to get the keys used for types
    const fakeSelf = { initialState: {} };
    types = Object.keys(duck.actions(fakeSelf)).reduce((acc, actionName) => {
      acc[actionName] = `${duck.name}/${actionName}`;
      return acc;
    }, {});
  }

  // Create actions from generate types
  const actions = Object.entries(types).reduce((acc, [actionName, value]) => {
    if (isFunction(value)) {
      // Handle thunks
      acc[actionName] = (...args) => value(...args, dependencies);
    } else if (typeof value === 'string') {
      // Just create a normal action
      acc[actionName] = createAction(value);
    } else {
      throw Error(
        `Unknown type for action ${actionName} - expected a string or function.`
      );
    }
    return acc;
  }, {});

  // Auto-generate initial selectors for each state field
  let selectors = Object.keys(duck.state).reduce((acc, key) => {
    acc[`get${capitalize(key)}`] = state => state[duck.name][key];
    return acc;
  }, {});

  // Add selectors defined by user
  if (duck.selectors) {
    const customSelectors = duck.selectors({ name: duck.name }) || {};
    selectors = { ...selectors, ...customSelectors };
  }

  // Add simple `get` for selecting state fields by name
  const getSelector = (key, state) => {
    const statePart = state[duck.name];
    // TODO: is this validation necessary?
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
    let reducerObj = {};

    // Run duck actions function to get reducer
    if (duck.actions) {
      const own = duck.actions({ initialState: duck.state }) || {};
      // Modify reducer obj keys to match with types
      const ownCorrect = Object.entries(own).reduce((acc, [key, val]) => {
        acc[`${duck.name}/${key}`] = val;
        return acc;
      }, {});
      reducerObj = { ...reducerObj, ...ownCorrect };
    }

    // Run duck reactions function to get rest of the reducer
    if (duck.reactions) {
      const fromDeps =
        duck.reactions({
          initialState: duck.state,
          deps: dependencies,
        }) || {};
      reducerObj = { ...reducerObj, ...fromDeps };
    }

    reducer = handleActions(reducerObj, duck.state);

    if (sagas) {
      sagas = sagas({ types, deps: dependencies });
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
