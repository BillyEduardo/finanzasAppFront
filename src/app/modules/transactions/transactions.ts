import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyRdPipe } from '../../core/pipes/currency-rd.pipe';
import {
  Category,
  CreateTransactionRequest,
  Transaction,
  TransactionType,
} from '../../core/models';
import { CategoriesStore } from '../../core/services/categories-store.service';
import { TransactionsStore } from '../../core/services/transactions-store.service';
import { LucideIconsModule } from '../../shared/LucideIconsModule';

type TypeFilter = 'all' | TransactionType;

interface TransactionRow extends Transaction {
  category: Category | null;
  timeLabel: string;
  dayKey: string;
}

interface DayGroup {
  key: string;
  label: string;
  items: TransactionRow[];
}

interface CategorySummary {
  id: string;
  name: string;
  color: string;
  amount: number;
  percent: number;
}

@Component({
  selector: 'app-transactions',
  imports: [FormsModule, LucideIconsModule, CurrencyRdPipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private readonly store = inject(TransactionsStore);
  private readonly categoriesStore = inject(CategoriesStore);

  readonly pageSize = 8;
  readonly tip =
    'Registra cada gasto el mismo día. Así evitas fugas y mantienes el control de tu presupuesto.';

  readonly search = signal('');
  readonly typeFilter = signal<TypeFilter>('all');
  readonly categoryFilter = signal('all');
  readonly fromDate = signal(this.monthStart());
  readonly toDate = signal(this.monthEnd());
  readonly visibleCount = signal(this.pageSize);
  readonly showMoreFilters = signal(false);

  readonly formType = signal<TransactionType>('Expense');
  readonly formAmount = signal<number | null>(null);
  readonly formCategoryId = signal('');
  readonly formDate = signal(this.todayInput());
  readonly formDescription = signal('');
  readonly formError = signal<string | null>(null);
  readonly editingId = signal<string | null>(null);
  readonly confirmDeleteId = signal<string | null>(null);

  readonly categories = this.categoriesStore.categories;

  readonly periodLabel = computed(() => {
    const from = this.parseDateInput(this.fromDate());
    const to = this.parseDateInput(this.toDate());
    if (!from || !to) return 'Rango de fechas';
    return `${this.formatShortDate(from)} - ${this.formatShortDate(to)}`;
  });

  readonly formCategories = computed(() => {
    const type = this.formType();
    return this.categories().filter((c) => {
      if (c.isActive === false) return false;
      return c.kind === type || c.kind === 'Both';
    });
  });

  readonly filtered = computed(() => {
    const q = this.search().trim().toLowerCase();
    const type = this.typeFilter();
    const categoryId = this.categoryFilter();
    const from = this.parseDateInput(this.fromDate());
    const to = this.parseDateInput(this.toDate());
    const cats = new Map(this.categories().map((c) => [c.id, c]));

    return this.store
      .transactions()
      .map((t): TransactionRow => {
        const occurred = new Date(t.occurredOn);
        return {
          ...t,
          category: t.categoryId ? (cats.get(t.categoryId) ?? null) : null,
          timeLabel: this.formatTime(occurred),
          dayKey: this.dayKey(occurred),
        };
      })
      .filter((t) => {
        const occurred = new Date(t.occurredOn);
        const matchesQuery =
          !q ||
          (t.description ?? '').toLowerCase().includes(q) ||
          (t.category?.name ?? '').toLowerCase().includes(q);
        const matchesType = type === 'all' || t.type === type;
        const matchesCategory = categoryId === 'all' || t.categoryId === categoryId;
        const matchesFrom = !from || this.startOfDay(occurred) >= this.startOfDay(from);
        const matchesTo = !to || this.startOfDay(occurred) <= this.startOfDay(to);
        return matchesQuery && matchesType && matchesCategory && matchesFrom && matchesTo;
      })
      .sort((a, b) => +new Date(b.occurredOn) - +new Date(a.occurredOn));
  });

  readonly stats = computed(() => {
    const list = this.filtered();
    const income = list
      .filter((t) => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = list
      .filter((t) => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      count: list.length,
    };
  });

  readonly visibleRows = computed(() => this.filtered().slice(0, this.visibleCount()));

  readonly hasMore = computed(() => this.visibleCount() < this.filtered().length);

  readonly grouped = computed((): DayGroup[] => {
    const groups = new Map<string, DayGroup>();
    for (const row of this.visibleRows()) {
      const existing = groups.get(row.dayKey);
      if (existing) {
        existing.items.push(row);
      } else {
        groups.set(row.dayKey, {
          key: row.dayKey,
          label: this.dayLabel(new Date(row.occurredOn)),
          items: [row],
        });
      }
    }
    return [...groups.values()];
  });

  readonly categorySummary = computed((): CategorySummary[] => {
    const expenseRows = this.filtered().filter((t) => t.type === 'Expense');
    const total = expenseRows.reduce((sum, t) => sum + t.amount, 0);
    const map = new Map<string, CategorySummary>();

    for (const row of expenseRows) {
      const id = row.category?.id ?? 'uncategorized';
      const name = row.category?.name ?? 'Sin categoría';
      const color = row.category?.color ?? '#94a3b8';
      const current = map.get(id);
      if (current) {
        current.amount += row.amount;
      } else {
        map.set(id, { id, name, color, amount: row.amount, percent: 0 });
      }
    }

    return [...map.values()]
      .map((item) => ({
        ...item,
        percent: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  });

  readonly isEditing = computed(() => !!this.editingId());

  onSearch(value: string): void {
    this.search.set(value);
    this.visibleCount.set(this.pageSize);
  }

  onTypeFilter(value: string): void {
    this.typeFilter.set(value as TypeFilter);
    this.visibleCount.set(this.pageSize);
  }

  onCategoryFilter(value: string): void {
    this.categoryFilter.set(value);
    this.visibleCount.set(this.pageSize);
  }

  onFromDate(value: string): void {
    this.fromDate.set(value);
    this.visibleCount.set(this.pageSize);
  }

  onToDate(value: string): void {
    this.toDate.set(value);
    this.visibleCount.set(this.pageSize);
  }

  toggleMoreFilters(): void {
    this.showMoreFilters.update((v) => !v);
  }

  clearFilters(): void {
    this.search.set('');
    this.typeFilter.set('all');
    this.categoryFilter.set('all');
    this.fromDate.set(this.monthStart());
    this.toDate.set(this.monthEnd());
    this.visibleCount.set(this.pageSize);
  }

  loadMore(): void {
    this.visibleCount.update((n) => n + this.pageSize);
  }

  setFormType(type: TransactionType): void {
    this.formType.set(type);
    const stillValid = this.formCategories().some((c) => c.id === this.formCategoryId());
    if (!stillValid) this.formCategoryId.set('');
  }

  startCreate(): void {
    this.resetForm();
    this.scrollToForm();
  }

  startEdit(row: TransactionRow): void {
    this.editingId.set(row.id);
    this.formType.set(row.type);
    this.formAmount.set(row.amount);
    this.formCategoryId.set(row.categoryId ?? '');
    this.formDate.set(this.toInputDate(new Date(row.occurredOn)));
    this.formDescription.set(row.description ?? '');
    this.formError.set(null);
    this.scrollToForm();
  }

  cancelEdit(): void {
    this.resetForm();
  }

  saveRecord(): void {
    this.formError.set(null);
    const amount = this.formAmount();
    const categoryId = this.formCategoryId();
    const date = this.formDate();

    if (amount == null || amount <= 0) {
      this.formError.set('Ingresa un monto válido mayor a 0.');
      return;
    }
    if (!categoryId) {
      this.formError.set('Selecciona una categoría.');
      return;
    }
    if (!date) {
      this.formError.set('Selecciona una fecha.');
      return;
    }

    const occurredOn = new Date(`${date}T12:00:00`).toISOString();
    const payload: CreateTransactionRequest = {
      type: this.formType(),
      amount,
      occurredOn,
      categoryId,
      currencyCode: 'DOP',
      description: this.formDescription().trim() || null,
    };

    const editingId = this.editingId();
    if (editingId) {
      this.store.update(editingId, payload);
    } else {
      this.store.create(payload);
      this.visibleCount.set(this.pageSize);
    }
    this.resetForm();
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
    if (this.editingId() === id) this.resetForm();
    this.confirmDeleteId.set(null);
  }

  exportHint(): void {
    // Placeholder UI action — export wire-up later
  }

  private resetForm(): void {
    this.editingId.set(null);
    this.formType.set('Expense');
    this.formAmount.set(null);
    this.formCategoryId.set('');
    this.formDate.set(this.todayInput());
    this.formDescription.set('');
    this.formError.set(null);
  }

  private scrollToForm(): void {
    queueMicrotask(() => {
      document.getElementById('tx-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private monthStart(): string {
    const d = new Date();
    return this.toInputDate(new Date(d.getFullYear(), d.getMonth(), 1));
  }

  private monthEnd(): string {
    const d = new Date();
    return this.toInputDate(new Date(d.getFullYear(), d.getMonth() + 1, 0));
  }

  private todayInput(): string {
    return this.toInputDate(new Date());
  }

  private toInputDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseDateInput(value: string): Date | null {
    if (!value) return null;
    const d = new Date(`${value}T00:00:00`);
    return Number.isNaN(+d) ? null : d;
  }

  private startOfDay(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  private dayKey(d: Date): string {
    return this.toInputDate(d);
  }

  private dayLabel(d: Date): string {
    const today = this.startOfDay(new Date());
    const value = this.startOfDay(d);
    const dayMs = 86_400_000;
    const formatted = new Intl.DateTimeFormat('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);

    if (value === today) return `Hoy, ${formatted}`;
    if (value === today - dayMs) return `Ayer, ${formatted}`;
    return formatted;
  }

  private formatShortDate(d: Date): string {
    return new Intl.DateTimeFormat('es-DO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  }

  private formatTime(d: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  }
}
