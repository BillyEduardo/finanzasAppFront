import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthSession,
  CreateUserRequest,
  LoginUserRequest,
  User,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/users`;

  register(body: CreateUserRequest): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(`${this.baseUrl}/register`, body)
      .pipe(map((res) => res.data));
  }

  login(body: LoginUserRequest): Observable<AuthSession> {
    return this.http
      .post<ApiResponse<AuthSession>>(`${this.baseUrl}/login`, body)
      .pipe(map((res) => res.data));
  }

  logout(): Observable<void> {
    return this.http
      .post<ApiResponse<unknown>>(`${this.baseUrl}/logout`, null)
      .pipe(map(() => undefined));
  }

  getById(userId: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/${userId}`)
      .pipe(map((res) => res.data));
  }

  getByEmail(email: string): Observable<User> {
    const params = new HttpParams().set('email', email);
    return this.http
      .get<ApiResponse<User>>(`${this.baseUrl}/by-email`, { params })
      .pipe(map((res) => res.data));
  }
}
