import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';
import {
  Budget,
  BudgetCategoryDraft,
  BudgetPeriodType,
  CreateBudgetPayload,
} from '../../../../core/models/budget.model';
import { BudgetsService } from '../../../../core/services/budgets.service';

export type BudgetEditorMode = 'create' | 'adjust' | 'duplicate';

@Component({
  selector: 'app-budget-editor-modal',
  imports: [ReactiveFormsModule, CurrencyRdPipe, LucideIconsModule],
  templateUrl: './budget-editor-modal.html',
  styleUrl: './budget-editor-modal.scss',
})
export class BudgetEditorModal {
  private readonly fb = inject(FormBuilder);
  private readonly budgetsService = inject(BudgetsService);

  readonly open = input(false);
  readonly mode = input<BudgetEditorMode>('create');
  readonly budget = input<Budget | null>(null);

  readonly closed = output<void>();
  readonly saved = output<
    | CreateBudgetPayload
    | { mode: 'adjust'; drafts: BudgetCategoryDraft[]; total: number; name: string }
  >();

  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    periodType: ['Monthly' as BudgetPeriodType, Validators.required],
    periodLabel: ['', Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    month: [new Date().getMonth() + 1, Validators.required],
    total: [0, [Validators.required, Validators.min(1)]],
    categories: this.fb.array(
      this.budgetsService.availableCatalog().map((cat) =>
        this.fb.nonNullable.group({
          categoryId: [cat.categoryId],
          name: [cat.name],
          icon: [cat.icon],
          color: [cat.color],
          budgeted: [0, [Validators.min(0)]],
        }),
      ),
    ),
  });

  readonly allocated = signal(0);
  readonly remaining = computed(
    () => Math.round((this.form.controls.total.value - this.allocated()) * 100) / 100,
  );

  readonly title = computed(() => {
    switch (this.mode()) {
      case 'adjust':
        return 'Ajustar categorías';
      case 'duplicate':
        return 'Duplicar presupuesto';
      default:
        return 'Crear nuevo presupuesto';
    }
  });

  readonly subtitle = computed(() => {
    switch (this.mode()) {
      case 'adjust':
        return 'Redistribuye los límites por categoría sin perder el gasto registrado.';
      case 'duplicate':
        return 'Usa un presupuesto anterior como base y ajusta montos si lo necesitas.';
      default:
        return 'Define el periodo, el monto total y cuánto corresponde a cada categoría.';
    }
  });

  constructor() {
    this.form.controls.categories.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.recalcAllocated());
    this.form.controls.total.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.recalcAllocated());

    effect(() => {
      if (!this.open()) return;
      this.errorMessage.set(null);
      this.hydrateForm();
    });
  }

  get categories(): FormArray {
    return this.form.controls.categories;
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
      this.errorMessage.set('Completa los campos obligatorios.');
      return;
    }

    const raw = this.form.getRawValue();
    const drafts = raw.categories
      .filter((c) => c.budgeted > 0)
      .map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        icon: c.icon,
        color: c.color,
        budgeted: Number(c.budgeted) || 0,
      }));

    if (drafts.length === 0) {
      this.errorMessage.set('Asigna al menos una categoría con monto mayor a cero.');
      return;
    }

    const allocated = drafts.reduce((sum, c) => sum + c.budgeted, 0);
    if (allocated > raw.total + 0.009) {
      this.errorMessage.set('La distribución supera el presupuesto total.');
      return;
    }

    if (this.mode() === 'adjust') {
      this.saved.emit({
        mode: 'adjust',
        drafts,
        total: raw.total,
        name: raw.name.trim(),
      });
      return;
    }

    const payload: CreateBudgetPayload = {
      name: raw.name.trim(),
      periodType: raw.periodType,
      periodLabel: raw.periodLabel.trim(),
      year: raw.year,
      month: raw.month,
      total: raw.total,
      categories: drafts,
      activate: true,
    };

    this.saved.emit(payload);
  }

  private hydrateForm(): void {
    const mode = this.mode();
    const budget = this.budget();
    const now = new Date();
    const defaultLabel = new Intl.DateTimeFormat('es-DO', {
      month: 'long',
      year: 'numeric',
    })
      .format(now)
      .replace(/^\w/, (c) => c.toUpperCase());

    const catalog = this.budgetsService.availableCatalog();
    const byId =
      budget != null
        ? new Map(budget.categories.map((c) => [c.categoryId, c]))
        : new Map<string, { budgeted: number }>();

    const useSource = (mode === 'adjust' || mode === 'duplicate') && budget;

    this.form.patchValue({
      name: useSource
        ? mode === 'duplicate'
          ? `Copia de ${budget.name}`
          : budget.name
        : `Presupuesto ${defaultLabel}`,
      periodType: useSource ? budget.periodType : 'Monthly',
      periodLabel: useSource
        ? mode === 'duplicate'
          ? defaultLabel
          : budget.periodLabel
        : defaultLabel,
      year: useSource
        ? mode === 'duplicate'
          ? now.getFullYear()
          : budget.year
        : now.getFullYear(),
      month: useSource
        ? mode === 'duplicate'
          ? now.getMonth() + 1
          : budget.month
        : now.getMonth() + 1,
      total: useSource ? budget.total : 50000,
    });

    this.categories.controls.forEach((ctrl, index) => {
      const cat = catalog[index];
      if (!cat) return;
      const existing = byId.get(cat.categoryId);
      ctrl.patchValue({
        categoryId: cat.categoryId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        budgeted: useSource ? (existing?.budgeted ?? 0) : 0,
      });
    });

    this.recalcAllocated();
  }

  private recalcAllocated(): void {
    const sum = this.form.controls.categories.controls.reduce(
      (acc, ctrl) => acc + (Number(ctrl.controls.budgeted.value) || 0),
      0,
    );
    this.allocated.set(Math.round(sum * 100) / 100);
  }
}
