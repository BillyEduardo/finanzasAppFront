import { AccountType } from './enums';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currencyCode?: string;
  initialBalance?: number;
  isActive?: boolean;
  createdAt?: string;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  currencyCode?: string;
  initialBalance?: number;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: AccountType;
  currencyCode?: string;
  initialBalance?: number;
  isActive?: boolean;
}
