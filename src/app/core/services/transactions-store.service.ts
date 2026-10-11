import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CreateTransactionRequest,
  Transaction,
  UpdateTransactionRequest,
} from '../models/transaction.model';
import { CategoriesStore } from './categories-store.service';

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `tx-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const at = (daysAgo: number, hour: number, minute = 0): string => {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
};

@Injectable({ providedIn: 'root' })
export class TransactionsStore {
  private readonly categoriesStore = inject(CategoriesStore);
  private readonly transactionsSignal = signal<Transaction[]>(this.seed());

  readonly transactions = this.transactionsSignal.asReadonly();

  readonly stats = computed(() => {
    const list = this.transactionsSignal();
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

  create(body: CreateTransactionRequest): Transaction {
    const tx: Transaction = {
      id: uid(),
      userId: 'local-user',
      type: body.type,
      amount: body.amount,
      occurredOn: body.occurredOn,
      accountId: body.accountId ?? null,
      categoryId: body.categoryId ?? null,
      currencyCode: body.currencyCode ?? 'DOP',
      description: body.description?.trim() || null,
      notes: body.notes?.trim() || null,
      createdAt: new Date().toISOString(),
    };
    this.transactionsSignal.update((list) => [tx, ...list]);
    return tx;
  }

  update(id: string, body: UpdateTransactionRequest): void {
    this.transactionsSignal.update((list) =>
      list.map((t) =>
        t.id === id
          ? {
              ...t,
              ...body,
              description:
                body.description !== undefined
                  ? body.description?.trim() || null
                  : t.description,
              notes: body.notes !== undefined ? body.notes?.trim() || null : t.notes,
            }
          : t,
      ),
    );
  }

  remove(id: string): void {
    this.transactionsSignal.update((list) => list.filter((t) => t.id !== id));
  }

  private seed(): Transaction[] {
    const cats = this.categoriesStore.categories();
    const byName = (name: string) => cats.find((c) => c.name === name)?.id ?? null;

    return [
      {
        id: 'tx-1',
        userId: 'local-user',
        type: 'Expense',
        amount: 350,
        occurredOn: at(0, 9, 45),
        categoryId: byName('Alimentación'),
        currencyCode: 'DOP',
        description: "McDonald's",
        createdAt: at(0, 9, 45),
      },
      {
        id: 'tx-2',
        userId: 'local-user',
        type: 'Income',
        amount: 12000,
        occurredOn: at(0, 8, 30),
        categoryId: byName('Ingreso'),
        currencyCode: 'DOP',
        description: 'Quincena',
        createdAt: at(0, 8, 30),
      },
      {
        id: 'tx-3',
        userId: 'local-user',
        type: 'Expense',
        amount: 180,
        occurredOn: at(0, 7, 15),
        categoryId: byName('Transporte'),
        currencyCode: 'DOP',
        description: 'Uber',
        createdAt: at(0, 7, 15),
      },
      {
        id: 'tx-4',
        userId: 'local-user',
        type: 'Expense',
        amount: 2450,
        occurredOn: at(1, 18, 20),
        categoryId: byName('Alimentación'),
        currencyCode: 'DOP',
        description: 'Supermercado Nacional',
        createdAt: at(1, 18, 20),
      },
      {
        id: 'tx-5',
        userId: 'local-user',
        type: 'Expense',
        amount: 890,
        occurredOn: at(1, 14, 5),
        categoryId: byName('Compras'),
        currencyCode: 'DOP',
        description: 'Farmacia Carol',
        createdAt: at(1, 14, 5),
      },
      {
        id: 'tx-6',
        userId: 'local-user',
        type: 'Expense',
        amount: 1800,
        occurredOn: at(2, 16, 40),
        categoryId: byName('Transporte'),
        currencyCode: 'DOP',
        description: 'Shell Gas Station',
        createdAt: at(2, 16, 40),
      },
      {
        id: 'tx-7',
        userId: 'local-user',
        type: 'Expense',
        amount: 449,
        occurredOn: at(3, 10, 0),
        categoryId: byName('Entretenimiento'),
        currencyCode: 'DOP',
        description: 'Netflix',
        createdAt: at(3, 10, 0),
      },
      {
        id: 'tx-8',
        userId: 'local-user',
        type: 'Expense',
        amount: 3200,
        occurredOn: at(4, 11, 30),
        categoryId: byName('Hogar'),
        currencyCode: 'DOP',
        description: 'Pago de luz',
        createdAt: at(4, 11, 30),
      },
      {
        id: 'tx-9',
        userId: 'local-user',
        type: 'Income',
        amount: 4500,
        occurredOn: at(5, 9, 0),
        categoryId: byName('Ingreso'),
        currencyCode: 'DOP',
        description: 'Freelance diseño',
        createdAt: at(5, 9, 0),
      },
      {
        id: 'tx-10',
        userId: 'local-user',
        type: 'Expense',
        amount: 1250,
        occurredOn: at(6, 20, 15),
        categoryId: byName('Alimentación'),
        currencyCode: 'DOP',
        description: 'Restaurante El Fogón',
        createdAt: at(6, 20, 15),
      },
      {
        id: 'tx-11',
        userId: 'local-user',
        type: 'Expense',
        amount: 750,
        occurredOn: at(7, 13, 45),
        categoryId: byName('Salud'),
        currencyCode: 'DOP',
        description: 'Consulta médica',
        createdAt: at(7, 13, 45),
      },
      {
        id: 'tx-12',
        userId: 'local-user',
        type: 'Expense',
        amount: 2100,
        occurredOn: at(8, 15, 0),
        categoryId: byName('Servicios'),
        currencyCode: 'DOP',
        description: 'Internet + móvil',
        createdAt: at(8, 15, 0),
      },
      {
        id: 'tx-13',
        userId: 'local-user',
        type: 'Expense',
        amount: 560,
        occurredOn: at(9, 12, 20),
        categoryId: byName('Compras'),
        currencyCode: 'DOP',
        description: 'Artículos de oficina',
        createdAt: at(9, 12, 20),
      },
      {
        id: 'tx-14',
        userId: 'local-user',
        type: 'Income',
        amount: 16350,
        occurredOn: at(14, 8, 0),
        categoryId: byName('Ingreso'),
        currencyCode: 'DOP',
        description: 'Quincena',
        createdAt: at(14, 8, 0),
      },
      {
        id: 'tx-15',
        userId: 'local-user',
        type: 'Expense',
        amount: 980,
        occurredOn: at(10, 19, 30),
        categoryId: byName('Entretenimiento'),
        currencyCode: 'DOP',
        description: 'Cine + snacks',
        createdAt: at(10, 19, 30),
      },
    ];
  }
}
