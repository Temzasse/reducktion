<p align='center'>
  <br><br><br>
  <img src="logo.png" alt="Reducktion logo" width="400"/>
  <br><br><br>
<p/>

_A small helper library for Redux to reduce boilerplate and enforce a more modular architecture by following the ducks pattern._

<br>

- 🦆 **Modular architecture with ducks pattern.**
- 🔮 **Less boilerplate.**
- 💉 **Inject dependencies easily.**

<br>

---

Inspiration: [Ducks: Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux).

---

- [Getting started](#getting-started)
  - [Installation](#installation)
  - [The Idea](#the-idea)
  - [Usage](#usage)
- [Dependency injection](#dependency-injection)
- [Usage with redux-thunk](#usage-with-redux-thunk)
- [Usage with redux-saga](#usage-with-redux-saga)
- [Example with everything](#example-with-everything)
- [Advanced](#advanced)
- [API](#api)
- [Other similar libraries](#other-similar-libraries)
- [Caveats](#caveats)

# reduktion

![npm](https://img.shields.io/npm/v/reducktion.svg)
![Travis (.org) branch](https://img.shields.io/travis/Temzasse/reducktion/master.svg)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
[![Open Source Love png2](https://badges.frapsoft.com/os/v2/open-source.png?v=103)](https://github.com/ellerbrock/open-source-badges/)

## Installation

```sh
$ npm install reducktion
```

or

```sh
$ yarn add reducktion
```

## The Idea

Redux gets it's fair share of critisism for the amount of boilerplate that is usually
required to setup your action types, action creators, reducers, selectors, async behaviour, etc.

However, in many cases it is possible to avoid this unnecessary boilerplate by rethinking the architecture of your redux entities. One popular approach is so called ducks pattern that combines all the entities into a one file, a duck module. A duck module should only concern one feature of your app. This means that you don't have separate folders or even files for your actions, reducers, sagas etc. instead you split everything by feature so you end up with folders like **user**, **order**, **auth** that encapsulate everything related to that feature.

Reducktion is a customized implementation of the ducks pattern and it aims to help you manage your redux entities
in a more modular way while providing some additional utilities such as [dependency injection](dependency-injection).

## Usage

Reducktion minimizes the amount of boilerplate by firstly skipping manually defining action types entirely, and secondly merging actions and reducers together.

```javascript
// order.duck.js

import { createDuck } from 'reducktion';

export default createDuck({
  // Name of the duck
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

By default reducktion will auto generate selectors based on the field names in your initial state object. Also it provides you a handy helper selector `get` with the fields name if you don't fancy auto-generated selectors.

So, the non-auto-generatad version of the above example would look like this:

```javascript
// order.duck.js

import { createDuck } from 'reducktion';

export default createDuck({
  name: 'order',
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
  },
  selectors: ({ name }) => ({
    getOrders: state => state[name].orders,
    getIsLoading: state => state[name].isLoading,
    getHasError: state => state[name].hasError,
  }),
  actions: () => ({
    fetchOrders: state => ({ ... }),
    failFetchOrders: state => ({ ... }),
    receiveOrders: (state, action) => ({ ... }),
  }),
});
```

> Auto generating the selectors is merely a nice-to-have convenience that you should not rely on in a bigger application since every time you change your state field name selectors **WILL CHANGE** respectfully! For example if you have a field called `loading` and you change it to `isLoading` the corresponding generated selector will change from `getLoading` to `getIsLoading`. So a more robust option is to define selectors by yourself or use the `get` helper selector.

Finally in the place where you combine your reducers and create the store:

```javascript
import { createStore, combineReducers } from 'redux';
import { initDucks } from 'reducktion';
import orderDuck from '../order/order.duck';

const ducks = initDucks([orderDuck /* other ducks... */]);
const rootReducer = combineReducers(ducks.allReducers);
const store = createStore(rootReducer, initialState);
```

Then we can use the duck in a React component.

```javascript
import { connect } from 'react-redux';
import orderDuck from './order.duck';

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
    orders: orderDuck.selectors.getOrders(state),
    isLoading: orderDuck.selectors.getIsLoading(state),
    // OR:
    orders: orderDuck.selectors.get('orders', state),
    isLoading: orderDuck.selectors.get('isLoading', state),
  }),
  {
    fetchOrders: orderDuck.actions.fetchOrders,
  }
)(SomeComponent);
```

That's it!

You have encapsulated the Redux related logic of a feature called `order` into a duck 🦆 👏 🎉

## Dependency injection

Reducktion can inject other ducks into other ducks so you can easily use them without manually importing the duck file. This fixes potential circular dependency issue between related ducks.

You can give any number of duck names to `inject` and they will be provided to the duck inside the various methods like `.actions()`, `.reactions()` or `.sagas()`.

In the below example we fetch user's orders after successful login.

```javascript
import { createDuck } from 'reducktion';

const duck = createDuck({
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
    takeEvery([types.fetchOrders], fetchOrdersSaga),
    // Listen to user's `loginSuccess` action
    takeEvery([deps.user.types.loginSuccess], fetchOrdersSaga),
  ],
});

function* fetchOrdersSaga() {
  // API calls etc.
}
```

You can also react to the actions dispatched by any injected ducks and update duck's own state accordingly with the help of `reactions`:

```js
createDuck({
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
import { createDuck } from 'reducktion';

const duck = createDuck({
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
    dispatch(duck.actions.toggleDarkMode());
  };
}

// Injected ducks are provided as the last argument
function otherThunkWithInjects(args, deps) {
  return async (dispatch, getState) => {
    const state = getState();
    const id = deps.user.selectors.getId(state);
    await api.doSomeOtherAsyncWork(args, id);
    // ...rest of the logic...
  };
}

export default duck;
```

## Usage with redux-saga

It is also possible to use [redux-saga](https://github.com/redux-saga/redux-saga) with Reducktion by defining the list of saga watchers that should react to corresponding actions.

Note that Reducktion has no dependency of redux-saga to keep the library size small! So, you need to install redux-saga yourself and import all the helpers you need from it.

Let's look at a simple example:

```javascript
import { createDuck } from 'reducktion';
import { takeEvery, takeLatest, put, call } from 'redux-saga/effects';

const duck = createDuck({
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
    takeEvery([types.fetchOrders], fetchOrdersSaga),
    takeLatest([deps.user.types.logout], someOtherSaga, deps),
  ],
});

function* fetchOrdersSaga() {
  try {
    const orders = yield call(api.fetchOrders);
    yield put(duck.actions.receiveOrders(orders));
  } catch (e) {
    yield put(duck.actions.failFetchOrders(orders));
  }
}

// Note that dependencies are provided as the first argument
function* someOtherSaga(deps, action) {
  // do something with the action / deps
}

export default duck;
```

Finally, you need to create the ducks, combine your sagas, and run the root saga.

```javascript
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import { initDucks } from 'reducktion';

import userDuck from '../user/user.duck';
import orderDuck from '../order/order.duck';

const ducks = initDucks([userDuck, orderDuck]);
const rootReducer = combineReducers(ducks.allReducers);

// Start all sagas
function* rootSaga() {
  yield all(ducks.allSagas);
}

/*
A more manual way to do the same:

const { user, order } = initDucks([userDuck, orderDuck]);

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

Let's cram all the goodness into a single duck so you can see everything in one place 😎

```javascript
import { createDuck } from 'reducktion';
import { takeEvery, takeLatest, put, call } from 'redux-saga/effects';

import { takeEvery, put } from 'redux-saga/effects';
import { createDuck } from 'reducktion'; // eslint-disable-line
import { sleep } from '../../helpers';

const duck = createDuck({
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
    takeEvery([types.fetchOrders], fetchOrdersSaga),
    takeEvery([deps.user.types.loginSuccess], fetchOrdersSaga),
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
    duck.actions.receiveOrders([
      { id: 1, name: 'Mock order 1' },
      { id: 2, name: 'Mock order 2' },
      // ...
    ])
  );
}

export default duck;
```

## Advanced

### API actions helper

Nowadays, many websites are SPAs (Single Page Applications) and have to get some data from an API to show to the users.
This data fetching process usually consists of three stages: `loading the data`, `receiving the data`, and `handling errors`.

Reducktion provides some higher level helpers to make handling any API related actions
less laborious.

Let's first see what we would normally need to create the necessary things for fetching some imaginary **orders** and taking into account the three stages mentioned earlier.

```js
import { createDuck } from 'reducktion';

const duck = createDuck({
  name: 'order',
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
    error: null,
  },
  actions: () => ({
    fetchOrders: state => ({
      ...state,
      isLoading: true,
    }),
    failFetchOrders: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: true,
      error: action.payload,
    }),
    receiveOrders: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      error: null,
      orders: action.payload,
    }),
  }),
  sagas: ({ types }) => [takeEvery([types.fetchOrders], fetchOrdersSaga)],
});

// Sagas

function* fetchOrdersSaga() {
  try {
    const orders = yield call(api.fetchOrders);
    yield put(duck.actions.receiveOrders(orders));
  } catch (error) {
    yield put(duck.actions.failFetchOrders(error.message));
  }
}
```

That's quite a lot of setup / boilerplate for handling three stages of our API call.

Reducktion provides a helper action creator called `createApiAction` that can be used to create the same three actions as above baked into one enhanced action that behind the scenes updates the necessary state fields automatically by creating the individual reducers for you.

The simplest way to use `createApiAction` is to just give it the name of state field (eg. **orders**) where you want to save the data.
By default the auto-created reducers will also update three fields during the different stages of the API call.

| Action                 | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `action()`             | Starts the API request.                                        |
| `action.success(data)` | Finishes the API flow successfully and saves the data to state |
| `action.fail(error?)`  | Fails the API flow and saves the optional error data to state  |

| State field                  | Description                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `isLoading`                  | Set to `true` when the API call is initiated, and set to `false` after success / failure.                      |
| `hasError`                   | Set to `false` when when `action()` is called, and set to `true` when `action.fail()` is called.               |
| `error`                      | Set to `false` when when `action()` is called, and set to the param of `action.fail(error)` when it is called. |
| `orders` (or something else) | Updated with the data `action.success(data)` is called.                                                        |

Example:

```js
import { createDuck, createApiAction } from 'reducktion';

const duck = createDuck({
  name: 'order',
  state: {
    orders: [],
    isLoading: false,
    hasError: false,
    error: null,
  },
  actions: () => ({
    fetchOrders: createApiAction('orders'),
  }),
  sagas: ({ types }) => [takeEvery([types.fetchOrders], fetchOrdersSaga)],
});

// Sagas

function* fetchOrdersSaga() {
  try {
    // In real world you would fetch orders from some API
    const orders = [];
    yield put(duck.actions.fetchOrders.success(orders));
  } catch (error) {
    yield put(duck.actions.fetchOrders.fail(error.message));
  }
}
```

However, in case you need more control over your state fields for the different stages or want to add your own you can achieve it by giving `createApiAction` a reducer definition object.

> NOTE: if you choose to use reducer definition object you always **have to** provide the `success` reducer! Other reducers are optional.

```js
const duck = createDuck({
  // ...
  actions: () => ({
    fetchOrders: createApiAction({
      // REQUIRED!
      success: (state, action) => ({
        ...state,
        orders: action.payload,
        isLoading: false,
      }),
      // optional
      loading: (state, action) => ({
        ...state,
        isLoading: true,
        hasError: false,
        error: null,
      }),
      // optional
      failure: (state, action) => ({
        ...state,
        isLoading: false,
        hasError: true,
        error: action.payload,
      }),
    }),
  }),
  // ...
});
```

## API

> TODO: UPDATE API DOCS!

Check out the more detailed [API documentation](API.md).

## Other similar libraries

- [Redux Bundler](https://reduxbundler.com/)
- [List of various ducks libs](https://github.com/erikras/ducks-modular-redux#implementation)

## Caveats

I have not used this library in any large scale projects yet - **SO USE IT AT YOUR OWN RISK!**

At this stage this project is merely my attempt to make working with Redux more pleasent, and in the future when I have used this library enough to be confident that it works as expected I will remove this note. However, I highly encourage you to give this library a go if it makes sense to you 🙂
