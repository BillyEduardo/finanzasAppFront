import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse, CreateUserRequest, User } from '../core/models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/users';

  create(body: CreateUserRequest): Observable<User> {
    return this.http.post<ApiResponse<User>>(this.baseUrl, body).pipe(map((res) => res.data));
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
