import axios, { Axios } from 'axios';

export const baseUrl = 'localhost:5500';
export const token = localStorage.getItem('token');
export const api = axios.create({
  baseURL: `http://${baseUrl}`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: token && `Bearer ${token}`,
  },
});
