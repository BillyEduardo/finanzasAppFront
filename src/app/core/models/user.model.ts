export interface User {
  id: string;
  email: string;
  displayName: string;
  currencyCode: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  displayName: string;
  currencyCode: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  expiresAt: string;
  user: User;
}
