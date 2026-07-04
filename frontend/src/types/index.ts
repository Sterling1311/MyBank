export interface User {
  id: number;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  type?: string;
}

export interface Operation {
  id: number;
  label: string;
  amount: number;
  date: string;
  category: Category;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
}