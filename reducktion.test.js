import { createModel, createDucks } from './src/reducktion';

describe('createModel', () => {
  it('should create a simple model', () => {
    const model = createModel({
      name: 'test',
      state: {},
      actions: () => ({}),
    });
    expect(model).toBeDefined();
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

  it('should have generated selectors after creation', () => {
    const model = createModel({
      name: 'test',
      state: {
        field1: 1,
        field2: 2,
      },
      actions: () => ({
        testAction: state => ({ ...state, field1: 2, field2: 1 }),
      }),
    });
    expect(model.selectors.getField1).toBeDefined();
    expect(model.selectors.getField2).toBeDefined();
  });

  it('should accept sagas definition function', () => {
    const model = createModel({
      name: 'test',
      state: {
        field: 1,
      },
      actions: () => ({
        testAction: state => ({ ...state }),
      }),
      sagas: () => [],
    });
    expect(model.getSagas()).toBeDefined();
  });

  it('should throw if inject is not an array of model names', () => {
    expect(() => {
      createModel({
        name: 'test',
        inject: 123,
        state: {
          field: 1,
        },
        actions: () => ({
          testAction: state => ({ ...state }),
        }),
      });
    }).toThrowError(/array of dependency names/i);
  });

  it('should throw if injected model names are not strings', () => {
    expect(() => {
      createModel({
        name: 'test',
        inject: [123],
        state: {
          field: 1,
        },
        actions: () => ({
          testAction: state => ({ ...state }),
        }),
      });
    }).toThrowError(/names should be strings/i);
  });
});

describe('createDucks', () => {
  // eslint-disable-next-line
  it('should not return any individual ducks when no ducks are provided', () => {
    const ducks = createDucks();
    expect(Object.keys(ducks).sort()).toEqual(
      ['allReducers', 'allSagas'].sort()
    );
  });

  it('should create a duck with correct properties', () => {
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

    const { settings } = createDucks([model]);

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
      ['getCustomSelector', 'getNotificationsEnabled'].sort()
    );
    expect(settings.getSagas()).toEqual([]);
  });

  it('should create multiple ducks', () => {
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
    const ducks = createDucks([model1, model2]);
    expect(ducks.test1).toBeDefined();
    expect(ducks.test2).toBeDefined();
  });

  it('should inject other ducks as dependency', () => {
    const model1 = createModel({
      name: 'test1',
      state: {},
      actions: () => ({
        doSomething: undefined,
      }),
    });
    const model2 = createModel({
      name: 'test2',
      inject: ['test1'],
      state: {
        field: 1,
      },
      actions: ({ deps }) => ({
        [deps.test1.types.doSomething]: state => ({ ...state, field: 2 }),
      }),
    });
    const ducks = createDucks([model1, model2]);
    expect(ducks).toBeDefined();
  });

  it('should throw error if name of dependency is typoed in actions', () => {
    expect(() => {
      createModel({
        name: 'test1',
        inject: ['test2'],
        state: {
          field: 1,
        },
        actions: ({ deps }) => ({
          [deps.test3.types.doSomething]: state => ({ ...state, field: 2 }),
        }),
      });
    }).toThrowError(/could not create action types/i);
  });

  it('should throw error if incorrect dependency name is injected', () => {
    const model1 = createModel({
      name: 'test1',
      state: {},
      actions: () => ({
        doSomething: undefined,
      }),
    });
    const model2 = createModel({
      name: 'test2',
      inject: ['test3'],
      state: {
        field: 1,
      },
      actions: () => ({}),
    });

    expect(() => {
      createDucks([model1, model2]);
    }).toThrowError(/there is no dependendy called 'test3'/i);
  });
});
