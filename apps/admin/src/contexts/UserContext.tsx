'use client';

import { getMe } from 'utils/adminApi';
import React, {
  Dispatch,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Role } from '@biosfera/types';

export interface User {
  id: string;
  email: string;
  role: Role;
}

interface UserContextProps {
  user?: User;
  logout?: () => void;
  setUser: Dispatch<User>;
  loading: boolean;
  initLoad: () => void;
}

const defaultUserContext: UserContextProps = {
  user: undefined,
  logout: () => {},
  setUser: () => {},
  loading: false,
  initLoad: async() => {},
};

export const UserContext = createContext<UserContextProps>(defaultUserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const getMyData = async () => {
    const response = await getMe();
    if (response) {
      setUser(response);
      return;
    }
    setUser(undefined);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('time');
    setUser(undefined);
  };

  const initLoad = async () => {
    const user = localStorage.getItem('jwtToken');
    const loggInDate = localStorage.getItem('time');
    console.log(user, loggInDate);
    if (!user || !loggInDate) {
      setLoading(false);
      alert('Please login as admin to view this page');
      window.location.href = '/auth/sign-in';
      console.log('no user');
      return;
    }
    const time = new Date(loggInDate).getTime();
    console.log(time, user);
    if (Date.now() - time > 1000 * 3600 * 24) {
      logout();
      console.log('logout');
      alert('Please login as admin to view this page');
      window.location.href = '/auth/sign-in';
      setLoading(false);
      return;
    }

    const adminCheck = await getMe();
    if (
      adminCheck.role !== 'super' &&
      !window.location.href.includes('/auth/sign-in')
    ) {
      logout();
      console.log('logout');
      alert('Please login as admin to view this page');
      window.location.href = '/auth/sign-in';
      setLoading(false);
      return;
    }

    await getMyData();
  };

  useEffect(() => {
    initLoad();
  }, []);

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  useEffect(() => {
    onUserLoad();
  }, [user]);

  const onUserLoad = async () => {
    setLoading(true);
    if (!user) {
      if (!localStorage.getItem('jwtToken')) {
        setLoading(false);
        return;
      }
      return;
    }

    const adminCheck = await getMe();
    if (
      adminCheck.role !== 'super' &&
      !window.location.href.includes('/auth/sign-in')
    ) {
      logout();
      console.log('logout');
      alert('Please login as admin to view this page');
      window.location.href = '/auth/sign-in';
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        loading,
        initLoad,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUser = () => useContext(UserContext);
export default useUser;
