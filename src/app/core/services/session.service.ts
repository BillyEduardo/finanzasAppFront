import { Injectable, computed, signal } from '@angular/core';
import { AuthSession, User } from '../models';
import { isJwtValid } from '../utils/jwt.util';

const USER_ID_KEY = 'finanzas_userId';
const USER_KEY = 'finanzas_user';
const ACCESS_TOKEN_KEY = 'finanzas_accessToken';
const TOKEN_TYPE_KEY = 'finanzas_tokenType';
const EXPIRES_AT_KEY = 'finanzas_expiresAt';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly userIdSignal = signal<string | null>(this.readUserId());
  private readonly userSignal = signal<User | null>(this.readUser());
  private readonly accessTokenSignal = signal<string | null>(this.readAccessToken());
  private readonly expiresAtSignal = signal<string | null>(this.readExpiresAt());

  readonly userId = this.userIdSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly expiresAt = this.expiresAtSignal.asReadonly();

  readonly hasValidToken = computed(() =>
    isJwtValid(this.accessTokenSignal(), this.expiresAtSignal()),
  );

  readonly isAuthenticated = computed(
    () => !!this.userIdSignal() && this.hasValidToken(),
  );

  setSession(auth: AuthSession): void {
    localStorage.setItem(USER_ID_KEY, auth.user.id);
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    localStorage.setItem(ACCESS_TOKEN_KEY, auth.accessToken);
    localStorage.setItem(TOKEN_TYPE_KEY, auth.tokenType || 'Bearer');
    localStorage.setItem(EXPIRES_AT_KEY, auth.expiresAt);

    this.userIdSignal.set(auth.user.id);
    this.userSignal.set(auth.user);
    this.accessTokenSignal.set(auth.accessToken);
    this.expiresAtSignal.set(auth.expiresAt);
  }

  clearSession(): void {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);

    this.userIdSignal.set(null);
    this.userSignal.set(null);
    this.accessTokenSignal.set(null);
    this.expiresAtSignal.set(null);
  }

  /** Clears session when a stored user exists without a valid JWT. */
  ensureValidSession(): boolean {
    const hasUser = !!this.userIdSignal() || !!this.userSignal();
    if (!hasUser) return false;

    if (!this.hasValidToken()) {
      this.clearSession();
      return false;
    }

    return true;
  }

  getAuthorizationHeader(): string | null {
    const token = this.accessTokenSignal();
    if (!isJwtValid(token, this.expiresAtSignal())) return null;
    const type = localStorage.getItem(TOKEN_TYPE_KEY) || 'Bearer';
    return `${type} ${token}`;
  }

  requireUserId(): string {
    if (!this.ensureValidSession()) {
      throw new Error('No hay sesión activa. Inicia sesión primero.');
    }

    const id = this.userIdSignal();
    if (!id) {
      throw new Error('No hay sesión activa. Inicia sesión primero.');
    }
    return id;
  }

  private readUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  }

  private readUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  private readAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  private readExpiresAt(): string | null {
    return localStorage.getItem(EXPIRES_AT_KEY);
  }
}
