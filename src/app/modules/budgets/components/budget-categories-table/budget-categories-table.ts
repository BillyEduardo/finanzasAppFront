import { Component, input, output, signal } from '@angular/core';
import { CurrencyRdPipe } from '../../../../core/pipes/currency-rd.pipe';
import { LucideIconsModule } from '../../../../shared/LucideIconsModule';
import {
  BudgetCategoryLine,
  CategoryBudgetState,
} from '../../../../core/models/budget.model';

export interface CategoryRowView extends BudgetCategoryLine {
  available: number;
  percent: number;
  state: CategoryBudgetState;
  stateLabel: string;
}

@Component({
  selector: 'app-budget-categories-table',
  imports: [CurrencyRdPipe, LucideIconsModule],
  templateUrl: './budget-categories-table.html',
  styleUrl: './budget-categories-table.scss',
})
export class BudgetCategoriesTable {
  readonly rows = input<CategoryRowView[]>([]);
  readonly registerSpend = output<CategoryRowView>();
  readonly adjustLimit = output<CategoryRowView>();

  readonly openMenuId = signal<string | null>(null);

  toggleMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  onRegister(row: CategoryRowView): void {
    this.closeMenu();
    this.registerSpend.emit(row);
  }

  onAdjust(row: CategoryRowView): void {
    this.closeMenu();
    this.adjustLimit.emit(row);
  }

  progressWidth(percent: number): number {
    return Math.min(percent, 100);
  }
}
