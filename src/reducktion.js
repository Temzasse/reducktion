// @ts-check
import { createAction, handleActions } from 'redux-actions';

// Helpers -------------------------------------------------------------------

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
 * @typedef {Object} DuckFuncs
 * @property {Function} actions
 * @property {Function} selectors
 * @property {Function} reducer
 * @property {Function} sagas
 * @property {Function} inject
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

const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1);

const isFunction = f => f && {}.toString.call(f) === '[object Function]';

const camelCasedAction = action =>
  action
    .toLowerCase()
    .split('_')
    .reduce((acc, x, i) => (i === 0 ? acc + x : acc + capitalize(x)), '');

/**
 * Helper function to create prefixed types for a duck.
 * @param {string} prefix
 * @param {string[]} actionTypes
 * @returns {Types}
 */
function createTypes(prefix, actionTypes = []) {
  return actionTypes.reduce((acc, type) => {
    acc[type] = `${prefix}/${type}`;
    return acc;
  }, {});
}

function createActions(prefix, actionTypes) {
  return actionTypes.reduce((acc, type) => {
    const actionName = camelCasedAction(type);
    acc[actionName] = createAction(`${prefix}/${type}`);
    return acc;
  }, {});
}
// ---------------------------------------------------------------------------

/**
 * Creates a ducks model and returns chainable functions to define futher props.
 * @param {string} modelName
 * @param {string[]} typeList
 * @param {Object.<string, any>} initialState
 * @returns {DuckFuncs} Chainable duck functions
 */
export const createModel = (modelName, typeList, initialState) => {
  const funcs = {};
  const dependencies = {};

  const types = createTypes(modelName, typeList);

  // Auto-generate initial actions
  const actions = createActions(modelName, typeList);

  // Auto-generate initial selectors for each state field
  const selectors = Object.keys(initialState).reduce((acc, key) => {
    acc[`get${capitalize(key)}`] = state => state[modelName][key];
    return acc;
  }, {});

  let sagas;
  let reducer;

  /**
   * Creates action creators and thunks.
   * @param {Function} actionsFunc
   * @returns {DuckFuncs}
   */
  funcs.actions = actionsFunc => {
    const userDefinedActions = actionsFunc({ types }) || {};

    // @ts-ignore
    Object.entries(userDefinedActions).forEach(([actionName, value]) => {
      if (isFunction(value)) {
        // Provide dependencies to thunks
        actions[actionName] = (...args) => value(...args, dependencies);
      } else if (typeof value === 'string') {
        // Just create normal action
        actions[actionName] = createAction(value);
      } else {
        throw Error(
          `Unknown type for action ${actionName} - expected a string or function.` // eslint-disable-line
        );
      }
    });
    return funcs;
  };

  /**
   * Extends auto-generated selectors for the duck.
   * @param {Function} selectorsFunc
   * @returns {DuckFuncs}
   */
  funcs.selectors = selectorsFunc => {
    const userDefinedSelectors = selectorsFunc({ name: modelName }) || {};

    // @ts-ignore
    Object.entries(userDefinedSelectors).forEach(
      ([selectorName, selectorFn]) => {
        selectors[selectorName] = selectorFn;
      }
    );
    return funcs;
  };

  /**
   * Defines a curried function for reducer that is later provided with
   * types, initial state, and dependencies.
   * @param {Function} reducerFunc
   * @returns {DuckFuncs}
   */
  funcs.reducer = reducerFunc => {
    reducer = reducerFunc;
    return funcs;
  };

  /**
   * Defines a curried function for sagas that is later provided with
   * types, initial state, and dependencies.
   * @param {Function} sagasFunc
   * @returns {DuckFuncs}
   */
  funcs.sagas = sagasFunc => {
    sagas = sagasFunc;
    return funcs;
  };

  /**
   * Defines the dependencies of the duck which should be injected to it later.
   * @param {...string} deps
   * @returns {DuckFuncs}
   */
  funcs.inject = (...deps) => {
    deps.forEach(depName => {
      dependencies[depName] = null;
    });

    return funcs;
  };

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
          `There is no dependendy called '${dep}' for ${modelName} model.`
        );
      }
    });
  };

  /**
   * Run the curried reducer and sagas functions with the necessary data.
   */
  const _run = () => {
    // Run curried functions with own types and dependencies

    if (reducer) {
      const reducerObj =
        reducer({ types, initialState, ...dependencies }) || {};
      reducer = handleActions(reducerObj, initialState);
    }

    if (sagas) {
      sagas = sagas({ types, ...dependencies }) || [];
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

  /**
   * Collect and return all the properties of the duck.
   * @returns {Duck}
   */
  funcs.create = () => ({
    name: modelName,
    types,
    actions,
    selectors,
    initialState,
    getSagas,
    getReducer,
    _run,
    _fillDeps,
    _created: true,
  });

  return funcs;
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
    if (!duck._created) {
      throw Error(
        'Duck was not properly cretead before calling createDucks - did you forget to call .create()?' // eslint-disable-line
      );
    }

    duck._fillDeps(ducksByName);
    duck._run();

    // Users don't need these props so delete them
    delete duck._fillDeps;
    delete duck._run;
    delete duck._created;
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
