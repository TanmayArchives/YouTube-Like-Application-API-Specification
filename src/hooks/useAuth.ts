import { useState, useEffect } from 'react';

interface AuthState {
  token: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    // For now we'll just check localStorage
    const token = localStorage.getItem('auth_token');
    setAuth({
      token,
      isLoading: false,
    });
  }, []);

  return auth;
} 