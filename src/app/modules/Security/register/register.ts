import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { map, startWith } from 'rxjs';
import { LucideIconsModule } from '../../../shared/LucideIconsModule';
import { UsersService } from '../../../core/services/users.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  if (!password || !confirmPassword) return null;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

type StrengthLevel = 'empty' | 'weak' | 'fair' | 'good' | 'strong';

function scorePassword(password: string): { score: number; level: StrengthLevel; label: string } {
  if (!password) {
    return { score: 0, level: 'empty', label: '' };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, level: 'weak', label: 'Débil' };
  if (score === 2) return { score: 2, level: 'fair', label: 'Regular' };
  if (score === 3) return { score: 3, level: 'good', label: 'Buena' };
  return { score: Math.min(score, 5), level: 'strong', label: 'Fuerte' };
}

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, LucideIconsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly users = inject(UsersService);

  readonly showPassword = signal(false);
  readonly showConfirmPassword = signal(false);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly currencies = [
    { code: 'DOP', label: 'DOP — Peso dominicano' },
    { code: 'USD', label: 'USD — Dólar estadounidense' },
    { code: 'EUR', label: 'EUR — Euro' },
    { code: 'MXN', label: 'MXN — Peso mexicano' },
    { code: 'COP', label: 'COP — Peso colombiano' },
    { code: 'ARS', label: 'ARS — Peso argentino' },
    { code: 'CLP', label: 'CLP — Peso chileno' },
    { code: 'PEN', label: 'PEN — Sol peruano' },
    { code: 'BRL', label: 'BRL — Real brasileño' },
    { code: 'GBP', label: 'GBP — Libra esterlina' },
  ] as const;

  readonly form = this.fb.nonNullable.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: [
        '',
        [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9._]+$/)],
      ],
      currencyCode: ['DOP', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: passwordsMatch },
  );

  private readonly passwordValue = toSignal(
    this.form.controls.password.valueChanges.pipe(
      startWith(this.form.controls.password.value),
      map((v) => v ?? ''),
    ),
    { initialValue: '' },
  );

  readonly passwordStrength = computed(() => scorePassword(this.passwordValue()));

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { displayName, email, password, currencyCode } = this.form.getRawValue();
    this.loading.set(true);

    this.users
      .register({
        displayName,
        email,
        password,
        currencyCode,
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          void this.router.navigate(['/login'], {
            queryParams: { registered: '1' },
          });
        },
        error: (err: { error?: { message?: string } }) => {
          this.loading.set(false);
          this.errorMessage.set(
            err.error?.message ??
              'No pudimos crear tu cuenta. Revisa los datos o intenta con otro correo.',
          );
        },
      });
  }
}
