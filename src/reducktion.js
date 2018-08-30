// @ts-check
import { createAction, handleActions } from 'redux-actions';
import { capitalize, isFunction, validateInject } from './helpers';

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
 * @param {Object.<string, any>} modelDefinition
 * @returns {Duck}
 */
export const createModel = modelDefinition => {
  if (!modelDefinition.name) {
    throw Error('Model should have a name');
  }

  if (modelDefinition.state && !modelDefinition.actions) {
    throw Error('Model with state should have reducers');
  }

  const dependencies = {};
  let { sagas } = modelDefinition;
  let types = {};
  let reducer;

  if (modelDefinition.inject) {
    validateInject(modelDefinition.inject);

    modelDefinition.inject.forEach(depName => {
      dependencies[depName] = null;
    });
  }

  // Create types from actions
  if (modelDefinition.actions) {
    /* eslint-disable */
    const fakeDeps = modelDefinition.inject
      ? modelDefinition.inject.reduce((acc, i) => {
          acc[i] = { types: {} };
          return acc;
        }, {})
      : {};
    /* eslint-enable */
    const fakeSelf = { deps: fakeDeps };

    let actionsExec;

    // Execute actions func once to get return object keys for action types
    try {
      actionsExec = modelDefinition.actions(fakeSelf) || {};
    } catch (e) {
      // Maybe some injected model was typoed
      if (modelDefinition.inject) {
        throw Error(
          `Could not create action types, invalid model name used in ${
            modelDefinition.name
          } actions`
        );
      } else {
        throw e;
      }
    }

    // Generate types from actions return object keys
    types = Object.keys(actionsExec)
      .filter(Boolean)
      .reduce((acc, actionName) => {
        acc[actionName] = `${modelDefinition.name}/${actionName}`;
        return acc;
      }, {});
  }

  // Create actions from generate types
  const actions = Object.entries(types).reduce((acc, [actionName, value]) => {
    if (isFunction(value)) {
      // Provide dependencies to thunks
      acc[actionName] = (...args) => value(...args, dependencies);
    } else if (typeof value === 'string') {
      // Just create normal action
      acc[actionName] = createAction(value);
    } else {
      throw Error(
        `Unknown type for action ${actionName} - expected a string or function.`
      );
    }
    return acc;
  }, {});

  // Auto-generate initial selectors for each state field
  const selectors = Object.keys(modelDefinition.state).reduce((acc, key) => {
    acc[`get${capitalize(key)}`] = state => state[modelDefinition.name][key];
    return acc;
  }, {});

  // Add selectors defined by user
  if (modelDefinition.selectors) {
    const userDefinedSelectors =
      modelDefinition.selectors({ name: modelDefinition.name }) || {};
    // @ts-ignore
    Object.entries(userDefinedSelectors).forEach(
      ([selectorName, selectorFn]) => {
        selectors[selectorName] = selectorFn;
      }
    );
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
          `There is no dependendy called '${dep}' for ${
            modelDefinition.name
          } model.` // eslint-disable-line
        );
      }
    });
  };

  /**
   * Run the curried reducer and sagas functions with the necessary data.
   */
  const _run = () => {
    // Run duck action functions with own types and dependencie to get reducer
    if (modelDefinition.actions) {
      const reducerObj =
        modelDefinition.actions({
          initialState: modelDefinition.state,
          deps: dependencies,
        }) || {};
      reducer = handleActions(reducerObj, modelDefinition.state);
    }

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
    name: modelDefinition.name,
    initialState: modelDefinition.state,
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
