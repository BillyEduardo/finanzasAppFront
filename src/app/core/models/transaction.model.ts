import { TransactionType } from './enums';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  occurredOn: string;
  accountId?: string | null;
  categoryId?: string | null;
  currencyCode?: string;
  description?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  occurredOn: string;
  accountId?: string | null;
  categoryId?: string | null;
  currencyCode?: string;
  description?: string | null;
  notes?: string | null;
}

export interface UpdateTransactionRequest {
  type?: TransactionType;
  amount?: number;
  occurredOn?: string;
  accountId?: string | null;
  categoryId?: string | null;
  currencyCode?: string;
  description?: string | null;
  notes?: string | null;
}

export interface TransactionFilters {
  fromDate?: string;
  toDate?: string;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
}
