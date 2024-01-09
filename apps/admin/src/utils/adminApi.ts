import { LoginRequest } from '@biosfera/types';
import { api } from 'types/base';

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwtToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else if (
      !config.url.includes('auth/login') &&
      !config.headers.Authorization
    )
      throw new Error('Admin token invalid');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const setJWT = (token: string) => {
  localStorage.setItem('jwtToken', token);
  localStorage.setItem('time', new Date().toString());
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const logoutUser = async () => {
  try {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('time');
    window.location.href = '/';
  } catch (error) {
    console.error(error);
  }
};

export const loginUser = async (user: LoginRequest) => {
  try {
    const response = await api.post('/auth/login', user);
    console.log(response.data);
    setJWT(response.data.access_token);
    const adminCheck = await api.get('/auth/me');
    if (adminCheck.data.role !== 'super') {
      logoutUser();
      throw new Error('Not superadmin');
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
