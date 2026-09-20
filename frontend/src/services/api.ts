import axios from 'axios'
import type { AuthResponse, CurrentUser } from '../types/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8090',
  headers: { 'Content-Type': 'application/json' },
})

export async function login(email: string, password: string) {
  const response = await api.post<AuthResponse>('/api/auth/login', { email, password })
  return response.data
}

export async function register(email: string, displayName: string, password: string) {
  const response = await api.post<AuthResponse>('/api/auth/register', { email, displayName, password })
  return response.data
}

export async function getCurrentUser(token: string) {
  const response = await api.get<CurrentUser>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
