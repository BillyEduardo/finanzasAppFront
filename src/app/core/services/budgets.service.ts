import { Injectable, computed, signal } from '@angular/core';
import {
  Budget,
  BudgetCategoryDraft,
  BudgetCategoryLine,
  CategoryBudgetState,
  CreateBudgetPayload,
} from '../models/budget.model';

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

@Injectable({ providedIn: 'root' })
export class BudgetsService {
  private readonly budgetsSignal = signal<Budget[]>(this.seed());
  private readonly activeIdSignal = signal<string | null>(null);

  readonly budgets = this.budgetsSignal.asReadonly();

  readonly activeBudget = computed(() => {
    const list = this.budgetsSignal();
    const activeId = this.activeIdSignal();
    if (activeId) {
      return list.find((b) => b.id === activeId) ?? list.find((b) => b.status === 'Active') ?? null;
    }
    return list.find((b) => b.status === 'Active') ?? list[0] ?? null;
  });

  readonly totals = computed(() => {
    const budget = this.activeBudget();
    if (!budget) {
      return {
        total: 0,
        spent: 0,
        available: 0,
        overAmount: 0,
        overCategories: 0,
        spentPercent: 0,
        availablePercent: 0,
      };
    }

    const spent = budget.categories.reduce((sum, c) => sum + c.spent, 0);
    const overCategories = budget.categories.filter((c) => c.spent > c.budgeted);
    const overAmount = overCategories.reduce((sum, c) => sum + (c.spent - c.budgeted), 0);
    const available = Math.max(budget.total - spent, 0);
    const spentPercent = budget.total > 0 ? Math.round((spent / budget.total) * 1000) / 10 : 0;
    const availablePercent =
      budget.total > 0 ? Math.round((available / budget.total) * 1000) / 10 : 0;

    return {
      total: budget.total,
      spent,
      available,
      overAmount,
      overCategories: overCategories.length,
      spentPercent,
      availablePercent,
    };
  });

  constructor() {
    const active = this.budgetsSignal().find((b) => b.status === 'Active');
    this.activeIdSignal.set(active?.id ?? this.budgetsSignal()[0]?.id ?? null);
  }

  selectBudget(id: string): void {
    if (!this.budgetsSignal().some((b) => b.id === id)) return;
    this.activeIdSignal.set(id);
  }

  createBudget(payload: CreateBudgetPayload): Budget {
    const budget: Budget = {
      id: uid(),
      name: payload.name.trim(),
      periodType: payload.periodType,
      periodLabel: payload.periodLabel,
      year: payload.year,
      month: payload.month,
      total: payload.total,
      status: payload.activate === false ? 'Archived' : 'Active',
      categories: payload.categories.map((c) => ({
        id: uid(),
        categoryId: c.categoryId,
        name: c.name,
        icon: c.icon,
        color: c.color,
        budgeted: Math.max(0, c.budgeted),
        spent: 0,
      })),
      createdAt: new Date().toISOString(),
    };

    this.budgetsSignal.update((list) => {
      const next =
        budget.status === 'Active'
          ? list.map((b) => ({ ...b, status: 'Archived' as const }))
          : list;
      return [budget, ...next];
    });

    if (budget.status === 'Active') {
      this.activeIdSignal.set(budget.id);
    }

    return budget;
  }

  duplicateBudget(sourceId: string, overrides?: Partial<CreateBudgetPayload>): Budget | null {
    const source = this.budgetsSignal().find((b) => b.id === sourceId);
    if (!source) return null;

    const now = new Date();
    const periodLabel =
      overrides?.periodLabel ??
      new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' })
        .format(now)
        .replace(/^\w/, (c) => c.toUpperCase());

    return this.createBudget({
      name: overrides?.name ?? `Copia de ${source.name}`,
      periodType: overrides?.periodType ?? source.periodType,
      periodLabel,
      year: overrides?.year ?? now.getFullYear(),
      month: overrides?.month ?? now.getMonth() + 1,
      total: overrides?.total ?? source.total,
      categories: source.categories.map((c) => ({
        categoryId: c.categoryId,
        name: c.name,
        icon: c.icon,
        color: c.color,
        budgeted: c.budgeted,
      })),
      activate: true,
    });
  }

