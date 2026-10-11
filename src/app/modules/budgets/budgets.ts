import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyRdPipe } from '../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../shared/LucideIconsModule';
import { BudgetsService } from '../../core/services/budgets.service';
import {
  Budget,
  BudgetCategoryDraft,
  BudgetCategoryLine,
  CreateBudgetPayload,
} from '../../core/models/budget.model';
import { BudgetSummaryCard } from './components/budget-summary-card/budget-summary-card';
import { BudgetEvolutionCard } from './components/budget-evolution-card/budget-evolution-card';
import {
  BudgetCategoriesTable,
  CategoryRowView,
} from './components/budget-categories-table/budget-categories-table';
import {
  BudgetEditorModal,
  BudgetEditorMode,
} from './components/budget-editor-modal/budget-editor-modal';
import { BudgetSpendModal } from './components/budget-spend-modal/budget-spend-modal';

@Component({
  selector: 'app-budgets',
  imports: [
    CurrencyRdPipe,
    LucideIconsModule,
    BudgetSummaryCard,
    BudgetEvolutionCard,
    BudgetCategoriesTable,
    BudgetEditorModal,
    BudgetSpendModal,
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets {
  private readonly budgetsService = inject(BudgetsService);

  readonly budgets = this.budgetsService.budgets;
  readonly activeBudget = this.budgetsService.activeBudget;
  readonly totals = this.budgetsService.totals;

  readonly editorOpen = signal(false);
  readonly editorMode = signal<BudgetEditorMode>('create');
  readonly spendOpen = signal(false);
  readonly spendCategory = signal<BudgetCategoryLine | null>(null);

  readonly categoryRows = computed<CategoryRowView[]>(() => {
    const budget = this.activeBudget();
    if (!budget) return [];

    return budget.categories.map((c) => {
      const state = this.budgetsService.categoryState(c);
      const percent = this.budgetsService.categoryPercent(c);
      return {
        ...c,
        available: Math.round((c.budgeted - c.spent) * 100) / 100,
        percent,
        state,
        stateLabel: state === 'within' ? 'Dentro' : state === 'limit' ? 'Límite' : 'Excedido',
      };
    });
  });

  readonly spentBarWidth = computed(() => Math.min(this.totals().spentPercent, 100));

  selectBudget(id: string): void {
    this.budgetsService.selectBudget(id);
  }

  openCreate(): void {
    this.editorMode.set('create');
    this.editorOpen.set(true);
  }

  openAdjust(): void {
    if (!this.activeBudget()) return;
    this.editorMode.set('adjust');
    this.editorOpen.set(true);
  }

  openDuplicate(): void {
    if (!this.activeBudget()) return;
    this.editorMode.set('duplicate');
    this.editorOpen.set(true);
  }

  closeEditor(): void {
    this.editorOpen.set(false);
  }

  onEditorSaved(
    payload:
      | CreateBudgetPayload
      | { mode: 'adjust'; drafts: BudgetCategoryDraft[]; total: number; name: string },
  ): void {
    if ('mode' in payload && payload.mode === 'adjust') {
      const budget = this.activeBudget();
      if (!budget) return;
      this.budgetsService.updateBudgetMeta(budget.id, {
        name: payload.name,
        total: payload.total,
      });
      this.budgetsService.replaceCategoryAllocations(budget.id, payload.drafts);
    } else {
      this.budgetsService.createBudget(payload as CreateBudgetPayload);
    }
    this.closeEditor();
  }

  openRegisterSpend(row: CategoryRowView): void {
    this.spendCategory.set(row);
    this.spendOpen.set(true);
  }

  openAdjustFromRow(_row: CategoryRowView): void {
    this.openAdjust();
  }

  closeSpend(): void {
    this.spendOpen.set(false);
    this.spendCategory.set(null);
  }

  onSpendSaved(event: { amount: number; mode: 'add' | 'set' }): void {
    const budget = this.activeBudget();
    const category = this.spendCategory();
    if (!budget || !category) return;

    if (event.mode === 'add') {
      this.budgetsService.addSpend(budget.id, category.id, event.amount);
    } else {
      this.budgetsService.setSpend(budget.id, category.id, event.amount);
    }
    this.closeSpend();
  }

  isActive(budget: Budget): boolean {
    return this.activeBudget()?.id === budget.id;
  }
}
