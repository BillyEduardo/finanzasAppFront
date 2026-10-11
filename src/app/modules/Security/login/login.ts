import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideIconsModule } from '../../../shared/LucideIconsModule';
import { SessionService } from '../../../core/services/session.service';
import { ThemeService } from '../../../core/services/theme.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, LucideIconsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);
  private readonly users = inject(UsersService);
  private readonly theme = inject(ThemeService);

  readonly showPassword = signal(false);
  readonly darkMode = this.theme.isDark;
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [true],
  });

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleDarkMode(): void {
    this.theme.toggle();
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.loading.set(true);

    this.users.login({ email, password }).subscribe({
      next: (auth) => {
        this.session.setSession(auth);
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.error?.message ??
            'No pudimos iniciar sesión. Revisa tu correo e inténtalo de nuevo.',
        );
      },
    });
  }
}
