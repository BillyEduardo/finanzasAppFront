import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { SessionService } from '../services/session.service';

const AUTH_SKIP_PATHS = ['/api/users/login', '/api/users/register'];

function shouldSkipAuth(url: string): boolean {
  return AUTH_SKIP_PATHS.some((path) => url.includes(path));
}

function forceLogout(session: SessionService, router: Router): void {
  session.clearSession();
  void router.navigate(['/login']);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);

  if (shouldSkipAuth(req.url)) {
    return next(req);
  }

  const hasStoredUser = !!session.userId() || !!session.user();

  if (hasStoredUser && !session.hasValidToken()) {
    forceLogout(session, router);
    return throwError(() => new Error('Sesión expirada o token inválido.'));
  }

  const authorization = session.getAuthorizationHeader();
  const authReq = authorization
    ? req.clone({ setHeaders: { Authorization: authorization } })
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401 && hasStoredUser) {
        forceLogout(session, router);
      }
      return throwError(() => error);
    }),
  );
};
