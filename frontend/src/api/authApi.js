import axiosClient from './axiosClient';

export function login(credentials) {
  return axiosClient.post('/auth/login', credentials);
}

export function logout() {
  return axiosClient.post('/auth/logout');
}

export function getMe() {
  return axiosClient.get('/auth/me');
}
