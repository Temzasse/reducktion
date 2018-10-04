import { createDuck, initDucks, createApiAction } from './src/reducktion';

describe('createDuck', () => {
  it('should create a duck', () => {
    const duck = createDuck({
      name: 'test',
      state: { field: 1 },
      actions: () => ({
        doSomething: state => ({ ...state, field: state.field + 1 }),
      }),
    });
    expect(Object.keys(duck).sort()).toEqual(
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
      createDuck({});
    }).toThrowError(/duck should have a name/i);
  });

  it('should throw if state is defined but no reducers are defined', () => {
    expect(() => {
      createDuck({ name: 'test', state: { field: 1 } });
    }).toThrowError(/duck with state should have reducers/i);
  });

  describe('actions', () => {
    it('should have generated action types after creation', () => {
      const duck = createDuck({
        name: 'test',
        state: {},
        actions: () => ({
          testAction1: state => ({ ...state }),
          testAction2: undefined, // does not mutate state
        }),
      });
      expect(duck.types).toEqual({
        testAction1: 'test/testAction1',
        testAction2: 'test/testAction2',
      });
    });

    it('should have generated actions after creation', () => {
      const duck = createDuck({
        name: 'test',
        state: {},
        actions: () => ({
          testAction1: state => ({ ...state }),
          testAction2: undefined, // does not mutate state
        }),
      });
      expect(duck.actions.testAction1()).toEqual({ type: 'test/testAction1' });
      expect(duck.actions.testAction2()).toEqual({ type: 'test/testAction2' });
    });
  });

  describe('selectors', () => {
    it('should have generated selectors after creation', () => {
      const duck = createDuck({
        name: 'test',
        state: { field1: 1, field2: 2 },
        actions: () => ({ testAction: state => ({ ...state }) }),
      });

      const testState = { test: { field1: 1, field2: 2 } };
      expect(duck.selectors.getField1(testState)).toEqual(1);
      expect(duck.selectors.getField2(testState)).toEqual(2);
    });

    it('should select a state field with `get` helper function', () => {
      const duck = createDuck({
        name: 'test',
        state: { field: 1 },
        actions: () => ({ testAction: state => ({ ...state }) }),
      });
      const testState = { test: { field: 1 } };
      const val = duck.selectors.get('field', testState);
      expect(val).toEqual(1);
    });

    it('should throw if non-existent key was used for `get` selector', () => {
      const duck = createDuck({
        name: 'test',
        state: { field: 1 },
        actions: () => ({ testAction: state => ({ ...state }) }),
      });
      expect(() => {
        duck.selectors.get('wrong', { test: { field: 1 } });
      }).toThrowError(/select a non-existent field 'wrong'/i);
    });
  });

  describe('sagas', () => {
    it('should accept sagas definition function', () => {
      const duck = createDuck({
        name: 'test',
        state: { field: 1 },
        actions: () => ({ testAction: state => ({ ...state }) }),
        sagas: () => [],
      });
      expect(duck.getSagas()).toBeDefined();
    });
  });

  describe('inject', () => {
    it('should throw if inject is not an array of model names', () => {
      expect(() => {
        createDuck({
          name: 'test',
          inject: 123,
          state: { field: 1 },
          actions: () => ({ testAction: state => ({ ...state }) }),
        });
      }).toThrowError(/array of dependency names/i);
    });

    it('should throw if injected model names are not strings', () => {
      expect(() => {
        createDuck({
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
      const duck = createDuck({
        name: 'test',
        state: { field: 1 },
        actions: () => ({ testAction: state => ({ ...state }) }),
        thunks: { testThunk },
      });
      expect(duck.actions.testThunk).toBeDefined();
    });
  });

  describe('createApiAction', () => {
    it('should create api actions', () => {
      const duck = createDuck({
        name: 'test',
        state: {
          orders: [],
          isAuthenticated: true,
          loading: false,
          error: false,
        },
        actions: () => ({ testAction: createApiAction('orders') }),
      });

      expect(duck.actions.testAction).toBeDefined();
      expect(duck.actions.testAction.success).toBeDefined();
      expect(duck.actions.testAction.fail).toBeDefined();
    });

    it('should throw if api action has no success field', () => {
      expect(() => {
        createDuck({
          name: 'test',
          state: {
            orders: [],
            isAuthenticated: true,
            loading: false,
            error: false,
          },
          actions: () => ({ testAction: createApiAction() }),
        });
      }).toThrowError(/you must provide the name of the field/i);
    });
  });
});

describe('initDucks', () => {
  it('should not return any ducks when no ducks are provided', () => {
    const ducks = initDucks();
    expect(Object.keys(ducks).sort()).toEqual(
      ['allReducers', 'allSagas'].sort()
    );
  });

  it('should create a duck with correct properties', () => {
    const initialState = { notificationsEnabled: false };

    const duck = createDuck({
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

    const { settings } = initDucks([duck]);

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
      ['get', 'getCustomSelector', 'getNotificationsEnabled'].sort()
    );
    expect(settings.getSagas()).toEqual([]);
  });

  it('should create multiple ducks', () => {
    const duck1 = createDuck({
      name: 'test1',
      state: {},
      actions: () => ({}),
    });
    const duck2 = createDuck({
      name: 'test2',
      state: {},
      actions: () => ({}),
    });
    const ducks = initDucks([duck1, duck2]);
    expect(ducks.test1).toBeDefined();
    expect(ducks.test2).toBeDefined();
  });

  it('should inject other ducks as dependency', () => {
    const duck1 = createDuck({
      name: 'test1',
      state: {},
      actions: () => ({ doSomething: undefined }),
    });
    const duck2 = createDuck({
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
    const ducks = initDucks([duck1, duck2]);
    expect(ducks).toBeDefined();
  });

  it('should throw error if incorrect dependency name is injected', () => {
    const duck1 = createDuck({
      name: 'test1',
      state: {},
      actions: () => ({ doSomething: undefined }),
    });
    const duck2 = createDuck({
      name: 'test2',
      inject: ['test3'],
      state: { field: 1 },
      actions: () => ({}),
    });

    expect(() => {
      initDucks([duck1, duck2]);
    }).toThrowError(/there is no dependendy called 'test3'/i);
  });
});
