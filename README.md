<p align='center'>
  <br><br><br>
  <img src="logo.png" alt="reducktion logo" width="400"/>
  <br><br><br>
<p/>

_A small helper library for Redux to reduce boilerplate and enforce a more modular architecture by following the ducks pattern._

<br>

* 🦆 **Modular architecture.**
* 🔮 **Less boilerplate.**
* 💉 **Inject dependencies easily.**
* ✨ **Includes async data fetching helpers.**

<br>

---

Inspiration: [Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux).

---

* [Installation](#installation)
* [The Idea](#the-idea)
* [Usage](#usage)
* [Dependency injection](#dependency-injection)
* [Usage with redux-thunk](#usage-with-redux-thunk)
* [Usage with redux-saga](#usage-with-redux-saga)
* [Example with everything](#example-with-everything)
* [Advanced](#advanced)
* [TypeScript](#typescript)
* [Other similar libraries](#other-similar-libraries)
* [Caveats](#caveats)

# reducktion

![npm](https://img.shields.io/npm/v/reducktion.svg)
![Travis (.org) branch](https://img.shields.io/travis/Temzasse/reducktion/master.svg)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
[![Open Source Love png2](https://badges.frapsoft.com/os/v2/open-source.png?v=103)](https://github.com/ellerbrock/open-source-badges/)

## Installation

```sh
npm install reducktion
```

or

```sh
yarn add reducktion
```

## The Idea

Redux gets it's fair share of critisism for the amount of boilerplate that is usually
required to setup your action types, action creators, reducers, selectors, async behaviour, etc.

However, in many cases it is possible to avoid this unnecessary boilerplate by rethinking the architecture of your redux entities. One popular approach is so called ducks pattern that combines all the entities into a one file, a model module. A model module should only concern one feature of your app. This means that you don't have separate folders or even files for your actions, reducers, sagas etc. instead you split everything by feature so you end up with folders like **user**, **order**, **auth** that encapsulate everything related to that feature.

Reducktion is a customized implementation of the ducks pattern and it aims to help you manage your redux entities
in a more modular way while providing some additional utilities such as [dependency injection](#dependency-injection).

## Usage

reducktion minimizes the amount of boilerplate by firstly skipping manually defining action types entirely, and secondly merging actions and reducers together.

```javascript
// order.model.js

import { createModel } from 'reducktion';

export default createModel({
  // Name of the model
  name: 'order',

  // Initial state
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },

  // Actions / reducers combined for less boilerplate 🎉
  actions: () => ({
    fetchOrders: state => ({
      ...state,
      isLoading: true,
    }),
    failFetchOrders: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    receiveOrders: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
  }),
});
```

**Okay but wait, where are my selectors?!**

By default reducktion will provide you a handy helper selector creator function `get` if you don't want to manually create your own selector functions.

```javascript
const getOrders = model.selectors.get('orders');
const orders = getOrders(state);

// OR simply
const orders = model.selectors.get('orders')(state);
```

Creating your own selectors is really easy though:

```javascript
// order.model.js

import { createModel } from 'reducktion';

export default createModel({
  name: 'order',
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },
  selectors: ({ name, selectors }) => ({
    getOrders: state => state[name].orders,
    getIsLoading: state => state[name].isLoading,
    getHasError: state => state[name].hasError,
    // Composing selectors is also easy
    getComposed: state => {
      const isLoading = selectors.getIsLoading(state);
      const orders = selectors.getOrders(state);
      if (isLoading || orders.length === 0) return [];
      return orders.filter(o => o.something !== 'amazing');
    },
  }),
  actions: () => ({
    fetchOrders: state => ({ ... }),
    failFetchOrders: state => ({ ... }),
    receiveOrders: (state, action) => ({ ... }),
  }),
});
```

Finally in the place where you combine your reducers and create the store:

```javascript
import { createStore, combineReducers } from 'redux';
import { initModels } from 'reducktion';
import orderModel from '../order/order.model';

const models = initModels([orderModel /* other models... */]);
const rootReducer = combineReducers(models.allReducers);
const store = createStore(rootReducer, initialState);
```

Then we can use the model in a React component.

```javascript
import { connect } from 'react-redux';
import orderModel from './order.model';

class SomeComponent extends Component {
  componentDidMount() {
    this.props.fetchOrders();
  }

  render() {
    const { isLoading, orders } = this.props;

    if (isLoading) {
      return <span>Loading orders...</span>;
    }

    return (
      <div>
        {orders.map(order => (
          /* render order here */
        ))}
      </div>
    )
  }
}

export default connect(
  state => ({
    orders: orderModel.selectors.get('orders')(state),
    isLoading: orderModel.selectors.get('isLoading')(state),
    // OR if you have defined you own selectors
    orders: orderModel.selectors.getOrders(state),
    isLoading: orderModel.selectors.getIsLoading(state),
  }),
  {
    fetchOrders: orderModel.actions.fetchOrders,
  }
)(SomeComponent);
```

That's it!

You have encapsulated the Redux related logic of a feature called `order` into a model that follows the ducks pattern 🦆 👏 🎉

## Dependency injection

It is possible to inject models without you having to manually import the model file. This fixes potential circular dependency issue between related models.

You can give any number of model names to `inject` and they will be provided to the model inside the various handlers like `actions`, `reactions` or `sagas`.

In the below example we fetch user's orders after successful login.

```javascript
import { createModel } from 'reducktion';

const model = createModel({
  name: 'order',
  inject: ['user'],
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },
  actions: () => ({
    fetchOrders: state => ({ ... }),
    failFetchOrders: state => ({ ... }),
    receiveOrders: (state, action) => ({ ... }),
  }),
  sagas: ({ types, deps }) => [
    takeEvery(types.fetchOrders, fetchOrdersSaga),
    // Listen to user's `loginSuccess` action
    takeEvery(deps.user.types.loginSuccess, fetchOrdersSaga),
  ],
});

function* fetchOrdersSaga() {
  // API calls etc.
}
```

You can also react to the actions dispatched by any injected models and update model's own state accordingly with the help of `reactions`:

```js
createModel({
  name: 'order',
  inject: ['user'],
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },
  actions: () => ({ ... }),
  // Clear orders after user logs out
  reactions: ({ deps }) => ({
    [deps.user.types.logout]: state => ({ ...state, orders: [] }),
  }),
});
```

## Usage with redux-thunk

Using [redux-thunk](https://github.com/reduxjs/redux-thunk) is fairly simple: you only need to provide the thunk functions alongside with the other actions.

```javascript
import { createModel } from 'reducktion';

const model = createModel({
  name: 'settings',
  inject: ['user'],
  state: {
    notificationsEnabled: false,
    gpsEnabled: false,
    darkModeEnabled: false,
  },
  selectors: ({ name }) => ({ ... }),
  actions: ({ initialState }) => ({
    resetSettings: () => ({ ...initialState }),
    toggleNotifications: state => ({ ... }),
    toggleGps: state => ({ ... }),
    toggleDarkMode: state => ({
      ...state,
      darkModeEnabled: !state.darkModeEnabled,
    }),
  }),
  thunks: {
     // Thunks here
    someThunk,
    otherThunkWithInjects,
  },
});

// Thunks
function someThunk(args) {
  return async dispatch => {
    await api.doSomeAsyncWork(args);
    dispatch(model.actions.toggleDarkMode());
  };
}

// Injected models are provided as the last argument
function otherThunkWithInjects(args, deps) {
  return async (dispatch, getState) => {
    const state = getState();
    const id = deps.user.selectors.getId(state);
    await api.doSomeOtherAsyncWork(args, id);
    // ...rest of the logic...
  };
}

export default model;
```

## Usage with redux-saga

It is also possible to use [redux-saga](https://github.com/redux-saga/redux-saga) with reducktion by defining the list of saga watchers that should react to corresponding actions.

Note that reducktion has no dependency of redux-saga to keep the library size small! So, you need to install redux-saga yourself and import all the helpers you need from it.

Let's look at a simple example:

```javascript
import { createModel } from 'reducktion';
import { takeEvery, takeLatest, put, call } from 'redux-saga/effects';

const model = createModel({
  name: 'order',
  inject: ['user'],
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },
  actions: () => ({
    fetchOrders: state => ({
      ...state,
      isLoading: true,
    }),
    failFetchOrders: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    receiveOrders: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
  }),
  sagas: ({ types, deps }) => [
    takeEvery(types.fetchOrders, fetchOrdersSaga),
    takeLatest(deps.user.types.logout, someOtherSaga, deps),
  ],
});

function* fetchOrdersSaga() {
  try {
    const orders = yield call(api.fetchOrders);
    yield put(model.actions.receiveOrders(orders));
  } catch (e) {
    yield put(model.actions.failFetchOrders(orders));
  }
}

// Note that dependencies are provided as the first argument
function* someOtherSaga(deps, action) {
  // do something with the action / deps
}

export default model;
```

Finally, you need to create the models, combine your sagas, and run the root saga.

```javascript
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import { initModels } from 'reducktion';

import userModel from '../user/user.model';
import orderModel from '../order/order.model';

const models = initModels([userModel, orderModel]);
const rootReducer = combineReducers(models.allReducers);

// Start all sagas
function* rootSaga() {
  yield all(models.allSagas);
}

/*
A more manual way to do the same:

const { user, order } = initModels([userModel, orderModel]);

const rootReducer = combineReducers({
  [user.name]: user.getReducer(),
  [order.name]: order.getReducer(),
});

// Start all sagas
function* rootSaga() {
  yield all([...user.getSagas(), ...order.getSagas()]);
}
*/

const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware);
const store = createStore(rootReducer, initialState, enhancer);

sagaMiddleware.run(rootSaga);
```

## Example with everything

Let's cram all the goodness into a single model so you can see everything in one place 😎

```javascript
import { createModel } from 'reducktion';
import { takeEvery, takeLatest, put, call } from 'redux-saga/effects';
import { createModel } from 'reducktion';
import { sleep } from './helpers';

const model = createModel({
  name: 'order',
  inject: ['user'],
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },
  actions: () => ({
    fetchOrders: state => ({
      ...state,
      isLoading: true,
    }),
    failFetchOrders: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    receiveOrders: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
  }),
  thunks: { archiveOrders }, // Some random thunk
  reactions: ({ deps }) => ({
    [deps.user.types.logout]: state => ({ ...state, orders: [] }),
  }),
  selectors: ({ name }) => ({
    getOrders: state => state[name].orders,
    getIsLoading: state => state[name].isLoading,
    getHasError: state => state[name].hasError,
  }),
  sagas: ({ types, deps }) => [
    takeEvery(types.fetchOrders, fetchOrdersSaga),
    takeEvery(deps.user.types.loginSuccess, fetchOrdersSaga),
  ],
});

// Thunks
function archiveOrders(args, deps) {
  return async dispatch => {
    await api.doSomeAsyncWork(args);
    // Dispatch some actions etc.
    dispatch(deps.user.actions.logout()); // ¯\_(ツ)_/¯
  };
}

// Saga handlers
function* fetchOrdersSaga() {
  yield sleep(400);
  yield put(
    model.actions.receiveOrders([
      { id: 1, name: 'Mock order 1' },
      { id: 2, name: 'Mock order 2' },
      // ...
    ])
  );
}

export default model;
```

## Advanced

### `fetchable` data fetching helper

Nowadays, many websites are SPAs (Single Page Applications) and have to get some data from an API to show to the users.
This data fetching process usually consists of three stages: `loading the data`, `receiving the data`, and `handling errors`.

Reducktion provides some higher level helpers to make handling any API related actions less laborious.

Let's first see what we would normally need to create the necessary things for fetching some imaginary **orders** and taking into account the three stages mentioned earlier.

```js
import { createModel } from 'reducktion';

const model = createModel({
  name: 'order',
  state: {
    orders: [],
    status: 'INITIAL', // 'LOADING' | 'SUCCESS' | 'FAILURE'
    error: null,
  },
  actions: () => ({
    fetchOrders: state => ({
      ...state,
      status: 'LOADING',
    }),
    failFetchOrders: (state, action) => ({
      ...state,
      status: 'FAILURE',
      error: action.payload,
    }),
    receiveOrders: (state, action) => ({
      ...state,
      status: 'SUCCESS',
      error: null,
      orders: action.payload,
    }),
  }),
  sagas: ({ types }) => [takeEvery(types.fetchOrders, fetchOrdersSaga)],
});

// Sagas

function* fetchOrdersSaga() {
  try {
    const orders = yield call(api.fetchOrders);
    yield put(model.actions.receiveOrders(orders));
  } catch (error) {
    yield put(model.actions.failFetchOrders(error.message));
  }
}
```

That's quite a lot of setup / boilerplate for handling three stages of our data fetching flow.

Reducktion provides a helper called `fetchable` that can be used to create a fetchable state value and the same three actions as above baked into one enhanced action that behind the scenes updates the necessary state fields automatically by creating the individual reducers for you.

The simplest way to use `fetchable` is to just give `fetchable.action()` the name of state field where you want to save the data (eg. **'orders'**).
By default the auto-created reducers will update three fields during the different stages of the flow.

**`fetchable.action('field')`** returns enhanced action/reducers:

| Action                     | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `actionName()`             | Starts the fetchable flow and sets status to 'LOADING'.                              |
| `actionName.success(data)` | Finishes flow by setting status to 'SUCCESS' and saves the data to state             |
| `actionName.fail(error?)`  | Fails flow by setting status to 'FAILURE' and saves the optional error data to state |
| `actionName.init()`        | OPTIONAL: initialize flow without setting loading status                             |

Corresponding generated types are: `types.actionName`, `types.actionNameSuccess`, `types.actionNameFailure`, `types.actionNameInit`.

**`fetchable.value(initialValue)`** returns an object:

```javascript
{
  status: 'INITIAL', // Can also be: 'LOADING' | 'SUCCESS' | 'FAILURE',
  data: initialValue, // Will be the data payload from `action.success(data)`
  error: null, // Will be the error payload from `action.fail(error)`
}
```

Example:

```js
import { createModel, fetchable } from 'reducktion';

const model = createModel({
  name: 'order',
  state: {
    orders: fetchable.value([]),
    /* This creates the following data structure:
     * {
     *   data: [],
     *   status: 'INITIAL',
     *   error: null,
     * }
     */
  },
  actions: () => ({
    fetchOrders: fetchable.action('orders'),
    /* This creates the following actions:
     * fetchOrders()
     * fetchOrders.success()
     * fetchOrders.failure()
     * fetchOrders.init()
    */
  }),
  sagas: ({ types }) => [
    takeEvery(types.fetchOrders, fetchOrdersSaga),
    /* Generated fetchable types:
     * types.fetchOrders
     * types.fetchOrdersSuccess
     * types.fetchOrdersFailure
     * types.fetchOrdersInit
    */
  ],
});

// Sagas
function* fetchOrdersSaga() {
  try {
    // In real world you would fetch orders from some API
    const orders = [];
    yield put(model.actions.fetchOrders.success(orders));
  } catch (error) {
    yield put(model.actions.fetchOrders.fail(error.message));
  }
}

// And finally in some component you connect the action
connect(mapStateToProps, { fetchOrders: model.actions.fetchOrders });

// Dispatch action inside the component
this.props.fetchOrders();
```

However, in case you need more control over your `fetchable` state fields for the different stages you can achieve it by giving `fetchable.action()` a reducer definition object that is merged with the auto-created reducers.

```js
const model = createModel({
  // ...
  actions: () => ({
    fetchOrders: fetchable.action('orders', {
      loading: (state, action) => ({
        ...state,
        something: 'yey...',
      }),
      success: (state, action) => ({
        ...state,
        something: 'yey!',
      }),
      failure: (state, action) => ({
        ...state,
        something: ':(',
      }),
    }),
  }),
  // ...
});
```

The default behaviour for `fetchable.success` reducer is to always replace the whole `data` field with the action's payload, so under the hood the updater function is the following:

```js
const updater = (data, action) => action.payload;
```

However, often you don't simply want to replace the data field but insted merge it with the payload somehow. For these use cases it is possible to pass an updater function to the fetchable action as the third parameter. Note that you don't need to pass the reducer definition object if you don't need it - a simple `null` is just fine.

```js
const mergeUpdater = (data, action) => ({ ...data, ...action.payload });
const appendUpdater = (data, action) => [...data, ...action.payload];

const model = createModel({
  state: {
    ordersById: fetchable.value({}),
    otherField: fetchable.value([]),
  },
  actions: () => ({
    fetchOrders: fetchable.action('ordersById', null, mergeUpdater),
    fetchOtherField: fetchable.action('otherField', null, appendUpdater),
  }),
  // ...
});
```

In some cases your actions don't need to update the state in any way and you might just want to listen to the action in your sagas. For these cases Reducktion also provides a helper function `fetchable.noop()` that returns a no-op reducer so the action won't update the state but you can still the action type when setuping your saga watchers.

If you need to access the fetchable action types also in your `reactions` you can do it in the following way:

```js
const model = createModel({
  // ...
  inject: ['user'],
  reactions: ({ deps }) => ({
    [deps.user.types.fetchProfileLoading]: state => ({
      ...state,
      someField: 1,
    }),
    [deps.user.types.fetchProfileSuccess]: state => ({
      ...state,
      someField: 2,
    }),
    [deps.user.types.fetchProfileFailure]: state => ({
      ...state,
      someField: 3,
    }),
  }),
  // ...
});
```

Finally, if you are using [props-types](https://github.com/facebook/prop-types) you can define a tiny helper function to add make it easier to add prop types to fetchable values.

```js
import { FetchableStatus } from 'reducktion';

// Helper
const fetchablePropType = (dataPropType, errPropType = PropTypes.string) => {
  return PropTypes.shape({
    status: PropTypes.oneOf(Object.values(FetchableStatus)).isRequired,
    error: errPropType,
    data: dataPropType,
  }).isRequired;
};

// Using the helper
const propsTypes = {
  balanceItems: fetchablePropType(PropTypes.array.isRequired),
};
```

## TypeScript

Reducktion has a decent support for TypeScript (PRs welcome ❤). Adding basic typings should be quite straightforward but if you need to type every angle of your models it might take a bit more work. It would be nice to improve the typings so that more things could be inferred without manually defining your types (after all one of the goals of this library is to reduce boilerplate 😛).

Check the `.model.ts` files in the typed [examples](./example/typed/src/components/order/order.model.ts) to see how Reducktion can be used with TypeScript.

**TODO:** add more documentation about TypeScript.

## Other similar libraries

* [Redux Bundler](https://reduxbundler.com/)
* [List of various ducks pattern libs](https://github.com/erikras/models-modular-redux#implementation)

## Caveats

I have not used this library in any large scale projects yet - **SO USE IT AT YOUR OWN RISK!**

At this stage this project is merely my attempt to make working with Redux more pleasent, and in the future when I have used this library enough to be confident that it works as expected I will remove this note. However, I highly encourage you to give this library a go if it makes sense to you 🙂
