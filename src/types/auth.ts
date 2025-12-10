export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'merchant' | 'admin';
  avatar?: string;
  phone?: string;
  address?: Address;
  createdAt: string;
  lastLogin: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
  termsAcceptedVersion?: string;
  newsletterConsent?: boolean;
  cookiesConsent?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'customer' | 'merchant';
  storeName?: string; // optional, required when role is merchant
  agreeToTerms?: boolean;
  newsletterConsent?: boolean;
  cookiesConsent?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  updateUser: (user: User) => void;
}
