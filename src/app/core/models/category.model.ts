import { CategoryKind } from './enums';

export interface Category {
  id: string;
  userId: string;
  name: string;
  kind: CategoryKind;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  isSystem?: boolean;
  createdAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  kind: CategoryKind;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}

export interface UpdateCategoryRequest {
  name?: string;
  kind?: CategoryKind;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
}
