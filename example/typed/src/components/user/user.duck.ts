import {
  createDuck,
  fetchableAction,
  fetchable,
  Fetchable,
  FetchableAction,
} from 'reducktion';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
}

export interface State {
  isAuthenticated: boolean;
  user: Fetchable<User | null>;
}

export interface Actions {
  fetchUser: FetchableAction<User>;
  logout: () => any;
}

const duck = createDuck<State, Actions>({
  name: 'user',
  state: {
    isAuthenticated: false,
    user: fetchable(null),
  },
  actions: ({ initialState }) => ({
    fetchUser: fetchableAction('user'),
    logout: () => ({ ...initialState }),
  }),
});

export type UserType = typeof duck;

export default duck;
