/**
 * Client-side authentication helper functions
 * NOTE: This is NOT imported anywhere in the existing UI
 * It's provided as a standalone utility for future integration
 */

export interface RegisterUserInput {
  email: string;
  password: string;
  displayName?: string;
}

export interface RegisterUserResponse {
  user: {
    id: string | number;
    email: string;
    displayName?: string;
    emailVerified?: boolean;
  };
  message: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
}

export interface AuthError extends Error {
  details?: any;
}

/**
 * Register a new user account
 */
export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResponse> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data?.error || 'Registration failed') as AuthError;
    error.details = data;
    throw error;
  }

  return data as RegisterUserResponse;
}

/**
 * Verify email address with token
 */
export async function verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResponse> {
  const res = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data?.error || 'Email verification failed') as AuthError;
    error.details = data;
    throw error;
  }

  return data as VerifyEmailResponse;
}