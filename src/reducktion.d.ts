// Helper
type ArgumentType<F extends Function> = F extends (arg: infer A) => any
  ? A
  : never;

// Provide action keys for auto-complete but allow custom types
// that are eg. auto-generated by fetchable action
type ActionTypes<Actions> = { [K in keyof Actions]: string } & {
  [x: string]: string;
};

interface ActionCreator<Payload> {
  type: string;
  payload: Payload;
  [x: string]: any; // Allow additional meta fields
}

type ActionFunc<Payload = any> = (
  payload?: Payload
) => ActionCreator<Payload>;

type Thunk<Deps> = (
  arg: any,
  deps: Deps
) => (dispatch: any, getState: () => any, ...args: any[]) => Promise<void>;

type Reducer<State, Payload = any> = (
  state: State,
  action: ActionCreator<Payload>
) => State;

interface FetchableReducers<State> {
  loading: Reducer<State>;
  success: Reducer<State>;
  failure: Reducer<State>;
  clear: Reducer<State>;
}

type NoopReducer = (state: any) => any;

interface Fetchable {
  value: <T>(val: T) => FetchableValue<T>;
  action: <State, K extends keyof State>(
    // Only allow state fields for fetchable values
    stateField?: FetchableValue extends State[K] ? K : never,
    customReducers?: Partial<FetchableReducers<State>> | null,
    // TODO: can we provide better types here?
    dataUpdater?: (data: any, action: any) => any,
  ) => FetchableReducers<State>;
  noop: () => NoopReducer;
}

// TODO:
// Figure out how to show proper error
// if given action is not in keyof Actions
interface ModelDefinition<State, Actions, Selectors, Deps> {
  name: string;
  inject?: (keyof Deps)[];
  state: State;
  actions: (
    { initialState }: { initialState: State }
  ) => {
    // Only include those keys that are present in the action's interface
    [K in keyof Actions]: Actions[K] extends FetchableAction<any>
      ? FetchableReducers<State>
      : Actions[K] extends Function
      ? Reducer<State, ArgumentType<Actions[K]>>
      : never
  };
  reactions?: (
    { initialState, deps }: { initialState: State; deps: Deps }
  ) => {
    [depType: string]: Reducer<State>;
  };
  selectors?: (
    { name, selectors }: { name: string; selectors: Selectors }
  ) => Selectors;
  sagas?: (
    { types, deps }: { types: ActionTypes<Actions>; deps: Deps }
  ) => any[];
  // TODO: fix thunks...
  thunks?: {
    [thunkName: string]: Thunk<Deps>;
  };
}

interface Model<State, Actions, Selectors> {
  name: string;
  initialState: State;
  types: ActionTypes<Actions>;
  actions: Actions;
  selectors: Selectors & {
    get: <K extends keyof State>(
      stateField: K
    ) => (
      state: { [part: string]: any },
      ...args: any[]
    ) => Pick<State, K>[K];
    getAction: <K extends keyof Actions>(
      actionName: K
    ) => (
      state: { [part: string]: any },
      ...args: any[]
    ) => FetchableValueSimple;
  };
  getSagas: () => [];
  getReducer: () => Reducer<any>;
}

// EXPORTS ********************************************************************

export enum FetchableStatus {
  INITIAL,
  LOADING,
  SUCCESS,
  FAILURE,
}

export interface FetchableValueSimple {
  error: any;
  status: FetchableStatus;
}

export interface FetchableValue<Data = any> {
  data: Data;
  error: any;
  status: FetchableStatus;
}

export interface FetchableAction<SuccessData = any> extends ActionFunc {
  clear: ActionFunc;
  init: ActionFunc;
  fail: ActionFunc;
  success: ActionFunc<SuccessData>;
}

export const fetchable: Fetchable;

export function createModel<State, Actions, Selectors = {}, Deps = {}>(
  df: ModelDefinition<State, Actions, Selectors, Deps>
): Model<State, Actions, Selectors>;

export function initModels(
  models: Model<any, any, any>[]
): {
  allReducers: {
    [x: string]: Reducer<any>;
  };
  allSagas: any[];
} & {
  [modelName: string]: Model<any, any, any>;
};