  updateBudgetMeta(
    id: string,
    patch: Partial<Pick<Budget, 'name' | 'total' | 'periodLabel' | 'periodType' | 'year' | 'month'>>,
  ): void {
    this.budgetsSignal.update((list) =>
      list.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  }

  replaceCategoryAllocations(budgetId: string, drafts: BudgetCategoryDraft[]): void {
    this.budgetsSignal.update((list) =>
      list.map((budget) => {
        if (budget.id !== budgetId) return budget;

        const previous = new Map(budget.categories.map((c) => [c.categoryId, c]));
        const categories: BudgetCategoryLine[] = drafts.map((draft) => {
          const existing = previous.get(draft.categoryId);
          return {
            id: existing?.id ?? uid(),
            categoryId: draft.categoryId,
            name: draft.name,
            icon: draft.icon,
            color: draft.color,
            budgeted: Math.max(0, draft.budgeted),
            spent: existing?.spent ?? 0,
          };
        });

        const totalFromCats = categories.reduce((sum, c) => sum + c.budgeted, 0);

        return {
          ...budget,
          total: Math.max(budget.total, totalFromCats),
          categories,
        };
      }),
    );
  }

  addSpend(budgetId: string, categoryLineId: string, amount: number): void {
    if (amount <= 0) return;

    this.budgetsSignal.update((list) =>
      list.map((budget) => {
        if (budget.id !== budgetId) return budget;
        return {
          ...budget,
          categories: budget.categories.map((c) =>
            c.id === categoryLineId ? { ...c, spent: c.spent + amount } : c,
          ),
        };
      }),
    );
  }

  setSpend(budgetId: string, categoryLineId: string, amount: number): void {
    this.budgetsSignal.update((list) =>
      list.map((budget) => {
        if (budget.id !== budgetId) return budget;
        return {
          ...budget,
          categories: budget.categories.map((c) =>
            c.id === categoryLineId ? { ...c, spent: Math.max(0, amount) } : c,
          ),
        };
      }),
    );
  }

  categoryState(line: BudgetCategoryLine): CategoryBudgetState {
    if (line.budgeted <= 0) return line.spent > 0 ? 'over' : 'within';
    const percent = (line.spent / line.budgeted) * 100;
    if (percent > 100) return 'over';
    if (percent >= 95) return 'limit';
    return 'within';
  }

  categoryPercent(line: BudgetCategoryLine): number {
    if (line.budgeted <= 0) return line.spent > 0 ? 100 : 0;
    return Math.min(Math.round((line.spent / line.budgeted) * 100), 999);
  }

  availableCatalog(): BudgetCategoryDraft[] {
    return [
      {
        categoryId: 'cat-food',
        name: 'Alimentación',
        icon: 'utensils',
        color: '#09bc8a',
        budgeted: 0,
      },
      {
        categoryId: 'cat-transport',
        name: 'Transporte',
        icon: 'fuel',
        color: '#004346',
        budgeted: 0,
      },
      {
        categoryId: 'cat-home',
        name: 'Hogar',
        icon: 'home',
        color: '#508991',
        budgeted: 0,
      },
      {
        categoryId: 'cat-fun',
        name: 'Entretenimiento',
        icon: 'film',
        color: '#f59e0b',
        budgeted: 0,
      },
      {
        categoryId: 'cat-health',
        name: 'Salud',
        icon: 'activity',
        color: '#8b5cf6',
        budgeted: 0,
      },
      {
        categoryId: 'cat-other',
        name: 'Otros',
        icon: 'tag',
        color: '#94a3b8',
        budgeted: 0,
      },
    ];
  }

  private seed(): Budget[] {
    const mayo: Budget = {
      id: 'budget-mayo-2025',
      name: 'Presupuesto Mayo',
      periodType: 'Monthly',
      periodLabel: 'Mayo 2025',
      year: 2025,
      month: 5,
      total: 50450,
      status: 'Active',
      createdAt: '2025-05-01T10:00:00.000Z',
      categories: [
        {
          id: 'line-1',
          categoryId: 'cat-food',
          name: 'Alimentación',
          icon: 'utensils',
          color: '#09bc8a',
          budgeted: 12500,
          spent: 12450,
        },
        {
          id: 'line-2',
          categoryId: 'cat-transport',
          name: 'Transporte',
          icon: 'fuel',
          color: '#004346',
          budgeted: 8500,
          spent: 6820,
        },
        {
          id: 'line-3',
          categoryId: 'cat-home',
          name: 'Hogar',
          icon: 'home',
          color: '#508991',
          budgeted: 9200,
          spent: 5100,
        },
        {
          id: 'line-4',
          categoryId: 'cat-fun',
          name: 'Entretenimiento',
          icon: 'film',
          color: '#f59e0b',
          budgeted: 4000,
          spent: 4000,
        },
        {
          id: 'line-5',
          categoryId: 'cat-health',
          name: 'Salud',
          icon: 'activity',
          color: '#8b5cf6',
          budgeted: 6250,
          spent: 2100,
        },
        {
          id: 'line-6',
          categoryId: 'cat-other',
          name: 'Otros',
          icon: 'tag',
          color: '#94a3b8',
          budgeted: 10000,
          spent: 1980,
        },
      ],
    };

    const abril: Budget = {
      id: 'budget-abril-2025',
      name: 'Presupuesto Abril',
      periodType: 'Monthly',
      periodLabel: 'Abril 2025',
      year: 2025,
      month: 4,
      total: 48000,
      status: 'Archived',
      createdAt: '2025-04-01T10:00:00.000Z',
      categories: [
        {
          id: 'line-a1',
          categoryId: 'cat-food',
          name: 'Alimentación',
          icon: 'utensils',
          color: '#09bc8a',
          budgeted: 12000,
          spent: 11800,
        },
        {
          id: 'line-a2',
          categoryId: 'cat-transport',
          name: 'Transporte',
          icon: 'fuel',
          color: '#004346',
          budgeted: 8000,
          spent: 7600,
        },
        {
          id: 'line-a3',
          categoryId: 'cat-home',
          name: 'Hogar',
          icon: 'home',
          color: '#508991',
          budgeted: 9000,
          spent: 8800,
        },
        {
          id: 'line-a4',
          categoryId: 'cat-fun',
          name: 'Entretenimiento',
          icon: 'film',
          color: '#f59e0b',
          budgeted: 4000,
          spent: 3500,
        },
        {
          id: 'line-a5',
          categoryId: 'cat-other',
          name: 'Otros',
          icon: 'tag',
          color: '#94a3b8',
          budgeted: 15000,
          spent: 14300,
        },
      ],
    };

    const marzo: Budget = {
      id: 'budget-marzo-2025',
      name: 'Presupuesto Marzo',
      periodType: 'Monthly',
      periodLabel: 'Marzo 2025',
      year: 2025,
      month: 3,
      total: 45500,
      status: 'Archived',
      createdAt: '2025-03-01T10:00:00.000Z',
      categories: [
        {
          id: 'line-m1',
          categoryId: 'cat-food',
          name: 'Alimentación',
          icon: 'utensils',
          color: '#09bc8a',
          budgeted: 11000,
          spent: 10950,
        },
        {
          id: 'line-m2',
          categoryId: 'cat-transport',
          name: 'Transporte',
          icon: 'fuel',
          color: '#004346',
          budgeted: 7500,
          spent: 7200,
        },
        {
          id: 'line-m3',
          categoryId: 'cat-home',
          name: 'Hogar',
          icon: 'home',
          color: '#508991',
          budgeted: 8500,
          spent: 8100,
        },
        {
          id: 'line-m4',
          categoryId: 'cat-other',
          name: 'Otros',
          icon: 'tag',
          color: '#94a3b8',
          budgeted: 18500,
          spent: 17200,
        },
      ],
    };

    return [mayo, abril, marzo];
  }
}
