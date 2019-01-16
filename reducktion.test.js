import {
  createModel,
  initModels,
  fetchable,
  fetchableAction,
  STATUSES,
} from './src/reducktion';

// TODO: fix tests related to auto-generated selectors!

describe('fetchable/fetchableAction', () => {
  it('should create fetchable value', () => {
    const f = fetchable([]);
    expect(f.data).toEqual([]);
    expect(f.status).toEqual(STATUSES.INITIAL);
    expect(f.error).toEqual(null);
  });

  it('should create description of fetchable action', () => {
    const fa = fetchableAction('orders');
    expect(fa.args).toEqual(['orders']);

    const fa2 = fetchableAction('orders', {
      loading: state => ({ ...state, some: 1 }),
    });
    expect(fa2.args[0]).toEqual('orders');
    expect(fa2.args[1].loading).toBeInstanceOf(Function);
  });
});

describe('createModel', () => {
  it('should create a model', () => {
    const model = createModel({
      name: 'test',
      state: { field: 1 },
      actions: () => ({
        doSomething: state => ({ ...state, field: state.field + 1 }),
      }),
    });
    expect(Object.keys(model).sort()).toEqual(
      [
        'name',
        'types',
        'actions',
        'selectors',
        'initialState',
        'getSagas',
        'getReducer',
        '_run',
        '_fillDeps',
      ].sort()
    );
  });

  it('should throw if no name is defined', () => {
    expect(() => {
      createModel({});
    }).toThrowError(/model should have a name/i);
  });

  it('should throw if state is defined but no reducers are defined', () => {
    expect(() => {
      createModel({ name: 'test', state: { field: 1 } });
    }).toThrowError(/model with state should have reducers/i);
  });

  describe('actions', () => {
    it('should have generated action types after creation', () => {
      const model = createModel({
        name: 'test',
        state: {},
        actions: () => ({
          testAction1: state => ({ ...state }),
          testAction2: undefined, // does not mutate state
        }),
      });
      expect(model.types).toEqual({
        testAction1: 'test/testAction1',
        testAction2: 'test/testAction2',
      });
    });

    it('should have generated actions after creation', () => {
      const model = createModel({
        name: 'test',
        state: {},
        actions: () => ({
          testAction1: state => ({ ...state }),
          testAction2: undefined, // does not mutate state
        }),
      });
      expect(model.actions.testAction1()).toEqual({ type: 'test/testAction1' });
      expect(model.actions.testAction2()).toEqual({ type: 'test/testAction2' });
    });
  });

  describe('selectors', () => {
    it('should select a state field with `get` helper function', () => {
      const initialState = { field: 1, another: 2 };
      const model = createModel({
        name: 'test',
        state: initialState,
        actions: () => ({ testAction: state => ({ ...state }) }),
      });
      const testState = { test: initialState };
      const val1 = model.selectors.get('field')(testState);
      const val2 = model.selectors.get('another')(testState);
      expect(val1).toEqual(1);
      expect(val2).toEqual(2);
    });

    it('should throw if non-existent key was used for `get` selector', () => {
      const model = createModel({
        name: 'test',
        state: { field: 1 },
        actions: () => ({ testAction: state => ({ ...state }) }),
      });
      expect(() => {
        model.selectors.get('wrong')({ test: { field: 1 } });
      }).toThrowError(/select a non-existent field 'wrong'/i);
    });
  });

  describe('sagas', () => {
    it('should accept sagas definition function', () => {
      const model = createModel({
        name: 'test',
        state: { field: 1 },
        actions: () => ({ testAction: state => ({ ...state }) }),
        sagas: () => [],
      });
      expect(model.getSagas()).toBeDefined();
    });
  });

  describe('inject', () => {
    it('should throw if inject is not an array of model names', () => {
      expect(() => {
        createModel({
          name: 'test',
          inject: 123,
          state: { field: 1 },
          actions: () => ({ testAction: state => ({ ...state }) }),
        });
      }).toThrowError(/array of dependency names/i);
    });

    it('should throw if injected model names are not strings', () => {
      expect(() => {
        createModel({
          name: 'test',
          inject: [123],
          state: { field: 1 },
          actions: () => ({ testAction: state => ({ ...state }) }),
        });
      }).toThrowError(/names should be strings/i);
    });
  });

  describe('thunks', () => {
    it('should accept thunks', () => {
      const testThunk = () => {};
      const model = createModel({
        name: 'test',
        state: { field: 1 },
        actions: () => ({ testAction: state => ({ ...state }) }),
        thunks: { testThunk },
      });
      expect(model.actions.testThunk).toBeDefined();
    });
  });

  describe('fetchableAction', () => {
    it('should create fetchable actions', () => {
      const model = createModel({
        name: 'test',
        state: {
          orders: fetchable([]),
        },
        actions: () => ({ testAction: fetchableAction('orders') }),
      });

      expect(model.actions.testAction).toBeDefined();
      expect(model.actions.testAction.success).toBeDefined();
      expect(model.actions.testAction.fail).toBeDefined();
      expect(model.actions.testAction.init).toBeDefined();

      expect(model.types.testAction).toEqual('test/testAction');
      expect(model.types.testActionInit).toEqual('test/testAction/init');
      expect(model.types.testActionSuccess).toEqual('test/testAction/success');
      expect(model.types.testActionFailure).toEqual('test/testAction/failure');

      const orders = {
        data: [],
        status: STATUSES.INITIAL,
        error: null,
      };

      const state = { test: { orders } };

      expect(model.selectors.get('orders')(state)).toEqual(orders);
    });

    it('should throw if fetchable action has no success field', () => {
      expect(() => {
        createModel({
          name: 'test',
          state: {
            orders: fetchable([]),
          },
          actions: () => ({ testAction: fetchableAction() }),
        });
      }).toThrowError(/you must provide the name of the field/i);
    });

    it('should not require initial data for fetchable', () => {
      const model = createModel({
        name: 'test',
        state: {
          orders: fetchable(),
        },
        actions: () => ({ testAction: fetchableAction('orders') }),
      });

      const orders = {
        data: undefined,
        status: STATUSES.INITIAL,
        error: null,
      };

      const state = { test: { orders } };

      expect(model.selectors.get('orders')(state).data).toEqual(undefined);
    });
  });
});

