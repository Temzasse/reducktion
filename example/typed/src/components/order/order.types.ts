import { Fetchable, FetchableAction } from 'reducktion';

// TODO: not sure if we should have types in a separate file (?)
// It kindah goes against the modular ducks principles...

export interface Order {
  id: number;
  name: string;
}

export interface Package {
  name: string;
}

export type FetchableOrders = Fetchable<Order[]>;

export interface State {
  foo: number;
  bar: string;
  orders: Fetchable<Order[]>;
  packages: Fetchable<Package[]>;
}

export interface Actions {
  fetchOrders: FetchableAction<Order[]>;
  fetchPackages: FetchableAction<Package[]>;
  fooAction: (lol: number) => any;
  lolAction: (lol: number) => any;
}

// export interface Selectors {
//   getFoo: (state: { [x: string]: State }) => any;
//   getOrdersCustom: (state: { [x: string]: State }) => any;
//   getBarYeyd: (state: { [x: string]: State }) => any;
// }
