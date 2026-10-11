import { Injectable, computed, signal } from '@angular/core';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../models/category.model';

const uid = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `cat-${Date.now()}-${Math.random().toString(16).slice(2)}`;

@Injectable({ providedIn: 'root' })
export class CategoriesStore {
  private readonly categoriesSignal = signal<Category[]>(this.seed());

  readonly categories = this.categoriesSignal.asReadonly();

  readonly stats = computed(() => {
    const list = this.categoriesSignal();
    const active = list.filter((c) => c.isActive !== false).length;
    return {
      total: list.length,
      active,
      inactive: list.length - active,
    };
  });

  create(body: CreateCategoryRequest): Category {
    const category: Category = {
      id: uid(),
      userId: 'local-user',
      name: body.name.trim(),
      kind: body.kind,
      description: body.description?.trim() || '',
      color: body.color ?? '#09bc8a',
      icon: body.icon ?? 'tag',
      isActive: body.isActive ?? true,
      isSystem: false,
      createdAt: new Date().toISOString(),
    };

    this.categoriesSignal.update((list) => [category, ...list]);
    return category;
  }

  update(id: string, body: UpdateCategoryRequest): void {
    this.categoriesSignal.update((list) =>
      list.map((c) =>
        c.id === id
          ? {
              ...c,
              ...body,
              name: body.name?.trim() ?? c.name,
              description:
                body.description !== undefined ? body.description.trim() : c.description,
            }
          : c,
      ),
    );
  }

  remove(id: string): void {
    this.categoriesSignal.update((list) => list.filter((c) => c.id !== id));
  }

  toggleActive(id: string): void {
    this.categoriesSignal.update((list) =>
      list.map((c) => (c.id === id ? { ...c, isActive: !(c.isActive !== false) } : c)),
    );
  }

  iconOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'utensils', label: 'Comida' },
      { value: 'fuel', label: 'Transporte' },
      { value: 'home', label: 'Hogar' },
      { value: 'activity', label: 'Salud' },
      { value: 'book-open', label: 'Educación' },
      { value: 'banknote', label: 'Ingresos' },
      { value: 'film', label: 'Ocio' },
      { value: 'shopping-cart', label: 'Compras' },
      { value: 'tag', label: 'Otros' },
      { value: 'wallet', label: 'Billetera' },
    ];
  }

  colorOptions(): string[] {
    return ['#09bc8a', '#004346', '#508991', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#94a3b8'];
  }

  private seed(): Category[] {
    return [
      {
        id: 'cat-1',
        userId: 'local-user',
        name: 'Alimentación',
        kind: 'Expense',
        description: 'Gastos relacionados con comida y bebidas',
        color: '#09bc8a',
        icon: 'utensils',
        isActive: true,
        createdAt: '2025-01-10T10:00:00.000Z',
      },
      {
        id: 'cat-2',
        userId: 'local-user',
        name: 'Transporte',
        kind: 'Expense',
        description: 'Gasolina, transporte público y movilidad',
        color: '#004346',
        icon: 'fuel',
        isActive: true,
        createdAt: '2025-01-10T10:00:00.000Z',
      },
      {
        id: 'cat-3',
        userId: 'local-user',
        name: 'Hogar',
        kind: 'Expense',
        description: 'Servicios, mantenimiento y gastos del hogar',
        color: '#f59e0b',
        icon: 'home',
        isActive: true,
        createdAt: '2025-01-11T10:00:00.000Z',
      },
      {
        id: 'cat-4',
        userId: 'local-user',
        name: 'Salud',
        kind: 'Expense',
        description: 'Consultas médicas, farmacia y seguros',
        color: '#ef4444',
        icon: 'activity',
        isActive: true,
        createdAt: '2025-01-12T10:00:00.000Z',
      },
      {
        id: 'cat-5',
        userId: 'local-user',
        name: 'Educación',
        kind: 'Expense',
        description: 'Cursos, libros y formación profesional',
        color: '#8b5cf6',
        icon: 'book-open',
        isActive: true,
        createdAt: '2025-01-13T10:00:00.000Z',
      },
      {
        id: 'cat-6',
        userId: 'local-user',
        name: 'Ingreso',
        kind: 'Income',
        description: 'Salario, trabajos freelance, bonos',
        color: '#09bc8a',
        icon: 'banknote',
        isActive: true,
        createdAt: '2025-01-14T10:00:00.000Z',
      },
      {
        id: 'cat-7',
        userId: 'local-user',
        name: 'Entretenimiento',
        kind: 'Expense',
        description: 'Cine, streaming y actividades de ocio',
        color: '#3b82f6',
        icon: 'film',
        isActive: true,
        createdAt: '2025-01-15T10:00:00.000Z',
      },
      {
        id: 'cat-8',
        userId: 'local-user',
        name: 'Compras',
        kind: 'Expense',
        description: 'Ropa, electrónicos y compras generales',
        color: '#508991',
        icon: 'shopping-cart',
        isActive: true,
        createdAt: '2025-01-16T10:00:00.000Z',
      },
      {
        id: 'cat-9',
        userId: 'local-user',
        name: 'Ahorro',
        kind: 'Both',
        description: 'Transferencias a metas y fondos de ahorro',
        color: '#0f766e',
        icon: 'wallet',
        isActive: true,
        createdAt: '2025-01-17T10:00:00.000Z',
      },
      {
        id: 'cat-10',
        userId: 'local-user',
        name: 'Servicios',
        kind: 'Expense',
        description: 'Internet, telefonía y suscripciones',
        color: '#6366f1',
        icon: 'zap',
        isActive: true,
        createdAt: '2025-01-18T10:00:00.000Z',
      },
      {
        id: 'cat-11',
        userId: 'local-user',
        name: 'Regalos',
        kind: 'Expense',
        description: 'Cumpleaños, celebraciones y regalos',
        color: '#ec4899',
        icon: 'tag',
        isActive: true,
        createdAt: '2025-01-19T10:00:00.000Z',
      },
      {
        id: 'cat-12',
        userId: 'local-user',
        name: 'Otros',
        kind: 'Expense',
        description: 'Otros gastos no categorizados',
        color: '#94a3b8',
        icon: 'tag',
        isActive: false,
        createdAt: '2025-01-20T10:00:00.000Z',
      },
    ];
  }
}
