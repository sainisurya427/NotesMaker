export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth?: string;
  avatar?: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Array<{ msg: string; param: string }>;
}