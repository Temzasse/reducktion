declare module 'reducktion' {
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

  interface ISelectors {
    [x: string]: (state: any) => any;
  }

  interface IThunks {
    [x: string]: (args: any, deps?: any) => any;
  }

  interface ITypes {
    [x: string]: string;
  }

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

  interface IActionReducers<S, A> {
    [x: string]: Reducer<S, any> | FetchableReducers<S>;
  }

  interface DuckDefinition<S, A> {
    name: string;
    inject?: string[];
    state: S;
    actions: ({ initialState }: { initialState: S }) => IActionReducers<S, A>;
    selectors?: ({ name }: { name: string }) => ISelectors;
    sagas?: ({ types, deps }: { types: ITypes; deps: any }) => any[];
    thunks?: IThunks;
    reactions?: (
      { initialState, deps }: { initialState: S; deps: any }
    ) => Reducer<S, any>;
  }

  interface Duck<S, A> {
    name: string;
    initialState: S;
    types: ITypes;
    actions: A;
    selectors: ISelectors;
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
    valField: K,
    customReducers?: Partial<FetchableReducers<S>>
  ): FetchableReducers<S>;

  export function fetchable<T>(val: T): IFetchable<T>;
}
