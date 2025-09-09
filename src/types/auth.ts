export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  user_type: "medical" | "dental";
  is_active: boolean;
  is_admin: boolean;
  last_login: string | null;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  session_token?: string;
  user?: User;
}

export interface CreateUserData {
  username: string;
  email: string;
  fullName: string;
  userType: "medical" | "dental";
  temporaryPassword?: string;
}

export interface CreateUserResponse {
  success: boolean;
  message: string;
  user_id?: string;
  username?: string;
  temporary_password?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  username?: string;
  temporary_password?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{
    success: boolean;
    error?: string;
    user_type?: "medical" | "dental";
  }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}
