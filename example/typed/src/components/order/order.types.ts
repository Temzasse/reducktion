import { IFetchable, IFetchableAction } from 'reducktion';

// TODO: not sure if we should have types in a separate file (?)
// It kindah goes against the modular ducks principles...

export interface IOrder {
  id: number;
  name: string;
}

export interface IPackage {
  name: string;
}

export type FetchableOrders = IFetchable<IOrder[]>;

export interface IActions {
  fetchOrders: IFetchableAction<IOrder[]>;
  fetchPackages: IFetchableAction<IPackage[]>;
  fooAction: () => any;
}

export interface IState {
  foo: number;
  bar: string;
  orders: IFetchable<IOrder[]>;
  packages: IFetchable<IPackage[]>;
}
