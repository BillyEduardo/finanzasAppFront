import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';
import { Category, CategoryKind, CreateCategoryRequest } from '../../../../core/models';
import { CategoriesStore } from '../../../../core/services/categories-store.service';

export type CategoryFormMode = 'create' | 'edit';

@Component({
  selector: 'app-category-form-modal',
  imports: [ReactiveFormsModule, LucideIconsModule],
  templateUrl: './category-form-modal.html',
  styleUrl: './category-form-modal.scss',
})
export class CategoryFormModal {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(CategoriesStore);

  readonly open = input(false);
  readonly mode = input<CategoryFormMode>('create');
  readonly category = input<Category | null>(null);

  readonly closed = output<void>();
  readonly saved = output<CreateCategoryRequest>();

  readonly errorMessage = signal<string | null>(null);
  readonly iconOptions = this.store.iconOptions();
  readonly colorOptions = this.store.colorOptions();

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    kind: ['Expense' as CategoryKind, Validators.required],
    description: [''],
    icon: ['tag'],
    color: ['#09bc8a'],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      this.errorMessage.set(null);
      this.hydrate();
    });
  }

  get title(): string {
    return this.mode() === 'edit' ? 'Editar categoría' : 'Nueva categoría';
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  selectColor(color: string): void {
    this.form.controls.color.setValue(color);
  }

  submit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage.set('Completa el nombre y el tipo de la categoría.');
      return;
    }

    const raw = this.form.getRawValue();
    this.saved.emit({
      name: raw.name.trim(),
      kind: raw.kind,
      description: raw.description.trim(),
      icon: raw.icon,
      color: raw.color,
      isActive: raw.isActive,
    });
  }

  private hydrate(): void {
    const category = this.category();
    if (this.mode() === 'edit' && category) {
      this.form.reset({
        name: category.name,
        kind: category.kind,
        description: category.description ?? '',
        icon: category.icon ?? 'tag',
        color: category.color ?? '#09bc8a',
        isActive: category.isActive !== false,
      });
      return;
    }

    this.form.reset({
      name: '',
      kind: 'Expense',
      description: '',
      icon: 'tag',
      color: '#09bc8a',
      isActive: true,
    });
  }
}
