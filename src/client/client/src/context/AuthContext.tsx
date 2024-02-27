import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { set } from 'mongoose';

// Create a context
export const AuthContext = createContext({
  isLoggedIn: null as boolean | null,
  setIsLoggedIn: (() => {}) as React.Dispatch<
    React.SetStateAction<boolean | null>
  >,
  username: '' as string,
  setUsername: (() => {}) as React.Dispatch<React.SetStateAction<string>>,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/auth/', {
          withCredentials: true,
        });
        if (response.status === 200) {
          setIsLoggedIn(true);
          setUsername(response.data.username);
        }
      } catch (error) {
        setIsLoggedIn(false);
        console.error(error);
      }
    };
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, username, setUsername }}
    >
      {children}
    </AuthContext.Provider>
  );
};
