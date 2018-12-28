export enum STATUSES {
  INITIAL,
  LOADING,
  SUCCESS,
  FAILURE,
}

export interface IFetchable<T> {
  data: T;
  error: any;
  status: STATUSES;
}

type Selector<S> = (state: { [x: string]: S }) => any;

interface ISelectors<S> {
  [x: string]: Selector<S>;
}

interface IThunks {
  [x: string]: (args: any, deps?: any) => any;
}

// Provide action keys for auto-complete but allow custom types
// that are eg. auto-generated by fetchableAction
type Types<A> = { [K in keyof A]: string } & { [x: string]: string };

interface IAction<T = any> {
  type: string;
  payload?: T;
  [x: string]: any; // Allow additional meta fields
}

type Reducer<S, P> = (state: S, action: IAction<P>) => S;

type IActionCreator<T = any> = (payload?: T) => IAction<T>;

interface IActions {
  [x: string]: IActionCreator;
}

interface FetchableReducers<S> {
  loading: Reducer<S, any>;
  success: Reducer<S, any>;
  failure: Reducer<S, any>;
}

export interface IFetchableAction<S = any, F = any, I = any>
  extends IActionCreator {
  init: IActionCreator<I>;
  fail: IActionCreator<F>;
  success: IActionCreator<S>;
}

// Only include those keys that are present in the action's interface
type ActionReducers<S, A> = {
  [K in keyof A]: Reducer<S, any> | FetchableReducers<S>
};

interface DuckDefinition<S, A> {
  name: string;
  inject?: string[];
  state: S;
  actions: ({ initialState }: { initialState: S }) => ActionReducers<S, A>;
  selectors?: ({ name }: { name: string }) => ISelectors<S>;
  sagas?: ({ types, deps }: { types: Types<A>; deps: any }) => any[];
  thunks?: IThunks;
  reactions?: (
    { initialState, deps }: { initialState: S; deps: any }
  ) => Reducer<S, any>;
}

interface Duck<S, A> {
  name: string;
  initialState: S;
  types: Types<A>;
  actions: A;
  selectors: {
    // TODO: fix return type...
    // get: (stateField: keyof S) => (state: { [x: string]: S }) => any;
    get: (stateField: keyof S) => Selector<S>;
  } & {
    // TODO: can we infer the selector names somehow?
    [x: string]: () => Selector<S>;
  };
  getSagas: () => any;
  getReducer: () => any;
}

export function createDuck<S, A>(df: DuckDefinition<S, A>): Duck<S, A>;

interface IAllReducers {
  [x: string]: Reducer<any, any>;
}

// TODO: Not sure if these need to be typed properly...
interface InitedDucks {
  allReducers: IAllReducers;
  allSagas: any[];
  [x: string]: any; // Ducks by name - TODO: fix!
}

export function initDucks(ducks: Duck<any, any>[]): InitedDucks;

export function fetchableAction<S, K extends keyof S>(
  // Make sure state field is for a fetchable value
  stateField: S[K] extends IFetchable<any> ? K : never,
  customReducers?: Partial<FetchableReducers<S>>
): FetchableReducers<S>;

export function fetchable<T>(val: T): IFetchable<T>;
