# API documentation

## `createModel(name, types, initialState)`

| Arg              | Type       |
|------------------|------------|
| **name**         | `String`   |
| **types**        | `String[]` |
| **initialState** | `any`      |

Returns: duck model definition functions:

```
{
  actions: Function,
  reducer: Function,
  selectors: Function,
  sagas: Function,
  inject: Function,
  create: Function,
}
```

### `actions(fn)`

| Arg              | Type       | Description                      | Returns                              |
|------------------|------------|----------------------------------|--------------------------------------|
| **fn**           | `Function` | **fn** receives model's `types`. | actions: `Object.<String, Function>` |

NOTE: by default actions will be created automatically based on the model types!

Returns: duck model definition functions.

Example:

```js
.actions(({ types }) => {
  fetchOrders: types.FETCH_ORDERS,
})
```

If you provide a thunk function it will also receive the injected dependencies, see example [here](README.md#usage-with-redux-thunk).

### `reducer(fn)`

| Arg              | Type       | Description                                                                     | Returns                              |
|------------------|------------|---------------------------------------------------------------------------------|--------------------------------------|
| **fn**           | `Function` | **fn** receives model's `types`, `initialState`, and all injected dependencies. | reducer: `Object.<String, Function>` |

Returns: duck model definition functions.

Example:

```js
.reducer(({ types, user, initialState }) => ({
  [types.FETCH_ORDERS]: state => ({
    ...state,
    isLoading: true,
  }),
  [types.RECEIVE_ORDERS]: (state, action) => ({
    ...state,
    isLoading: false,
    hasError: false,
    orders: action.payload,
  }),
  [user.types.LOGOUT]: () => ({ ...initialState }),
}))
```

### `selectors(fn)`

| Arg              | Type       | Description                      | Returns                                |
|------------------|------------|----------------------------------|----------------------------------------|
| **fn**           | `Function` | **fn** receives model's `name`.  | selectors: `Object.<String, Function>` |

NOTE: by default selectors will be created automatically based on the initial state field names!

Returns: duck model definition functions.

Example:

```js
.selectors(({ name }) => ({
  getOrders: state => state[name].orders,
}))
```

Returns: duck model definition functions.

### `sagas(fn)`

| Arg              | Type       | Description                                                    | Returns                   |
|------------------|------------|----------------------------------------------------------------|---------------------------|
| **fn**           | `Function` | **fn** receives model's `types` and all injected dependencies. | sagas: `Array.<Function>` |

Returns: duck model definition functions.

Example:

```js
.sagas(({ types, user }) => [
  takeEvery([types.FETCH_ORDERS], fetchOrdersSaga),
  takeEvery([user.types.LOGIN], reactToLoginSaga, { user }),
])
```

See more detailed example [here](README.md#usage-with-redux-saga).

### `inject(...names)`

| Arg                                  | Type        | Description                          |
|--------------------------------------|-------------|--------------------------------------|
| **name1**, **name2**, **name3**, ... | `...String` | Model names that should be injected. |

Returns: duck model definition functions.

### `create()`

Returns:

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

## `createDucks`

TODO.