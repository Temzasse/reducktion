import { State as OrderState } from './order/order.model';
import { State as UserState } from './user/user.model';
import { State as SettingsState } from './settings/settings.model';

export interface InitialState {
  user: UserState;
  order: OrderState;
  settings: SettingsState;
}
