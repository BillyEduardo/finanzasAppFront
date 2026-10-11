export type BudgetPeriodType = 'Monthly' | 'Biweekly' | 'Custom';
export type BudgetLifecycle = 'Active' | 'Archived';
export type CategoryBudgetState = 'within' | 'limit' | 'over';

export interface BudgetCategoryLine {
  id: string;
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  budgeted: number;
  spent: number;
}

export interface Budget {
  id: string;
  name: string;
  periodType: BudgetPeriodType;
  periodLabel: string;
  year: number;
  month: number;
  total: number;
  status: BudgetLifecycle;
  categories: BudgetCategoryLine[];
  createdAt: string;
}

export interface CreateBudgetPayload {
  name: string;
  periodType: BudgetPeriodType;
  periodLabel: string;
  year: number;
  month: number;
  total: number;
  categories: Array<{
    categoryId: string;
    name: string;
    icon: string;
    color: string;
    budgeted: number;
  }>;
  activate?: boolean;
}

export interface BudgetCategoryDraft {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  budgeted: number;
}
