import axios, { Axios } from 'axios';

export const baseUrl = 'localhost:5500';
export const api = axios.create({
  baseURL: `http://${baseUrl}`,
});
