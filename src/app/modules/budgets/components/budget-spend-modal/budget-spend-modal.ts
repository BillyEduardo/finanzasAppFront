import { Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';
import { BudgetCategoryLine } from '../../../../core/models/budget.model';

@Component({
  selector: 'app-budget-spend-modal',
  imports: [ReactiveFormsModule, CurrencyRdPipe, LucideIconsModule],
  templateUrl: './budget-spend-modal.html',
  styleUrl: './budget-spend-modal.scss',
})
export class BudgetSpendModal {
  private readonly fb = inject(FormBuilder);

  readonly open = input(false);
  readonly category = input<BudgetCategoryLine | null>(null);

  readonly closed = output<void>();
  readonly saved = output<{ amount: number; mode: 'add' | 'set' }>();

  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    mode: ['add' as 'add' | 'set'],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      this.errorMessage.set(null);
      const cat = this.category();
      this.form.reset({
        amount: cat ? 0 : 0,
        mode: 'add',
      });
    });
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  submit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Ingresa un monto válido.');
      return;
    }

    const { amount, mode } = this.form.getRawValue();
    this.saved.emit({ amount, mode });
  }
}
