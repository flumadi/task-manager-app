// Shared types for the task manager app

export interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface AuthRequest {
  username: string;
  email?: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface TaskRequest {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}