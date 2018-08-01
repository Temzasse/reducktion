<p align='center'>
  <br><br><br>
  <img src="logo.png" width="400"/>
  <br><br><br>
<p/>

*A small helper library for Redux to reduce boilerplate and enforce a more modular architecture by following the ducks pattern.*

* 🦆 **Modular architecture with ducks pattern.**
* 🔮 **Less boilerplate.**
* 💉 **Inject dependencies easily.**


---

Inspiration: [Ducks: Redux Reducer Bundles](https://github.com/erikras/ducks-modular-redux).

---

# Getting started

## Install

```sh
$ npm install reducktion
```

or

```sh
$ yarn add reducktion
```

## The Idea

Redux gets it's fair share of critisism for the amount of boilerplate that is
required to setup the different entities related to it: action types, action creators, reducers, selectors, handling async behaviour, etc.

More here...

## Usage

### Simple example

```javascript
import { createModel } from 'reducktion';

const model = createModel(
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
  // remember to call .create() in the end!
  .create();

export default model;
```

**Okay but wait, where are all my actions and selectors?!**

By default reducktion will auto generate actions based on the provided action types
and selectors based on the field names in your initial state object.

So, the non-auto-generatad version of the above example would look like this:

```javascript
import { createModel } from 'reducktion';

const model = createModel(
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
  .actions(({ types }) => {
    fetchOrders: types.FETCH_ORDERS,
    fetchOrdersFailed: types.FETCH_ORDERS_FAILED,
    receiveOrders: types.RECEIVE_ORDERS,
  })
  // define selectors manually
  .selectors(({ name }) => {
    getOrders: state => state[name].orders,
    getIsLoading: state => state[name].isLoading,
    getHasError: state => state[name].hasError,
  })
  .create();

export default model;
```

> Auto generating the actions and selectors is merely a nice-to-have convenience that you should not rely on in a bigger application since every time you change your state field name or action type name your actions / selectors **WILL CHANGE** respectfully! For example if you have a field called `loading` and you change it to `isLoading` the corresponding generated selector will change from `getLoading` to `getIsLoading`.

Finally in the place where you combine your reducers and create the store:

```javascript
import { createStore, combineReducers } from 'redux';
import { createDucks } from 'reducktion';
import orderDucks from '../order/order.ducks';

const { order } = createDucks([orderDucks /* other ducks... */]);

const rootReducer = combineReducers({
  [order.name]: order.getReducer(),
  // other duck reducers...
});

const store = createStore(rootReducer, initialState);
```

Finally, let's use the duck's model in a React component.

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

You have encapsulated the Redux related logic of a feature called `order` into a duck model.

## Dependency injection

Let's start with a short story:

It's very common that one duck model depends partially on some other duck model, and in extreme case they both depend on each other in some way! For example consider a situation where you want to fetch the existing orders of a user after he/she logs in so you import the `orderDucks` model into user duck model in order to use the `orderDucks.actions.fetchOrders()` after login. But you also want to clear the order's state after the user logs out so you import `userDucks` into order duck model to listen the `userDucks.types.LOGOUT` action type in the reducer. Now you have a circular dependency issue since both duck models are dependent on each other. When you run your app you will most likely get a `Uncaught TypeError: Cannot read property 'types' of undefined`.

Reducktion solves this issue by allowing you to define the dependencies that should be injected to the model via the `inject` method.
You can give any number of model names to `inject` and they will be provided to the model inside the various methods like `.reducer()`, `.actions()` or `.sagas()`.

In the below example we clear the orders in the state when the user logs out:

```javascript
import { createModel } from 'reducktion';

const model = createModel(
  'order',
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED'],
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
  .inject('user')
  .reducer(({ types, user }) => ({
    [types.FETCH_ORDERS]: state => ({
      ...state,
      isLoading: true,
    }),
    // ... other own reducers
    // then use injected user model
    [user.types.LOGOUT]: state => ({
      ...state,
      orders: [],
    }),
  }))
  .create();

export default model;
```

## Usage with redux-thunk

Something something...

```javascript
import { createModel } from 'reducktion';

const model = createModel(
  'settings',
  ['TOGGLE_NOTIFICATIONS', 'TOGGLE_GPS', 'UPDATE_THEME', 'RESET_SETTINGS'],
  {
    notificationsEnabled: false,
    gpsEnabled: false,
    selectedTheme: 'light',
  }
)
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
    // other actions are auto-generated, but define a thunk here
    someThunk,
  }))
  .create();

// Thunks
function someThunk(args) {
  return async dispatch => {
    await api.doSomeAsyncWork(args);
    dispatch(model.actions.updateTheme('dark'));
  };
}

export default model;
```

## Usage with redux-saga

Something something...

```javascript
import { createModel } from 'reducktion';
import { takeEvery, takeLatest, put } from 'redux-saga/effects';

const model = createModel(
  'order',
  ['FETCH_ORDERS', 'RECEIVE_ORDERS', 'FETCH_ORDERS_FAILED', 'OTHER'],
  {
    orders: [],
    isLoading: false,
    hasError: false,
  }
)
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
  .sagas(({ types }) => [
    takeEvery(types.FETCH_ORDERS, fetchOrdersSaga),
    takeLatest(types.OTHER, otherSaga)
  ])
  .create();

function* fetchOrdersSaga() {
  try {
    const orders = yield api.fetchOrders();
    yield put(model.actions.receiveOrders(orders));
  } catch (e) {
    yield put(model.actions.fetchOrdersFailed(orders));
  }
}

function* otherSaga() {
  // do something else
}

export default model;
```

Foobar...

```javascript
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { all } from 'redux-saga/effects';
import createSagaMiddleware from 'redux-saga';
import { createDucks } from 'reducktion';

import userDucks from '../user/user.ducks';
import orderDucks from '../order/order.ducks';

// Simple way:

const ducks = createDucks([userDucks, orderDucks]);

const rootReducer = combineReducers(ducks.allReducers);

// Start all sagas
function* rootSaga() {
  yield all(ducks.allSagas);
}

/*
A more manual way to do the same:

const { user, order } = createDucks([userDucks, orderDucks]);

const rootReducer = combineReducers({
  [user.name]: user.getReducer(),
  [order.name]: order.getReducer(),
});

// Start all sagas
function* rootSaga() {
  yield all([
    ...user.getSagas(),
    ...order.getSagas(),
  ]);
}
*/

const sagaMiddleware = createSagaMiddleware();
const enhancer = applyMiddleware(sagaMiddleware);
const store = createStore(rootReducer, initialState, enhancer);

sagaMiddleware.run(rootSaga);
```

## Example with everything

Let's cram all the goodness into one duck model.

```javascript
import { createModel } from 'reducktion';
import { takeEvery, takeLatest, put } from 'redux-saga/effects';

const model = createModel(
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
  .actions(({ types }) => {
    fetchOrders: types.FETCH_ORDERS,
    fetchOrdersFailed: types.FETCH_ORDERS_FAILED,
    receiveOrders: types.RECEIVE_ORDERS,
    fetchOrders, // or as a thunk
  })
  .selectors(({ name }) => {
    getOrders: state => state[name].orders,
    getIsLoading: state => state[name].isLoading,
    getHasError: state => state[name].hasError,
  })
  .sagas(({ types, user }) => [
    // Provide injected user model to saga handler too
    takeEvery(types.FETCH_ORDERS, fetchOrdersSaga, { user }),
  ])
  .create();

// Thunks

// Note that thunks automatically gain access to models dependencies
// they are provided as the last argument to the thunk function.
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
    const orders = yield api.fetchOrders();
    yield put(model.actions.receiveOrders(orders));
  } catch (e) {
    yield put(model.actions.fetchOrdersFailed(orders));
    // logout the user, just because.
    yield put(user.actions.logout());
  }
}

export default model;
```