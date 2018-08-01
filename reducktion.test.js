import { createModel, createDucks } from './index';

describe('createModel', () => {
  it('should init a model', () => {
    const model = createModel('test', ['TEST'], {});
    expect(model).toBeDefined();
  });

  it('should have correct chainable functions', () => {
    const model = createModel('test', ['TEST'], {});
    expect(model).toHaveProperty('actions');
    expect(model).toHaveProperty('selectors');
    expect(model).toHaveProperty('reducer');
    expect(model).toHaveProperty('operations');
    expect(model).toHaveProperty('inject');
  });

  it('should create a model', () => {
    const model = createModel('test', ['TEST'], {}).create();
    expect(Object.keys(model).sort()).toEqual(
      [
        'name',
        'types',
        'actions',
        'selectors',
        'initialState',
        'getOperations',
        'getReducer',
        '_run',
        '_fillDeps',
        '_created',
      ].sort()
    );
  });

  it('should have generated types after creation', () => {
    const model = createModel('test', ['TEST', 'OTHER', 'FOO'], {}).create();
    expect(model.types).toEqual({
      TEST: 'test/TEST',
      OTHER: 'test/OTHER',
      FOO: 'test/FOO',
    });
  });

  it('should have generated actions after creation', () => {
    const model = createModel('test', ['SOMETYPE', 'OTHER_STUFF'], {}).create();
    expect(model.actions.sometype()).toEqual({ type: 'test/SOMETYPE' });
    expect(model.actions.otherStuff()).toEqual({ type: 'test/OTHER_STUFF' });
  });

  it('should have generated selectors after creation', () => {
    const model = createModel('test', ['TEST'], {
      someField: '1234',
      otherField: 'xyz',
    }).create();
    expect(model.selectors.getSomeField).toBeDefined();
    expect(model.selectors.getOtherField).toBeDefined();
  });

  it('should accept actions definition function', () => {
    const model = createModel('test', ['TEST', 'OTHER'], {})
      .actions(({ types }) => ({ customTest: types.TEST }))
      .create();
    expect(model.actions.customTest()).toEqual({ type: 'test/TEST' });
    expect(model.actions.other()).toEqual({ type: 'test/OTHER' });
  });

  it('should accept reducer definition function', () => {
    const model = createModel('test', ['TEST', 'OTHER'], { field: '123' })
      .reducer(({ types }) => ({
        [types.TEST]: 'foo',
      }))
      .create();
    expect(model.getReducer()).toBeDefined();
  });

  it('should accept operations definition function', () => {
    const model = createModel('test', ['TEST', 'OTHER'], { field: '123' })
      .operations(() => [])
      .create();
    expect(model.getOperations()).toBeDefined();
  });

  it('should throw error when unknown action is defined', () => {
    expect(() => {
      const model = createModel('test', ['TEST', 'OTHER'], {}).actions(() => ({
        incorrectAction: 1,
      }));
    }).toThrowError(/expected a string or function/);
  });
});

describe('createDucks', () => {
  it('should return empty object when no ducks are provided', () => {
    const ducks = createDucks();
    expect(ducks).toEqual({});
  });

  it('should create a duck with correct properties', () => {
    const name = 'settings';
    const types = ['TOGGLE_NOTIFICATIONS'];
    const initialState = { notificationsEnabled: false };

    const model = createModel(name, types, initialState)
      .reducer(({ types }) => ({
        [types.TOGGLE_NOTIFICATIONS]: state => ({
          ...state,
          notificationsEnabled: !state.notificationsEnabled,
        }),
      }))
      .actions(({ types }) => ({
        customToggleNotifications: types.TOGGLE_NOTIFICATIONS,
      }))
      .selectors(({ name }) => ({
        getCustomSelector: state => state[name].notificationsEnabled,
      }))
      .operations(() => [])
      .create();

    const { settings } = createDucks([model]);

    expect(Object.keys(settings).sort()).toEqual(
      [
        'name',
        'initialState',
        'types',
        'actions',
        'selectors',
        'getOperations',
        'getReducer',
      ].sort()
    );
    expect(settings.name).toEqual(name);
    expect(settings.types).toEqual({
      TOGGLE_NOTIFICATIONS: 'settings/TOGGLE_NOTIFICATIONS',
    });
    expect(settings.initialState).toEqual(initialState);
    expect(Object.keys(settings.actions).sort()).toEqual(
      ['toggleNotifications', 'customToggleNotifications'].sort()
    );
    expect(Object.keys(settings.selectors).sort()).toEqual(
      ['getCustomSelector', 'getNotificationsEnabled'].sort()
    );
    expect(settings.getOperations()).toEqual([]);
  });

  it('should throw error if model was not created before calling createDucks', () => {
    const model = createModel('test', ['TEST'], {});
    expect(() => {
      const ducks = createDucks([model]);
    }).toThrowError(/did you forget to call .create()/);
  });

  it('should create multiple ducks', () => {
    const model1 = createModel('test1', ['TEST1'], {}).create();
    const model2 = createModel('test2', ['TEST2'], {}).create();
    const ducks = createDucks([model1, model2]);
    expect(ducks.test1).toBeDefined();
    expect(ducks.test2).toBeDefined();
  });

  it('should inject other ducks as dependency', () => {
    const model1 = createModel('test1', ['TEST1'], {}).create();
    const model2 = createModel('test2', ['TEST2'], {})
      .inject('test1')
      .reducer(({ test1 }) => ({
        [test1.TEST1]: state => ({ ...state, foo: 1 }),
      }))
      .create();

    const ducks = createDucks([model1, model2]);
    expect(ducks).toBeDefined();
  });

  it('should throw error if name of dependency is typoed', () => {
    const model1 = createModel('test1', ['TEST1'], {}).create();
    const model2 = createModel('test2', ['TEST2'], {})
      .inject('test3')
      .reducer(({ test3 }) => ({
        [test3.TEST1]: state => ({ ...state, foo: 1 }),
      }))
      .create();

    expect(() => {
      const ducks = createDucks([model1, model2]);
    }).toThrowError(/There is no dependendy called 'test3'/);
  });
});
