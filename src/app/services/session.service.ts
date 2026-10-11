import { Injectable, signal, computed } from '@angular/core';
import { User } from '../core/models';

const USER_ID_KEY = 'finanzas_userId';
const USER_KEY = 'finanzas_user';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly userIdSignal = signal<string | null>(this.readUserId());
  private readonly userSignal = signal<User | null>(this.readUser());

  readonly userId = this.userIdSignal.asReadonly();
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userIdSignal());

  setSession(user: User): void {
    localStorage.setItem(USER_ID_KEY, user.id);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.userIdSignal.set(user.id);
    this.userSignal.set(user);
  }

  clearSession(): void {
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_KEY);
    this.userIdSignal.set(null);
    this.userSignal.set(null);
  }

  requireUserId(): string {
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
}
