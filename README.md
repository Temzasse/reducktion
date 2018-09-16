<p align='center'>
  <br><br><br>
  <img src="logo.png" alt="Reducktion logo" width="400"/>
  <br><br><br>
<p/>

*A small helper library for Redux to reduce boilerplate and enforce a more modular architecture by following the ducks pattern.*

<br>

* 🦆 **Modular architecture with ducks pattern.**
* 🔮 **Less boilerplate.**
* 💉 **Inject dependencies easily.**

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
- [API](#api)
- [Other similar libraries](#other-similar-libraries)

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

Redux gets it's fair share of critisism for the amount of boilerplate that is sometimes
required to setup the different entities related to it: action types, action creators, reducers, selectors, handling async behaviour, etc.

However, in many cases it is possible to avoid this unnecessary boilerplate by rethinking the architecture of your redux entities. One popular approach is so called ducks pattern that combines all the entities into a one file, a duck module. A duck module should only concern one feature of your app, so the splitting happens at the feature level (user, order, auth etc) instead of the entity type level (action, reducer, saga etc).

Reducktion is a slightly customized implementation of the ducks pattern and it aims to help you manage your redux entities
in a more modular way while providing some additional utilities such as [dependency injection](dependency-injection).

## Usage

```javascript
// order.ducks.js

import { createDuck } from 'reducktion';

const model = createDuck(
  // model name
  'order',

  // action types
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED'],

  // initial state
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
  // define reducer
  .reducer(({ types }) => ({
    [types.FETCH_ORDERS]: state => ({
      ...state,
      isLoading: true,
    }),
    [types.FETCH_ORDERS_FAILED]: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    [types.RECEIVE_ORDERS]: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
  }))
  // remember to call .create() at the end!
  .create();

export default model;
```

**Okay but wait, where are all my actions and selectors?!**

By default reducktion will auto generate actions based on the provided action types
and selectors based on the field names in your initial state object.

So, the non-auto-generatad version of the above example would look like this:

```javascript
// order.ducks.js

import { createDuck } from 'reducktion';

const model = createDuck(
  'order',
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED'],
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
  .reducer(({ types }) => ({
    // ...
  }))
  // define actions manually
  .actions(({ types }) => ({
    fetchOrders: types.FETCH_ORDERS,
    fetchOrdersFailed: types.FETCH_ORDERS_FAILED,
    receiveOrders: types.RECEIVE_ORDERS,
  }))
  // define selectors manually (NOTE: name is 'order')
  .selectors(({ name }) => ({
    getOrders: state => state[name].orders,
    getIsLoading: state => state[name].isLoading,
    getHasError: state => state[name].hasError,
  }))
  .create();

export default model;
```

> Auto generating the actions and selectors is merely a nice-to-have convenience that you should not rely on in a bigger application since every time you change your state field name or action type name your actions / selectors **WILL CHANGE** respectfully! For example if you have a field called `loading` and you change it to `isLoading` the corresponding generated selector will change from `getLoading` to `getIsLoading`.

Finally in the place where you combine your reducers and create the store:

```javascript
import { createStore, combineReducers } from 'redux';
import { initDucks } from 'reducktion';
import orderDucks from '../order/order.ducks';

const ducks = initDucks([orderDucks /* other ducks... */]);
const rootReducer = combineReducers(ducks.allReducers);
const store = createStore(rootReducer, initialState);
```

Then we can use the duck's model in a React component.

```javascript
import { connect } from 'react-redux';
import orderDucks from '../order/order.ducks';

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
    orders: orderDucks.selectors.getOrders(state),
    isLoading: orderDucks.selectors.getIsLoading(state),
  }),
  {
    fetchOrders: orderDucks.actions.fetchOrders,
  }
)(SomeComponent);
```

That's it!

You have encapsulated the redux related logic of a feature called `order` into a duck model 👏 🎉

## Dependency injection

Let's start with a short story:

It's possible that one duck model depends partially on some other duck model, and in extreme case they both depend on each other in some way! For example consider a situation where you want to fetch the existing orders of a user after they log in so you import the `orderDucks` model into the user duck model in order to use it's `orderDucks.actions.fetchOrders()` after the user has logged in. But you also want to clear the order's state after the user logs out so you import `userDucks` into the order duck model to listen the `userDucks.types.LOGOUT` action type in the reducer function. Now you have a nasty circular dependency issue where both of the duck models depend on each other. When you run your app you will most likely get a `Uncaught TypeError: Cannot read property 'types' of undefined` or something similar since one of the duck models hasn't initialized completely before the other duck model attemps to use it.

Reducktion solves this issue by allowing you to define the dependencies that should be injected to the model via the `inject` method.

You can give any number of model names to `inject` and they will be provided to the model inside the various methods like `.reducer()`, `.actions()` or `.sagas()`.

In the below example we clear the orders in the state when the user logs out:

```javascript
import { createDuck } from 'reducktion';

const model = createDuck(
  'order',
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED'],
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
  // Also possible to inject many models eg: .inject('user', 'settings', 'order')
  .inject('user')

  // Then use the injected user
  .reducer(({ types, user }) => ({
    [types.FETCH_ORDERS]: state => ({
      ...state,
      isLoading: true,
    }),
    // ... other own reducers
    [user.types.LOGOUT]: state => ({
      ...state,
      orders: [],
    }),
  }))
  .create();

export default model;
```

## Usage with redux-thunk

Using [redux-thunk](https://github.com/reduxjs/redux-thunk) is fairly simple: you only need to provide the thunk functions alongside with the other action creators.

```javascript
import { createDuck } from 'reducktion';

const model = createDuck(
  'settings',
  ['TOGGLE_NOTIFICATIONS', 'TOGGLE_GPS', 'UPDATE_THEME', 'RESET_SETTINGS'],
  {
    notificationsEnabled: false,
    gpsEnabled: false,
    selectedTheme: 'light',
  }
)
  .inject('user')
  .reducer(({ types, initialState }) => ({
    [types.RESET_SETTINGS]: state => ({
      ...initialState,
    }),
    [types.TOGGLE_NOTIFICATIONS]: state => ({
      ...state,
      notificationsEnabled: !state.notificationsEnabled,
    }),
    [types.TOGGLE_GPS]: state => ({
      ...state,
      gpsEnabled: !state.gpsEnabled,
    }),
    [types.UPDATE_THEME]: (state, action) => ({
      ...state,
      theme: action.payload || 'light',
    }),
  }))
  .actions(({ types }) => ({
    // other actions are auto-generated, but define thunks here
    someThunk,
    otherThunkWithInjects
  }))
  .create();

// Thunks
function someThunk(args) {
  return async dispatch => {
    await api.doSomeAsyncWork(args);
    dispatch(model.actions.updateTheme('dark'));
  };
}

// Injected models are provided as the last argument
function otherThunkWithInjects(args, { user }) {
  return async (dispatch, getState) => {
    const state = getState();
    const id = user.selectors.getId(state);
    await api.doSomeOtherAsyncWork(args, id);
    // ...rest of the logic...
  };
}

export default model;
```

## Usage with redux-saga

It is also possible to use [redux-saga](https://github.com/redux-saga/redux-saga) with Reducktion by using the `.sagas` method of the model to define the list of saga watchers that should react to corresponding actions.

Note that Reducktion has no dependency of redux-saga to keep the library size small!
So, you need to install redux-saga yourself and import all the helpers you need from it.

Basically the `.sagas` method just provides you the necessary things (own types and dependencies) you need to bootstrap your sagas.

```javascript
import { createDuck } from 'reducktion';
import { takeEvery, takeLatest, put, call } from 'redux-saga/effects';

const model = createDuck(
  'order',
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED', 'OTHER'],
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
  .inject('user')
  .reducer(({ types }) => ({
    [types.FETCH_ORDERS]: state => ({
      ...state,
      isLoading: true,
    }),
    [types.FETCH_ORDERS_FAILED]: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    [types.RECEIVE_ORDERS]: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
  }))
  .sagas(({ types, user }) => [
    takeEvery(types.FETCH_ORDERS, fetchOrdersSaga),
    // You need to pass the `user` dependency forward to the saga handler
    takeLatest(types.OTHER, otherSaga, { user })
  ])
  .create();

function* fetchOrdersSaga() {
  try {
    const orders = yield call(api.fetchOrders);
    yield put(model.actions.receiveOrders(orders));
  } catch (e) {
    yield put(model.actions.fetchOrdersFailed(orders));
  }
}

// Note that dependencies are provided as the first argument
function* otherSaga({ user }) {
  // do something with user model
}

export default model;
```

Finally, you need to create the ducks, combine your sagas, and run the root saga.

```javascript
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import { initDucks } from 'reducktion';

import userDucks from '../user/user.ducks';
import orderDucks from '../order/order.ducks';

const ducks = initDucks([userDucks, orderDucks]);
const rootReducer = combineReducers(ducks.allReducers);

// Start all sagas
function* rootSaga() {
  yield all(ducks.allSagas);
}

/*
A more manual way to do the same:

const { user, order } = initDucks([userDucks, orderDucks]);

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

Let's cram all the goodness into a single duck model so you can see everything in one place 😎

```javascript
import { createDuck } from 'reducktion';
import { takeEvery, takeLatest, put, call } from 'redux-saga/effects';

const model = createDuck(
  'order',
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED'],
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
  .inject('user')
  .reducer(({ types, user, initialState }) => ({
    [types.FETCH_ORDERS]: state => ({
      ...state,
      isLoading: true,
    }),
    [types.FETCH_ORDERS_FAILED]: state => ({
      ...state,
      isLoading: false,
      hasError: true,
    }),
    [types.RECEIVE_ORDERS]: (state, action) => ({
      ...state,
      isLoading: false,
      hasError: false,
      orders: action.payload,
    }),
    // clear state when user logs out
    [user.types.LOGOUT]: () => ({ ...initialState }),
  }))
  .actions(({ types }) => ({
    fetchOrders: types.FETCH_ORDERS,
    fetchOrdersFailed: types.FETCH_ORDERS_FAILED,
    receiveOrders: types.RECEIVE_ORDERS,
    fetchOrders, // or as a thunk
  }))
  .selectors(({ name }) => ({
    getOrders: state => state[name].orders,
    getIsLoading: state => state[name].isLoading,
    getHasError: state => state[name].hasError,
  }))
  .sagas(({ types, user }) => [
    // Provide injected user model to saga handler too
    takeEvery(types.FETCH_ORDERS, fetchOrdersSaga, { user }),
  ])
  .create();

// Note that both thunks and sagas automatically gain access to models dependencies.
// For sagas they are provided as the first argument and for thunks as the last argument to the function.

// Thunks
function fetchOrders(args, { user }) {
  return async dispatch => {
    try {
      const orders = await api.fetchOrders(args);
      dispatch(model.actions.receiveOrders(orders));
    } catch (e) {
      dispatch(model.actions.fetchOrdersFailed());
      // logout the user, just because.
      dispatch(user.actions.logout());
    }
  };
}

// Sagas
function* fetchOrdersSaga({ user }, action) {
  try {
    const orders = yield call(api.fetchOrders);
    yield put(model.actions.receiveOrders(orders));
  } catch (e) {
    yield put(model.actions.fetchOrdersFailed(orders));
    // logout the user, just because.
    yield put(user.actions.logout());
  }
}

export default model;
```

## API

Check out the more detailed [API documentation](API.md).

## Other similar libraries

- [Redux Bundler](https://reduxbundler.com/)
- [List of various ducks libs](https://github.com/erikras/ducks-modular-redux#implementation)