describe('initModels', () => {
  it('should not return any models when no models are provided', () => {
    const models = initModels();
    expect(Object.keys(models).sort()).toEqual(
      ['allReducers', 'allSagas'].sort()
    );
  });

  it('should create a model with correct properties', () => {
    const initialState = { notificationsEnabled: false };

    const model = createModel({
      name: 'settings',
      state: initialState,
      actions: () => ({
        toggleNotifications: state => ({
          ...state,
          notificationsEnabled: !state.notificationsEnabled,
        }),
      }),
      selectors: ({ name }) => ({
        getCustomSelector: state => state[name].notificationsEnabled,
      }),
      sagas: () => [],
    });

    const { settings } = initModels([model]);

    expect(Object.keys(settings).sort()).toEqual(
      [
        'name',
        'initialState',
        'types',
        'actions',
        'selectors',
        'getSagas',
        'getReducer',
      ].sort()
    );
    expect(settings.name).toEqual('settings');
    expect(settings.types).toEqual({
      toggleNotifications: 'settings/toggleNotifications',
    });
    expect(settings.initialState).toEqual(initialState);
    expect(Object.keys(settings.actions).sort()).toEqual([
      'toggleNotifications',
    ]);
    expect(Object.keys(settings.selectors).sort()).toEqual(
      ['get', 'getCustomSelector'].sort()
    );
    expect(settings.getSagas()).toEqual([]);
  });

  it('should create multiple models', () => {
    const model1 = createModel({
      name: 'test1',
      state: {},
      actions: () => ({}),
    });
    const model2 = createModel({
      name: 'test2',
      state: {},
      actions: () => ({}),
    });
    const models = initModels([model1, model2]);
    expect(models.test1).toBeDefined();
    expect(models.test2).toBeDefined();
  });

  it('should inject other models as dependency', () => {
    const model1 = createModel({
      name: 'test1',
      state: {},
      actions: () => ({ doSomething: undefined }),
    });
    const model2 = createModel({
      name: 'test2',
      inject: ['test1'],
      state: { field: 1 },
      actions: () => ({
        doSomethingElse: state => ({ ...state, field: 2 }),
      }),
      reactions: ({ deps }) => ({
        [deps.test1.types.doSomething]: state => ({ ...state, field: 3 }),
      }),
    });
    const models = initModels([model1, model2]);
    expect(models).toBeDefined();
  });

  it('should throw error if incorrect dependency name is injected', () => {
    const model1 = createModel({
      name: 'test1',
      state: {},
      actions: () => ({ doSomething: undefined }),
    });
    const model2 = createModel({
      name: 'test2',
      inject: ['test3'],
      state: { field: 1 },
      actions: () => ({}),
    });

    expect(() => {
      initModels([model1, model2]);
    }).toThrowError(/there is no dependendy called 'test3'/i);
  });

  it('should be able to use fetchable action types in reactions', () => {
    const model1 = createModel({
      name: 'test1',
      state: {
        data: fetchable([]),
        isAuthenticated: true,
      },
      actions: () => ({ testAction: fetchableAction('data') }),
    });

    const model2 = createModel({
      name: 'test2',
      inject: ['test1'],
      state: { field: 1 },
      actions: () => ({
        doSomethingElse: state => ({ ...state, field: 2 }),
      }),
      reactions: ({ deps }) => {
        expect(deps.test1.types.testAction).toEqual('test1/testAction');
        expect(deps.test1.types.testActionInit).toEqual(
          'test1/testAction/init'
        );
        expect(deps.test1.types.testActionSuccess).toEqual(
          'test1/testAction/success'
        );
        expect(deps.test1.types.testActionFailure).toEqual(
          'test1/testAction/failure'
        );
        return {
          [deps.test1.types.testAction]: () => ({ field: 0 }),
          [deps.test1.types.testActionSuccess]: () => ({ field: 2 }),
          [deps.test1.types.testActionFailure]: () => ({ field: 3 }),
        };
      },
    });

    const models = initModels([model1, model2]);

    expect(models).toBeDefined();
  });

  it('should accept overrides for fetchable action', () => {
    const model = createModel({
      name: 'test1',
      state: {
        orders: fetchable([]),
      },
      actions: () => ({
        testAction: fetchableAction('orders', {
          loading: state => ({ ...state, some1: 1 }),
          success: state => ({ ...state, some2: 2 }),
          failure: state => ({ ...state, some3: 3 }),
        }),
      }),
    });

    const models = initModels([model]);

    expect(models.allReducers.test1).toBeDefined();
  });
});
