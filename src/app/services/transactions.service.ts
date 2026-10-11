import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApiResponse,
  CreateTransactionRequest,
  Transaction,
  TransactionFilters,
  UpdateTransactionRequest,
} from '../core/models';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  private baseUrl(): string {
    return `/api/users/${this.session.requireUserId()}/transactions`;
  }

  getAll(filters?: TransactionFilters): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters) {
      if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
      if (filters.toDate) params = params.set('toDate', filters.toDate);
      if (filters.type) params = params.set('type', filters.type);
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
      if (filters.accountId) params = params.set('accountId', filters.accountId);
    }

    return this.http
      .get<ApiResponse<Transaction[]>>(this.baseUrl(), { params })
      .pipe(map((res) => res.data ?? []));
  }

  getById(transactionId: string): Observable<Transaction> {
    return this.http
      .get<ApiResponse<Transaction>>(`${this.baseUrl()}/${transactionId}`)
      .pipe(map((res) => res.data));
  }

  create(body: CreateTransactionRequest): Observable<Transaction> {
    return this.http
      .post<ApiResponse<Transaction>>(this.baseUrl(), body)
      .pipe(map((res) => res.data));
  }

  update(transactionId: string, body: UpdateTransactionRequest): Observable<Transaction> {
    return this.http
      .put<ApiResponse<Transaction>>(`${this.baseUrl()}/${transactionId}`, body)
      .pipe(map((res) => res.data));
  }

  delete(transactionId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl()}/${transactionId}`)
      .pipe(map(() => undefined));
  }
}
