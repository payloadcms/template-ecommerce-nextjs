import React, { useState, createContext, useContext, useEffect, useCallback } from 'react';
import { User } from '../../payload-types';

type Login = (args: { email: string; password: string }) => Promise<void>;

type Logout = () => Promise<void>;

type AuthContext = {
  user?: User | null;
  setUser: (user: User | null) => void;
  logout: Logout;
  login: Login;
};

const Context = createContext({} as AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>();

  const login = useCallback<Login>(async (args) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/users/login`, {
      method: 'POST',
      body: JSON.stringify(args),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const json = await res.json();
      setUser(json.user);
    } else {
      throw new Error('Invalid login');
    }
  }, []);

  const logout = useCallback<Logout>(async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/users/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (res.ok) {
      setUser(null);
    } else {
      throw new Error('There was a problem while logging out.');
    }

  }, []);

  useEffect(() => {
    const fetchMe = async () => {
      const result = await fetch(`${process.env.NEXT_PUBLIC_CMS_URL}/api/users/me`, {
        credentials: 'include',
      }).then((req) => req.json());
      setUser(result.user || null);
    };

    fetchMe();
  }, []);

  return (
    <Context.Provider
      value={{
        user,
        setUser,
        login,
        logout,
      }}
    >
      {children}
    </Context.Provider>
  );
};

type UseAuth<T = User> = () => AuthContext;

export const useAuth: UseAuth = () => useContext(Context);
