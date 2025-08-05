'use client';

import { useState, useEffect } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    const checkAuth = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const storedUsername = localStorage.getItem('username');
      
      if (authStatus === 'true' && storedUsername) {
        setIsAuthenticated(true);
        setUsername(storedUsername);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = (username: string) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
  };

  return {
    isAuthenticated,
    username,
    isLoading,
    login,
    logout
  };
}