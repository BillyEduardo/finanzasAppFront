import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Account, ApiResponse, CreateAccountRequest, UpdateAccountRequest } from '../core/models';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  private baseUrl(): string {
    return `/api/users/${this.session.requireUserId()}/accounts`;
  }

  getAll(): Observable<Account[]> {
    return this.http.get<ApiResponse<Account[]>>(this.baseUrl()).pipe(map((res) => res.data ?? []));
  }

  getById(accountId: string): Observable<Account> {
    return this.http
      .get<ApiResponse<Account>>(`${this.baseUrl()}/${accountId}`)
      .pipe(map((res) => res.data));
  }

  create(body: CreateAccountRequest): Observable<Account> {
    return this.http.post<ApiResponse<Account>>(this.baseUrl(), body).pipe(map((res) => res.data));
  }

  update(accountId: string, body: UpdateAccountRequest): Observable<Account> {
    return this.http
      .put<ApiResponse<Account>>(`${this.baseUrl()}/${accountId}`, body)
      .pipe(map((res) => res.data));
  }

  delete(accountId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl()}/${accountId}`)
      .pipe(map(() => undefined));
  }
}
