# API documentation

## NOTE: NOT UP-TO-DATE!

TODO: finish and make clearer!

## `createDuck(duckDefinition: Object)`

| Fields        | Type       |
| ------------- | ---------- |
| **name**      | `String`   |
| **inject**    | `String[]` |
| **state**     | `Object`   |
| **actions**   | `Function` |
| **reactions** | `Function` |
| **sagas**     | `Function` |

Returns: Duck.

```
{
  name: String,
  types: String[],
  actions: Object.<String, Function>,
  selectors: Object.<String, Function>,
  initialState: any,
  getSagas: Function,
  getReducer: Function,
}
```

### `actions: fn`

| Value  | Type       | Description                     |
| ------ | ---------- | ------------------------------- |
| **fn** | `Function` | **fn** receives `initialState`. |

Returns: actions / thunks that describe how state should be updated or `undefined` if state should not be updated.

Example:

```js
actions: ({ initialState }) => ({
  reset: state => ({ ...initialState }),
  fetchOrders: state => ({ ...state, updatedField: 'abc' }),
  // Actions that don't mutate state can be still listened in sagas / reactions
  someAction: undefined,
  someThunk,
});
```

Thunks it will also receive the injected dependencies, see example [here](README.md#usage-with-redux-thunk).

### `selectors: fn`

| Value  | Type       | Description             |
| ------ | ---------- | ----------------------- |
| **fn** | `Function` | **fn** receives `name`. |

NOTE: by default selectors will be created automatically based on the initial state field names!

Returns: selector functions for the duck plus automatically included `get` helper selector.

Example:

```js
selectors: ({ name }) => ({
  getOrders: state => state[name].orders,
});
```

### `sagas: fn`

| Value  | Type       | Description                                                    |
| ------ | ---------- | -------------------------------------------------------------- |
| **fn** | `Function` | **fn** receives model's `types` and all injected dependencies. |

Returns: array of saga watchers.

Example:

```js
sagas: ({ types, deps }) => [
  takeEvery([types.fetchOrders], fetchOrdersSaga),
  takeEvery([deps.user.types.login], reactToLoginSaga, deps),
];
```

See more detailed example [here](README.md#usage-with-redux-saga).

### `inject: String[]`

| Value                                         | Type       | Description                                  |
| --------------------------------------------- | ---------- | -------------------------------------------- |
| Array of duck names **name1**, **name2**, ... | `String[]` | Array of duck names that should be injected. |

## `initDucks(Duck[])`

TODO.
