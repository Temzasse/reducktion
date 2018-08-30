// @ts-check
import { createAction, handleActions } from 'redux-actions';
import {
  capitalize,
  isFunction,
  validateInject,
  validateModel,
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
 * Creates a ducks model and returns chainable functions to define futher props.
 * @param {string} modelName
 * @param {string[]} typeList
 * @param {Object.<string, any>} model
 * @returns {Duck}
 */
export const createModel = model => {
  validateModel(model);

  const dependencies = {};
  let { sagas } = model;
  let types = {};
  let reducer;

  // Mark injected deps to be filled later
  if (model.inject) {
    model.inject.forEach(depName => {
      dependencies[depName] = null;
    });
  }

  // Create types from actions
  if (model.actions) {
    // Execute actions func once with fake self to get the keys used for types
    const fakeSelf = { initialState: {} };
    types = Object.keys(model.actions(fakeSelf)).reduce((acc, actionName) => {
      acc[actionName] = `${model.name}/${actionName}`;
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
  let selectors = Object.keys(model.state).reduce((acc, key) => {
    acc[`get${capitalize(key)}`] = state => state[model.name][key];
    return acc;
  }, {});

  // Add selectors defined by user
  if (model.selectors) {
    const customSelectors = model.selectors({ name: model.name }) || {};
    selectors = { ...selectors, ...customSelectors };
  }

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
          `There is no dependendy called '${dep}' for ${model.name} model.` // eslint-disable-line
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
    if (model.actions) {
      const own = model.actions({ initialState: model.state }) || {};
      // Modify reducer obj keys to match with types
      const ownCorrect = Object.entries(own).reduce((acc, [key, val]) => {
        acc[`${model.name}/${key}`] = val;
        return acc;
      }, {});
      reducerObj = { ...reducerObj, ...ownCorrect };
    }

    // Run duck reactions function to get rest of the reducer
    if (model.reactions) {
      const fromDeps =
        model.reactions({
          initialState: model.state,
          deps: dependencies,
        }) || {};
      reducerObj = { ...reducerObj, ...fromDeps };
    }

    reducer = handleActions(reducerObj, model.state);

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

/**
 * Create ducks.
 * @param {Duck[]} ducks
 * @returns {Object.<string, Duck>}
 */
export const createDucks = (ducks = []) => {
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
