import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Category, CreateCategoryRequest, UpdateCategoryRequest } from '../models';
import { SessionService } from './session.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);

  private baseUrl(): string {
    return `${environment.apiUrl}/api/users/${this.session.requireUserId()}/categories`;
  }

  getAll(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(this.baseUrl())
      .pipe(map((res) => res.data ?? []));
  }

  getById(categoryId: string): Observable<Category> {
    return this.http
      .get<ApiResponse<Category>>(`${this.baseUrl()}/${categoryId}`)
      .pipe(map((res) => res.data));
  }

  create(body: CreateCategoryRequest): Observable<Category> {
    return this.http.post<ApiResponse<Category>>(this.baseUrl(), body).pipe(map((res) => res.data));
  }

  update(categoryId: string, body: UpdateCategoryRequest): Observable<Category> {
    return this.http
      .put<ApiResponse<Category>>(`${this.baseUrl()}/${categoryId}`, body)
      .pipe(map((res) => res.data));
  }

  delete(categoryId: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(`${this.baseUrl()}/${categoryId}`)
      .pipe(map(() => undefined));
  }
}
