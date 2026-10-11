import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../shared/LucideIconsModule';
import { Category, CategoryKind, CreateCategoryRequest } from '../../core/models';
import { CategoriesStore } from '../../core/services/categories-store.service';
import {
  CategoryFormModal,
  CategoryFormMode,
} from './components/category-form-modal/category-form-modal';

type KindFilter = 'all' | CategoryKind;
type StatusFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'app-categories',
  imports: [FormsModule, LucideIconsModule, CategoryFormModal],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  private readonly store = inject(CategoriesStore);

  readonly pageSize = 8;

  readonly search = signal('');
  readonly kindFilter = signal<KindFilter>('all');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly page = signal(1);

  readonly modalOpen = signal(false);
  readonly modalMode = signal<CategoryFormMode>('create');
  readonly editing = signal<Category | null>(null);
  readonly confirmDeleteId = signal<string | null>(null);

  readonly stats = this.store.stats;

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const kind = this.kindFilter();
    const status = this.statusFilter();

    return this.store.categories().filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q);
      const matchesKind = kind === 'all' || c.kind === kind;
      const isActive = c.isActive !== false;
      const matchesStatus =
        status === 'all' ||
        (status === 'active' && isActive) ||
        (status === 'inactive' && !isActive);
      return matchesQuery && matchesKind && matchesStatus;
    });
  });

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize)),
  );

  readonly paged = computed(() => {
    const current = Math.min(this.page(), this.totalPages());
    const start = (current - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  readonly rangeLabel = computed(() => {
    const total = this.filtered().length;
    if (total === 0) return 'Mostrando 0 categorías';
    const current = Math.min(this.page(), this.totalPages());
    const start = (current - 1) * this.pageSize + 1;
    const end = Math.min(current * this.pageSize, total);
    return `Mostrando ${start} a ${end} de ${total} categorías`;
  });

  readonly pages = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1),
  );

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  onKindFilter(value: string): void {
    this.kindFilter.set(value as KindFilter);
    this.page.set(1);
  }

  onStatusFilter(value: string): void {
    this.statusFilter.set(value as StatusFilter);
    this.page.set(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.kindFilter.set('all');
    this.statusFilter.set('all');
    this.page.set(1);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.page.set(page);
  }

  openCreate(): void {
    this.modalMode.set('create');
    this.editing.set(null);
    this.modalOpen.set(true);
  }

  openEdit(category: Category): void {
    this.modalMode.set('edit');
    this.editing.set(category);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
    this.editing.set(null);
  }

  onSaved(payload: CreateCategoryRequest): void {
    const editing = this.editing();
    if (this.modalMode() === 'edit' && editing) {
      this.store.update(editing.id, payload);
    } else {
      this.store.create(payload);
      this.page.set(1);
    }
    this.closeModal();
  }

  askDelete(id: string): void {
    this.confirmDeleteId.set(id);
  }

  cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  confirmDelete(): void {
    const id = this.confirmDeleteId();
    if (!id) return;
    this.store.remove(id);
    this.confirmDeleteId.set(null);
    if (this.page() > this.totalPages()) {
      this.page.set(this.totalPages());
    }
  }

  kindLabel(kind: CategoryKind): string {
    switch (kind) {
      case 'Income':
        return 'Ingreso';
      case 'Both':
        return 'Ambos';
      default:
        return 'Gasto';
    }
  }

  isActive(category: Category): boolean {
    return category.isActive !== false;
  }
}
