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

  type Reducer<S, A> = (state: S, action?: A) => S;

  interface IActionReducers<S, A = any> {
    [x: string]: Reducer<S, A>;
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

  interface IAction<T> {
    type: string;
    payload?: T;
    [x: string]: any; // Allow additional meta fields
  }

  type IActionCreator<T = any> = (payload?: T) => IAction<T>;

  interface IActions {
    [x: string]: IActionCreator;
  }

  interface FetchableReducers<S = {}, A = any> {
    loading: Reducer<S, A>;
    success: Reducer<S, A>;
    failure: Reducer<S, A>;
  }

  export interface IFetchableAction<S = any, F = any, I = any>
    extends IActionCreator {
    init: IActionCreator<I>;
    fail: IActionCreator<F>;
    success: IActionCreator<S>;
  }

  interface DuckDefinition<S> {
    name: string;
    inject?: string[];
    state: S;
    actions: ({ initialState }: { initialState: S }) => IActionReducers<S>;
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

  export function createDuck<S = {}, A = IActions>(
    df: DuckDefinition<S>
  ): Duck<S, A>;

  interface IAllReducers {
    [x: string]: Reducer<any, any>;
  }

  interface InitedDucks {
    allReducers: IAllReducers;
    allSagas: any[];
    [x: string]: any; // Ducks by name - TODO: fix!
  }

  export function initDucks(ducks: Duck<any, any>[]): InitedDucks;

  export function fetchableAction(
    valField: string,
    customReducers?: FetchableReducers
  ): any;

  export function fetchable<T>(val: T): IFetchable<T>;
}
