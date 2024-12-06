export interface SessionUser {
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  sessionToken?: string;
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  newSessionToken?: string;
}
